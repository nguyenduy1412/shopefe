import { Suspense } from "react";
import ShiftCalendarTable from "@/components/timekeeping/ShiftCalendarTable";
import TimekeepingTable from "@/components/timekeeping/TimekeepingTable";
import { getWeeklyShiftsAction } from "@/app/actions/shift";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addWeeks, subWeeks, format, getDaysInMonth } from "date-fns";
import TimekeepingTabs from "@/components/timekeeping/TimekeepingTabs";
import TimekeepingLoading from "./loading";
import TimekeepingDayView from "@/components/timekeeping/TimekeepingDayView";
import TimekeepingWeekView from "@/components/timekeeping/TimekeepingWeekView";
import { startOfWeek, endOfWeek } from "date-fns";
import { getICTNow, getICTDate, parseICTDate } from "@/lib/timezone";
import {
  ShiftRegistrationProvider,
  ShiftRegistrationWeekGrid,
  ShiftRegistrationMobileList,
} from "@/components/timekeeping/shift-registration/ShiftRegistration";
import { getSession } from "@/app/actions/shift";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export const revalidate = 0; // Dynamic data

async function ShiftCalendarWrapper({ currentDate }: { currentDate: Date }) {
  // Fetch shifts for the selected week
  const shiftResponse = await getWeeklyShiftsAction(currentDate.toISOString());
  const shifts = shiftResponse.data || [];

  // Fetch all active users for the dropdown
  const allUsers = await prisma.user.findMany({
    where: { status: 1, deletedAt: null },
    select: { id: true, fullName: true, username: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <ShiftCalendarTable
      currentDate={currentDate}
      shifts={shifts}
      allUsers={allUsers}
    />
  );
}

async function TimekeepingHistoryWrapper({
  viewMode,
  date,
  month,
  year,
  search,
}: {
  viewMode: string;
  date: Date;
  month: number;
  year: number;
  search?: string;
}) {
  const userFilter = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  // 1. Day View Logic
  if (viewMode === "day") {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.timekeeping.findMany({
      where: {
        OR: [
          { date: date },
          { check_in_time: { gte: startOfDay, lte: endOfDay } },
        ],
        user: { status: 1, deletedAt: null, ...userFilter },
      },
      include: { user: true },
    });
    const schedules = await prisma.shift_schedule.findMany({
      where: { date: date },
    });
    return (
      <TimekeepingDayView
        date={date}
        logs={logs.map((l) => ({ ...l, date: new Date(l.date) }))}
        schedules={schedules}
      />
    );
  }

  // Common logic for Week and Month views: Fetch logs in range and group by ICT date
  const startDate =
    viewMode === "week"
      ? startOfWeek(date, { weekStartsOn: 1 })
      : new Date(year, month - 1, 1);
  const endDate =
    viewMode === "week"
      ? endOfWeek(date, { weekStartsOn: 1 })
      : new Date(year, month, 0, 23, 59, 59, 999);

  const logs = await prisma.timekeeping.findMany({
    where: {
      check_in_time: { gte: startDate, lte: endDate },
      user: { status: 1, deletedAt: null, ...userFilter },
    },
    include: { user: true },
    orderBy: { check_in_time: "asc" },
  });

  const groupedData: Record<
    string,
    {
      user: {
        id: string;
        fullName: string | null;
        username: string;
        name: string;
      };
      dailyHours: Record<string, { hours: number; minutes: number }>;
      totalMinutes: number;
    }
  > = {};

  logs.forEach((log) => {
    if (!groupedData[log.user_id]) {
      groupedData[log.user_id] = {
        user: {
          id: log.user_id,
          fullName: log.user.fullName,
          username: log.user.username,
          name: log.user.fullName || log.user.username,
        },
        dailyHours: {},
        totalMinutes: 0,
      };
    }

    if (log.check_in_time && log.check_out_time) {
      const diffMs = log.check_out_time.getTime() - log.check_in_time.getTime();
      const mins = Math.floor(diffMs / (1000 * 60));

      // Determine the ICT date string to key the dailyHours
      const ictDate = getICTDate(log.check_in_time);
      const dateKey =
        viewMode === "week"
          ? format(ictDate, "yyyy-MM-dd")
          : ictDate.getDate().toString();

      if (!groupedData[log.user_id].dailyHours[dateKey]) {
        groupedData[log.user_id].dailyHours[dateKey] = { hours: 0, minutes: 0 };
      }

      const current = groupedData[log.user_id].dailyHours[dateKey];
      const newMins = current.minutes + mins;
      groupedData[log.user_id].dailyHours[dateKey] = {
        hours: current.hours + Math.floor(newMins / 60),
        minutes: newMins % 60,
      };
      groupedData[log.user_id].totalMinutes += mins;
    }
  });

  const schedules = await prisma.shift_schedule.findMany({
    where: {
      user: { status: 1, deletedAt: null, ...userFilter },
    },
    select: {
      user_id: true,
      shift_type: true,
    },
  });

  if (viewMode === "week") {
    return (
      <TimekeepingWeekView date={date} logs={logs} schedules={schedules} />
    );
  }
  // Month View
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const finalRows = Object.values(groupedData).map((d) => ({
    user: d.user,
    days: d.dailyHours as Record<number, { hours: number; minutes: number }>,
    totalHours: Math.floor(d.totalMinutes / 60),
    totalMinutes: d.totalMinutes % 60,
  }));

  return (
    <TimekeepingTable
      rows={finalRows}
      daysInMonth={daysInMonth}
      month={month}
      year={year}
    />
  );
}

async function EmployeeShiftRegistrationWrapper({
  currentDate,
  userId,
}: {
  currentDate: Date;
  userId: string;
}) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  const shifts = await prisma.shift_schedule.findMany({
    where: {
      user_id: userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  return (
    <ShiftRegistrationProvider currentDate={currentDate} shifts={shifts}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="hidden md:block">
          <ShiftRegistrationWeekGrid />
        </div>
        <div className="block md:hidden bg-slate-50 dark:bg-slate-950 p-4 min-h-[500px]">
          <ShiftRegistrationMobileList />
        </div>
      </div>
    </ShiftRegistrationProvider>
  );
}

interface TimekeepingPageProps {
  searchParams: Promise<{
    date?: string;
    tab?: string;
    view?: string;
    month?: string;
    year?: string;
    search?: string;
  }>;
}

export default async function TimekeepingPage({
  searchParams,
}: TimekeepingPageProps) {
  const unwrappedParams = await searchParams;
  const {
    data: { user },
  } = await getSession();

  if (!user) {
    redirect("/");
  }

  const activeTab = unwrappedParams.tab || "schedule";
  const viewMode =
    unwrappedParams.view || (activeTab === "history" ? "day" : "month");
  const search = unwrappedParams.search || "";

  // Date logic for Shift Schedule
  const currentDate = unwrappedParams.date
    ? parseICTDate(unwrappedParams.date)
    : getICTDate(getICTNow());

  // Step navigation based on mode
  let prevDate, nextDate;
  if (activeTab === "schedule") {
    prevDate = subWeeks(currentDate, 1);
    nextDate = addWeeks(currentDate, 1);
  } else {
    // History tab
    if (viewMode === "day") {
      prevDate = new Date(currentDate);
      prevDate.setDate(currentDate.getDate() - 1);
      nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
    } else if (viewMode === "week") {
      prevDate = subWeeks(currentDate, 1);
      nextDate = addWeeks(currentDate, 1);
    } else {
      // Month view uses specific month/year params
      // but we still define dates for the header
      prevDate = currentDate;
      nextDate = currentDate;
    }
  }

  // Date logic for History
  const currentMonth = unwrappedParams.month
    ? parseInt(unwrappedParams.month)
    : getICTNow().getMonth() + 1;
  const currentYear = unwrappedParams.year
    ? parseInt(unwrappedParams.year)
    : getICTNow().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {activeTab === "schedule" ? "Xếp Ca Làm Việc" : "Dữ liệu Chấm Công"}
          </h1>
          <p className="text-sm text-gray-500">
            {activeTab === "schedule"
              ? `Kế hoạch nhân sự Tuần từ ${format(currentDate, "dd/MM/yyyy")}`
              : `Lịch sử ghi nhận giờ làm - ${viewMode === "day" ? `Ngày ${format(currentDate, "dd/MM/yyyy")}` : `Tháng ${currentMonth}/${currentYear}`}`}
          </p>
        </div>

        {(activeTab === "schedule" ||
          (activeTab === "history" && viewMode !== "month")) && (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/timekeeping?tab=${activeTab}&view=${viewMode}&date=${prevDate.toISOString()}`}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <span className="text-sm font-medium px-2">
              {activeTab === "schedule"
                ? "Tuần này"
                : viewMode === "day"
                  ? "Ngày này"
                  : "Tuần này"}
            </span>
            <Link
              href={`/dashboard/timekeeping?tab=${activeTab}&view=${viewMode}&date=${nextDate.toISOString()}`}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
          </div>
        )}
      </div>

      <TimekeepingTabs />

      <div className="rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
        <Suspense
          key={`${activeTab}-${viewMode}-${currentDate.toISOString()}-${currentMonth}-${currentYear}-${search}`}
          fallback={<TimekeepingLoading />}
        >
          {activeTab === "schedule" ? (
            <ShiftCalendarWrapper currentDate={currentDate} />
          ) : activeTab === "register" ? (
            <EmployeeShiftRegistrationWrapper
              currentDate={currentDate}
              userId={user.id}
            />
          ) : (
            <TimekeepingHistoryWrapper
              viewMode={viewMode}
              date={currentDate}
              month={currentMonth}
              year={currentYear}
              search={search}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
