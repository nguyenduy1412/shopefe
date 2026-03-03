"use client";

import React, { useState, useTransition } from "react";
import { Plus, X, Users, TrendingUp, Award } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { toast } from "sonner";
import {
  formatICTDateToLocalString,
  formatToICTDateOnly,
} from "@/lib/timezone";
import { assignShiftAction, removeShiftAction } from "@/app/actions/shift";
import { ShiftAssignmentModal } from "./ShiftAssignmentModal";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  fullName: string | null;
  username: string;
}

interface Shift {
  id: string;
  user_id: string;
  date: Date;
  shift_type: string;
  user: User;
}

interface ShiftCalendarProps {
  currentDate: Date;
  shifts: Shift[];
  allUsers: User[];
}

const SHIFT_TYPES = [
  { id: "SANG", label: "Sáng\n(5h30-12h)" },
  { id: "CHIEU", label: "Chiều\n(12h-18h)" },
  { id: "TOI", label: "Tối\n(18h-22h)" },
  { id: "DEM", label: "Đêm\n(22h-2h30)" },
] as const;

export default function ShiftCalendarTable({
  currentDate,
  shifts,
  allUsers,
}: ShiftCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedCell, setSelectedCell] = useState<{
    date: Date;
    shiftType: "SANG" | "CHIEU" | "TOI" | "DEM";
  } | null>(null);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const handleRemoveShift = async (shiftId: string) => {
    if (!confirm("Bạn có chắc muốn xóa ca trực này?")) return;

    startTransition(async () => {
      const res = await removeShiftAction(shiftId);
      if (res.error) alert(res.error);
      router.refresh();
    });
  };

  const handleAddShift = (userId: string) => {
    if (!selectedCell || !userId) return;

    startTransition(async () => {
      try {
        const result = await assignShiftAction(
          userId,
          formatToICTDateOnly(selectedCell.date),
          selectedCell.shiftType,
        );

        if (result.success) {
          toast.success("Đã phân ca thành công");
          setSelectedCell(null);
          router.refresh();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } catch {
        toast.error("Lỗi hệ thống");
      }
    });
  };

  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  // Calculate shift statistics
  const userShiftCounts = shifts.reduce(
    (acc, shift) => {
      const userId = shift.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          name: shift.user.fullName || shift.user.username,
          count: 0,
        };
      }
      acc[userId].count += 1;
      return acc;
    },
    {} as Record<string, { name: string; count: number }>,
  );

  const sortedUserShiftCounts = Object.values(userShiftCounts).sort(
    (a, b) => b.count - a.count,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header logic can go outside or here. Kept outer context clean. */}

      <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-sm">
        <table className="w-full text-sm text-left border-collapse min-w-max">
          <thead className="text-xs text-center uppercase bg-[#accdfc] dark:bg-blue-900/40 text-gray-800 dark:text-gray-200 border-b-2 border-blue-400">
            <tr>
              <th className="px-4 py-3 border-r border-blue-300 dark:border-blue-700 font-bold sticky left-0 z-20 bg-[#accdfc] dark:bg-blue-900 min-w-[70px] md:min-w-[120px]">
                Ca
              </th>
              {weekDays.map((date, idx) => (
                <th
                  key={idx}
                  className="px-2 py-2 border-r border-blue-300 dark:border-blue-700 min-w-[100px] md:min-w-[160px]"
                >
                  <div className="font-bold text-xs md:text-sm mb-1">
                    {dayNames[idx]}
                  </div>
                  <div className="text-[10px] md:text-[11px] font-medium text-blue-800 dark:text-blue-300">
                    {format(date, "dd/MM")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_TYPES.map((shiftRow) => (
              <tr
                key={shiftRow.id}
                className="bg-accent/10 hover:bg-accent/20 transition-colors"
              >
                {/* Fixed Y-Axis Label */}
                <td className="px-2 py-8 border-r border-b border-gray-200 dark:border-gray-700 text-center sticky left-0 z-10 bg-[#fdeecb] dark:bg-orange-950/30 align-middle font-medium whitespace-pre-line text-xs font-serif text-gray-800 dark:text-gray-200">
                  {shiftRow.label}
                </td>

                {/* X-Axis Cells */}
                {weekDays.map((date, idx) => {
                  // Filter shifts that match this day and shift type
                  const cellShifts = shifts.filter(
                    (s) =>
                      formatICTDateToLocalString(new Date(s.date)) ===
                        formatICTDateToLocalString(date) &&
                      s.shift_type === shiftRow.id,
                  );

                  return (
                    <td
                      key={idx}
                      className="px-2 py-2 border-r border-b border-gray-200 dark:border-gray-700 min-w-[100px] md:min-w-[160px] align-top bg-white dark:bg-gray-900 group"
                    >
                      <div className="flex flex-col gap-1 w-full min-h-[100px]">
                        {cellShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm transition-colors hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-700"
                          >
                            <span
                              className="font-medium truncate max-w-[110px]"
                              title={shift.user.fullName || shift.user.username}
                            >
                              {shift.user.fullName || "Tên trống"}
                            </span>
                            <button
                              onClick={() => handleRemoveShift(shift.id)}
                              className="text-gray-400 hover:text-red-500 shrink-0 p-0.5"
                              disabled={isPending}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* Add Button - appears at bottom of stack */}
                        <button
                          onClick={() =>
                            setSelectedCell({
                              date,
                              shiftType: shiftRow.id as
                                | "SANG"
                                | "CHIEU"
                                | "TOI"
                                | "DEM",
                            })
                          }
                          className="mt-1 flex items-center justify-center gap-1 w-full py-1.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-sm text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 text-[11px]"
                          disabled={isPending}
                        >
                          <Plus className="h-3 w-3" /> Thêm người
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics Section */}
      {sortedUserShiftCounts.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
          {/* Card Header */}
          <div className="relative px-5 py-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 opacity-[0.04] bg-gradient-to-br from-blue-400 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-300/60 dark:bg-white/10 rounded-lg">
                  <Users className="h-4 w-4 text-slate-700 dark:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                    Tổng số ca làm trong tuần
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {sortedUserShiftCounts.length} nhân viên &middot;{" "}
                    {sortedUserShiftCounts.reduce((s, u) => s + u.count, 0)} ca
                    tổng
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-300/60 dark:bg-white/10 rounded-full border border-slate-300 dark:border-white/10">
                <TrendingUp className="h-3 w-3 text-slate-600 dark:text-slate-300" />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Tuần này
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-5 py-4 bg-white dark:bg-[#0d1525]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sortedUserShiftCounts.map((stat, idx) => {
                const maxCount = sortedUserShiftCounts[0].count;
                const pct = Math.round((stat.count / maxCount) * 100);
                const isTop = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`relative group flex flex-col gap-2.5 px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      isTop
                        ? "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    {/* Top badge */}
                    {isTop && (
                      <span className="absolute -top-2 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-400 text-amber-900 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-sm">
                        <Award className="h-2.5 w-2.5" /> Top
                      </span>
                    )}

                    {/* User info + count */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isTop
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        title={stat.name}
                      >
                        {stat.name}
                      </span>
                      <div
                        className={`flex items-baseline gap-1 shrink-0 ${
                          isTop
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <span className="text-xl font-bold tabular-nums leading-none">
                          {stat.count}
                        </span>
                        <span className="text-[10px] font-medium uppercase opacity-60">
                          ca
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isTop
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                            : "bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600">
                      {pct}% so với cao nhất
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shift Assignment Compound Component Modal */}
      <ShiftAssignmentModal.Provider
        selectedCell={selectedCell}
        onClose={() => setSelectedCell(null)}
        users={allUsers}
        onAssign={handleAddShift}
        isPending={isPending}
      >
        <ShiftAssignmentModal />
      </ShiftAssignmentModal.Provider>
    </div>
  );
}
