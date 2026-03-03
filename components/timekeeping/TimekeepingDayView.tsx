"use client";

import React from "react";
import { format } from "date-fns";
import { getICTFractionalHour, formatICTTime } from "@/lib/timezone";

interface User {
  id: string;
  fullName: string | null;
  username: string;
}

interface TimekeepingLog {
  id: string;
  user_id: string;
  date: Date;
  check_in_time: Date;
  check_out_time: Date | null;
  user: User;
}

interface ShiftSchedule {
  user_id: string;
  shift_type: string;
}

interface TimekeepingDayViewProps {
  date: Date;
  logs: TimekeepingLog[];
  schedules: ShiftSchedule[];
}

const SHIFT_TYPES = [
  { id: "SANG", label: "Sáng\n(5h30-12h)", start: 5.5, end: 12 },
  { id: "CHIEU", label: "Chiều\n(12h-18h)", start: 12, end: 18 },
  { id: "TOI", label: "Tối\n(18h-22h)", start: 18, end: 22 },
  { id: "DEM", label: "Đêm\n(22h-2.5h)", start: 22, end: 26.5 }, // 2.5h next day
] as const;

function isTimeInShift(time: Date, shift: (typeof SHIFT_TYPES)[number]) {
  const hours = getICTFractionalHour(time);

  if (shift.id === "DEM") {
    // Night shift spans across midnight (22h to 2h30)
    return hours >= 22 || hours < 2.5;
  }

  return hours >= shift.start && hours < shift.end;
}

export default function TimekeepingDayView({
  date,
  logs,
  schedules,
}: TimekeepingDayViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-sm">
        <table className="w-full text-sm text-left border-collapse min-w-max">
          <thead className="text-xs text-center uppercase bg-[#accdfc] dark:bg-blue-900/40 text-gray-800 dark:text-gray-200 border-b-2 border-blue-400">
            <tr>
              <th className="px-4 py-4 border-r border-blue-300 dark:border-blue-700 font-bold sticky left-0 z-20 bg-[#accdfc] dark:bg-blue-900 min-w-[140px]">
                Ca Làm Việc
              </th>
              <th className="px-4 py-4 border-r border-blue-300 dark:border-blue-700 font-bold">
                Chi tiết chấm công ngày {format(date, "dd/MM/yyyy")}
              </th>
            </tr>
          </thead>
          <tbody>
            {SHIFT_TYPES.map((shiftRow) => {
              // Find users scheduled for this shift
              const scheduledUserIds = schedules
                .filter((s) => s.shift_type === shiftRow.id)
                .map((s) => s.user_id);

              // Find logs that match the time range of this shift
              const shiftLogs = logs.filter((log) => {
                return isTimeInShift(log.check_in_time, shiftRow);
              });

              return (
                <tr
                  key={shiftRow.id}
                  className="bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <td className="px-2 py-10 border-r border-b border-gray-200 dark:border-gray-700 text-center sticky left-0 z-10 bg-[#fdeecb] dark:bg-orange-950/30 align-middle font-medium whitespace-pre-line text-xs font-serif text-gray-800 dark:text-gray-200">
                    {shiftRow.label}
                  </td>
                  <td className="px-4 py-4 border-r border-b border-gray-200 dark:border-gray-700 min-w-[400px] align-top bg-white dark:bg-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {shiftLogs.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-gray-400 italic text-xs">
                          Chưa có ai chấm công trong ca này
                        </div>
                      ) : (
                        shiftLogs.map((log) => (
                          <div
                            key={log.id}
                            className={`flex flex-col gap-1 px-3 py-2 border rounded-md ${
                              scheduledUserIds.includes(log.user_id)
                                ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-800 dark:text-gray-100 uppercase text-xs truncate">
                                {log.user.fullName || log.user.username}
                              </span>
                              {!scheduledUserIds.includes(log.user_id) && (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1 rounded">
                                  Ngoài ca
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                              <span>
                                Vào: {formatICTTime(log.check_in_time)}
                              </span>
                              {log.check_out_time && (
                                <span>
                                  Ra: {formatICTTime(log.check_out_time)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
