"use client";

import React from "react";
import { format, startOfWeek, addDays } from "date-fns";
import {
  getICTFractionalHour,
  formatICTTime,
  getICTDate,
  formatICTDateToLocalString,
} from "@/lib/timezone";

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

interface TimekeepingWeekViewProps {
  date: Date;
  logs: TimekeepingLog[];
  schedules: ShiftSchedule[];
}

const SHIFT_TYPES = [
  { id: "SANG", label: "Sáng\n(5h30-12h)", start: 5.5, end: 12 },
  { id: "CHIEU", label: "Chiều\n(12h-18h)", start: 12, end: 18 },
  { id: "TOI", label: "Tối\n(18h-22h)", start: 18, end: 22 },
  { id: "DEM", label: "Đêm\n(22h-2.5h)", start: 22, end: 26.5 },
] as const;

function isTimeInShift(time: Date, shift: (typeof SHIFT_TYPES)[number]) {
  const hours = getICTFractionalHour(time);
  if (shift.id === "DEM") {
    return hours >= 22 || hours < 2.5;
  }
  return hours >= shift.start && hours < shift.end;
}

export default function TimekeepingWeekView({
  date,
  logs,
  schedules,
}: TimekeepingWeekViewProps) {
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-sm">
        <table className="w-full text-sm text-left border-collapse min-w-max">
          <thead className="text-xs text-center uppercase bg-[#accdfc] dark:bg-blue-900/40 text-gray-800 dark:text-gray-200 border-b-2 border-blue-400">
            <tr>
              <th className="px-4 py-4 border-r border-blue-300 dark:border-blue-700 font-bold sticky left-0 z-20 bg-[#accdfc] dark:bg-blue-900 min-w-[140px]">
                Ca Làm Việc
              </th>
              {weekDays.map((day, idx) => (
                <th
                  key={idx}
                  className="px-2 py-4 border-r border-blue-300 dark:border-blue-700 min-w-[160px]"
                >
                  <div className="font-bold text-sm mb-1">{dayNames[idx]}</div>
                  <div className="text-[11px] font-medium text-blue-800 dark:text-blue-300">
                    {format(day, "dd/MM")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_TYPES.map((shiftRow) => {
              // Get scheduled users for this shift (applies generally across all days in this view)
              const scheduledUserIds = schedules
                .filter((s) => s.shift_type === shiftRow.id)
                .map((s) => s.user_id);

              return (
                <tr
                  key={shiftRow.id}
                  className="bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <td className="px-2 py-10 border-r border-b border-gray-200 dark:border-gray-700 text-center sticky left-0 z-10 bg-[#fdeecb] dark:bg-orange-950/30 align-middle font-medium whitespace-pre-line text-xs font-serif text-gray-800 dark:text-gray-200">
                    {shiftRow.label}
                  </td>
                  {weekDays.map((day, idx) => {
                    // Filter logs for this exact day AND this exact shift
                    const cellLogs = logs.filter((log) => {
                      const logDateICT = getICTDate(log.check_in_time);
                      const isSameDate =
                        formatICTDateToLocalString(logDateICT) ===
                        formatICTDateToLocalString(day);
                      const inShift = isTimeInShift(
                        log.check_in_time,
                        shiftRow,
                      );
                      return isSameDate && inShift;
                    });

                    return (
                      <td
                        key={idx}
                        className="px-2 py-2 border-r border-b border-gray-200 dark:border-gray-700 align-top bg-white dark:bg-gray-900 min-w-[200px]"
                      >
                        <div className="flex flex-col gap-2">
                          {cellLogs.length === 0 ? (
                            <div className="py-4 text-center text-gray-300 dark:text-gray-600 italic text-[10px]">
                              -
                            </div>
                          ) : (
                            cellLogs.map((log) => (
                              <div
                                key={log.id}
                                className={`flex flex-col gap-1 px-2 py-1.5 border rounded-md ${
                                  scheduledUserIds.includes(log.user_id)
                                    ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-800 dark:text-gray-100 uppercase text-[10px] truncate max-w-[90px]">
                                    {log.user.fullName || log.user.username}
                                  </span>
                                  {!scheduledUserIds.includes(log.user_id) && (
                                    <span className="text-[8px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1 rounded">
                                      Ngoài ca
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                                  <span>
                                    {formatICTTime(log.check_in_time)}
                                  </span>
                                  {log.check_out_time && (
                                    <span className="text-gray-400 dark:text-gray-500 mx-1">
                                      -
                                    </span>
                                  )}
                                  {log.check_out_time && (
                                    <span>
                                      {formatICTTime(log.check_out_time)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
