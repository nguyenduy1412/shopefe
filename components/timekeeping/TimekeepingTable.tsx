"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { getICTNow } from "@/lib/timezone";

interface TimekeepingRowData {
  user: { id: string; name: string };
  totalHours: number;
  totalMinutes: number;
  days: Record<number, { hours: number; minutes: number }>;
}

interface TimekeepingTableProps {
  rows: TimekeepingRowData[];
  daysInMonth: number;
  month: number;
  year: number;
}

export default function TimekeepingTable({
  rows,
  daysInMonth,
  month,
  year,
}: TimekeepingTableProps) {
  const router = useRouter();
  const currentYear = getICTNow().getFullYear();

  // Create array from 1 to daysInMonth
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getWeeks = () => {
    const weeks: { name: string; days: number[] }[] = [];
    let currentWeekDays: number[] = [];
    let weekIndex = 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      currentWeekDays.push(d);

      if (date.getDay() === 0 || d === daysInMonth) {
        weeks.push({ name: `Tuần ${weekIndex}`, days: currentWeekDays });
        currentWeekDays = [];
        weekIndex++;
      }
    }
    return weeks;
  };

  const weeks = getWeeks();
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number | "all">("all");

  const visibleDays =
    selectedWeekIdx === "all"
      ? daysArray
      : weeks[selectedWeekIdx as number]?.days || daysArray;

  const handleMonthChange = (newMonth: string) => {
    setSelectedWeekIdx("all");
    router.push(`/dashboard/timekeeping?month=${newMonth}&year=${year}`);
  };

  const handleYearChange = (newYear: string) => {
    router.push(`/dashboard/timekeeping?month=${month}&year=${newYear}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Toolbar */}
      <div className="flex gap-4 mb-4">
        <div className="w-40">
          <Select
            value={month.toString()}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m.toString()}>
                Tháng {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-40">
          <Select
            value={year.toString()}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y.toString()}>
                Năm {y}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-64">
          <Select
            value={selectedWeekIdx.toString()}
            onChange={(e) =>
              setSelectedWeekIdx(
                e.target.value === "all" ? "all" : parseInt(e.target.value),
              )
            }
          >
            <option value="all">Chế độ xem: Cả tháng</option>
            {weeks.map((w, idx) => (
              <option key={idx} value={idx.toString()}>
                {w.name} ({w.days[0]}/{month} - {w.days[w.days.length - 1]}/
                {month})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-sm">
        <table className="w-full text-sm text-left border-collapse min-w-max">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {/* Main Header Row */}
            <tr>
              <th
                rowSpan={2}
                className="px-4 py-2 border-r border-b border-gray-300 dark:border-gray-600 sticky left-0 z-20 bg-gray-100 dark:bg-gray-800 min-w-[50px] text-center"
              >
                STT
              </th>
              <th
                rowSpan={2}
                className="px-4 py-2 border-r border-b border-gray-300 dark:border-gray-600 sticky left-[50px] z-20 bg-gray-100 dark:bg-gray-800 min-w-[200px]"
              >
                Tên
              </th>
              <th
                colSpan={2}
                className="px-4 py-2 border-r border-b border-gray-300 dark:border-gray-600 sticky left-[250px] z-20 bg-gray-100 dark:bg-gray-800 text-center"
              >
                Tổng giờ
              </th>

              {/* Daily Columns Header */}
              {visibleDays.map((day) => (
                <th
                  key={day}
                  colSpan={2}
                  className="px-2 py-1 border-r border-b border-gray-300 dark:border-gray-600 text-center whitespace-nowrap min-w-[60px]"
                >
                  {day}/{month}
                </th>
              ))}
            </tr>
            {/* Sub Header Row for H / P */}
            <tr>
              <th className="px-2 border-r border-b border-gray-300 dark:border-gray-600 text-center sticky left-[250px] z-20 bg-gray-100 dark:bg-gray-800">
                Giờ
              </th>
              <th className="px-2 border-r border-b border-gray-300 dark:border-gray-600 text-center sticky left-[295px] z-20 bg-gray-100 dark:bg-gray-800">
                Phút
              </th>
              {visibleDays.map((day) => (
                <React.Fragment key={`sub_${day}`}>
                  <th className="px-2 border-r border-b border-gray-300 dark:border-gray-600 text-center font-normal">
                    H
                  </th>
                  <th className="px-2 border-r border-b border-gray-300 dark:border-gray-600 text-center font-normal">
                    P
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + visibleDays.length * 2}
                  className="text-center py-8 text-gray-500"
                >
                  Chưa có dữ liệu chấm công tháng này
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.user.id}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {/* Fixed Columns */}
                  <td className="px-4 py-2 border-r border-b border-gray-200 dark:border-gray-700 text-center sticky left-0 z-10 bg-inherit font-medium">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border-r border-b border-gray-200 dark:border-gray-700 sticky left-[50px] z-10 bg-inherit font-medium truncate max-w-[200px]">
                    {row.user.name}
                  </td>
                  <td className="px-2 py-2 border-r border-b border-gray-200 dark:border-gray-700 text-center sticky left-[250px] z-10 bg-inherit font-bold text-blue-600 dark:text-blue-400">
                    {row.totalHours}
                  </td>
                  <td className="px-2 py-2 border-r border-b border-gray-200 dark:border-gray-700 text-center sticky left-[295px] z-10 bg-inherit font-bold text-blue-600 dark:text-blue-400">
                    {row.totalMinutes}
                  </td>

                  {/* Daily Log Columns */}
                  {visibleDays.map((day) => {
                    const data = row.days[day];
                    const hasData = !!data;
                    return (
                      <React.Fragment key={`data_${day}`}>
                        <td
                          className={`px-1 py-2 text-center border-r border-b border-gray-200 dark:border-gray-700 ${
                            hasData
                              ? "font-semibold text-gray-800 dark:text-gray-100"
                              : "text-gray-400"
                          } ${hasData ? "bg-green-50 dark:bg-green-900/20" : ""}`}
                        >
                          {hasData ? data.hours : ""}
                        </td>
                        <td
                          className={`px-1 py-2 text-center border-r border-b border-gray-200 dark:border-gray-700 ${
                            hasData
                              ? "font-semibold text-gray-800 dark:text-gray-100"
                              : "text-gray-400"
                          } ${hasData ? "bg-green-50 dark:bg-green-900/20" : ""}`}
                        >
                          {hasData ? data.minutes : ""}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
