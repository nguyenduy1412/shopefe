import { Suspense } from "react";
import { PrismaClient } from "@/lib/generated/prisma";
import { getSession } from "@/app/actions/shift";
import { redirect } from "next/navigation";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from "date-fns";
import { getICTNow, getICTDate, parseICTDate } from "@/lib/timezone";
import {
  ShiftRegistrationProvider,
  ShiftRegistrationWeekGrid,
  ShiftRegistrationMobileList,
} from "@/components/timekeeping/shift-registration/ShiftRegistration";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

async function EmployeeShiftRegistrationWrapper({
  currentDate,
  userId,
}: {
  currentDate: Date;
  userId: string;
}) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Get current user shifts for the week
  const shifts = await prisma.shift_schedule.findMany({
    where: {
      user_id: userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <ShiftRegistrationProvider currentDate={currentDate} shifts={shifts}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block">
          <ShiftRegistrationWeekGrid />
        </div>
        {/* Mobile View */}
        <div className="block md:hidden bg-slate-50 dark:bg-slate-950 p-4 min-h-[500px]">
          <ShiftRegistrationMobileList />
        </div>
      </div>
    </ShiftRegistrationProvider>
  );
}

export default async function ShiftsPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const {
    data: { user },
  } = await getSession();

  if (!user) {
    redirect("/");
  }

  const currentDate = searchParams.date
    ? parseICTDate(searchParams.date)
    : getICTDate(getICTNow());

  const prevDate = subWeeks(currentDate, 1);
  const nextDate = addWeeks(currentDate, 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Đăng ký ca làm
            </h1>
            <p className="text-sm text-slate-500">
              Cập nhật lịch làm việc của bạn - Tuần bắt đầu từ{" "}
              {format(
                startOfWeek(currentDate, { weekStartsOn: 1 }),
                "dd/MM/yyyy",
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 hidden md:block">
            Lịch đăng ký
          </h2>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm md:ml-auto w-full md:w-auto justify-between md:justify-start">
            <Link
              href={`/shifts?date=${prevDate.toISOString()}`}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <span className="text-sm font-medium px-4 text-slate-700 dark:text-slate-300">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM")} -{" "}
              {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                "dd/MM/yyyy",
              )}
            </span>
            <Link
              href={`/shifts?date=${nextDate.toISOString()}`}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
          </div>
        </div>

        <Suspense
          key={currentDate.toISOString()}
          fallback={
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Desktop Skeleton View */}
              <div className="hidden md:block">
                <table className="w-full text-sm text-left border-collapse table-fixed">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <th
                          key={idx}
                          className="p-4 border-r border-b border-slate-200 dark:border-slate-700"
                        >
                          <div className="h-6 rounded w-full skeleton-shimmer"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }).map((_, rowIdx) => (
                      <tr key={rowIdx}>
                        {Array.from({ length: 8 }).map((_, colIdx) => (
                          <td
                            key={colIdx}
                            className="p-2 border-r border-b border-slate-200 dark:border-slate-700 h-20 align-middle"
                          >
                            <div className="h-14 rounded-lg w-full skeleton-shimmer"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Skeleton View */}
              <div className="block md:hidden bg-slate-50 dark:bg-slate-950 p-4 min-h-[500px]">
                <div className="flex flex-col gap-6">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800"
                    >
                      <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                        <div className="h-10 w-10 rounded-lg skeleton-shimmer"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/2 rounded skeleton-shimmer"></div>
                          <div className="h-3 w-1/3 rounded skeleton-shimmer"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, btnIdx) => (
                          <div
                            key={btnIdx}
                            className="h-16 rounded-xl skeleton-shimmer w-full"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <EmployeeShiftRegistrationWrapper
            currentDate={currentDate}
            userId={user.id}
          />
        </Suspense>
      </div>
    </div>
  );
}
