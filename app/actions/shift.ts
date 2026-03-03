"use server";

import { PrismaClient } from "@/lib/generated/prisma";
import { getMockSession } from "./auth";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";
import { parseICTDate } from "@/lib/timezone";

const prisma = new PrismaClient();

// Re-export session helper
export const getSession = getMockSession;

export async function getWeeklyShiftsAction(dateString: string) {
  try {
    const {
      data: { user },
    } = await getMockSession();
    if (!user) return { success: false, error: "Unauthorized" };

    const date = parseISO(dateString);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });

    const shifts = await prisma.shift_schedule.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
      },
    });

    return { success: true, data: shifts };
  } catch (error) {
    console.error("Error fetching weekly shifts:", error);
    return { success: false, error: "Lỗi tải dữ liệu ca làm" };
  }
}

export async function assignShiftAction(
  userId: string,
  dateStr: string,
  shiftType: string,
) {
  try {
    const {
      data: { user },
    } = await getMockSession();
    if (!user) return { success: false, error: "Unauthorized" };

    const date = parseICTDate(dateStr);

    const newShift = await prisma.shift_schedule.create({
      data: {
        user_id: userId,
        date,
        shift_type: shiftType,
      },
    });

    return { success: true, data: newShift };
  } catch (error) {
    console.error("Error assigning shift:", error);
    return { success: false, error: "Lỗi thêm lịch trực" };
  }
}

export async function removeShiftAction(shiftId: string) {
  try {
    const {
      data: { user },
    } = await getMockSession();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.shift_schedule.delete({
      where: { id: shiftId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing shift:", error);
    return { success: false, error: "Lỗi xóa lịch trực" };
  }
}

export async function registerMyShiftAction(
  dateStr: string,
  shiftType: string,
) {
  try {
    const {
      data: { user },
    } = await getMockSession();
    if (!user) return { success: false, error: "Unauthorized" };

    const date = parseICTDate(dateStr);

    // Prevent duplicate registration for same type and date
    const existing = await prisma.shift_schedule.findFirst({
      where: { user_id: user.id, date, shift_type: shiftType },
    });

    if (existing) {
      return { success: false, error: "Ca làm này bạn đã đăng ký rồi!" };
    }

    const newShift = await prisma.shift_schedule.create({
      data: {
        user_id: user.id,
        date,
        shift_type: shiftType,
      },
    });

    return { success: true, data: newShift };
  } catch (error) {
    console.error("Error registering my shift:", error);
    return { success: false, error: "Lỗi đăng ký ca làm" };
  }
}

export async function cancelMyShiftAction(shiftId: string) {
  try {
    const {
      data: { user },
    } = await getMockSession();
    if (!user) return { success: false, error: "Unauthorized" };

    const shift = await prisma.shift_schedule.findUnique({
      where: { id: shiftId },
    });

    if (!shift) return { success: false, error: "Không tìm thấy ca làm" };
    if (shift.user_id !== user.id)
      return { success: false, error: "Không thể hủy ca của người khác" };

    await prisma.shift_schedule.delete({
      where: { id: shiftId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error canceling my shift:", error);
    return { success: false, error: "Lỗi hủy ca làm" };
  }
}
