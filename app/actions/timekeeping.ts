"use server";

import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";
import { getICTNow, getICTDate } from "@/lib/timezone";

import { getMockSession } from "./auth";

const prisma = new PrismaClient();

export async function checkInAction() {
  const {
    data: { user },
  } = await getMockSession();
  if (!user) return { error: "Không tìm thấy phiên đăng nhập" };

  // Helper from NextJS headers
  const headerStore = await headers();
  let ip = headerStore.get("x-forwarded-for") || "Unknown IP";

  // Xử lý chuỗi IP (nếu chạy qua Proxy/Ngrok nó sẽ là một dải "ip1, ip2, ...")
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  const companyIp = process.env.NEXT_PUBLIC_COMPANY_IP;

  if (
    companyIp &&
    ip !== companyIp &&
    ip !== "::1" &&
    ip !== "127.0.0.1" &&
    ip !== "Unknown IP"
  ) {
    return {
      error: "Kết nối wifi Mang2 để checkin/out",
    };
  }

  const userAgent = headerStore.get("user-agent") || "Unknown Device";

  const now = getICTNow();
  const today = getICTDate(now);

  try {
    // Check if already checked in today
    const existing = await prisma.timekeeping.findFirst({
      where: {
        user_id: user.id,
        date: today,
      },
    });

    if (existing) {
      return { error: "Bạn đã check-in ngày hôm nay rồi!" };
    }

    await prisma.timekeeping.create({
      data: {
        user_id: user.id,
        date: today,
        check_in_time: now,
        ip_address: ip,
        device_info: userAgent,
        status: "ON_TIME", // Default valid
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Check-in error", error);
    return { error: "Lệch đồng bộ dữ liệu lúc check-in" };
  }
}

export async function checkOutAction() {
  const {
    data: { user },
  } = await getMockSession();
  if (!user) return { error: "Không tìm thấy phiên đăng nhập" };

  // Helper from NextJS headers
  const headerStore = await headers();
  let ip = headerStore.get("x-forwarded-for") || "Unknown IP";

  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  const companyIp = process.env.NEXT_PUBLIC_COMPANY_IP;

  if (
    companyIp &&
    ip !== companyIp &&
    ip !== "::1" &&
    ip !== "127.0.0.1" &&
    ip !== "Unknown IP"
  ) {
    return {
      error: "Kết nối wifi Mang2 để checkin/out",
    };
  }
  const now = getICTNow();
  const today = getICTDate(now);

  try {
    const existing = await prisma.timekeeping.findFirst({
      where: {
        user_id: user.id,
        date: today,
      },
    });

    if (!existing) {
      return { error: "Không tìm thấy dữ liệu check-in hôm nay." };
    }

    if (existing.check_out_time) {
      return { error: "Hôm nay bạn đã check-out rồi." };
    }

    await prisma.timekeeping.update({
      where: { id: existing.id },
      data: {
        check_out_time: now,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Check-out error:", error);
    return { error: "Lệch đồng bộ lúc check-out" };
  }
}
