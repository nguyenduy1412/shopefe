import { PrismaClient } from "@/lib/generated/prisma";
import { endOfMonth, startOfMonth } from "date-fns";

const prisma = new PrismaClient();

export const TimekeepingService = {
  async getMonthlyData(year: number, month: number) {
    // Note: month is 1-indexed (1-12)
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // Fetch all users who are employees or admins (status active)
    const users = await prisma.user.findMany({
      where: {
        status: 1, // Only active users
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Fetch all timekeeping records within the month
    const records = await prisma.timekeeping.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        user_id: true,
        date: true,
        check_in_time: true,
        check_out_time: true,
        status: true,
      },
    });

    return { users, records };
  },
};
