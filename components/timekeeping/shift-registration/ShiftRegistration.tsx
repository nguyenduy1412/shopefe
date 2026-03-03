"use client";

import React, { createContext, useContext, useTransition } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  registerMyShiftAction,
  cancelMyShiftAction,
} from "@/app/actions/shift";
import {
  formatICTDateToLocalString,
  formatToICTDateOnly,
} from "@/lib/timezone";
import { Check, Loader2, Calendar } from "lucide-react";

// --- Types ---
interface Shift {
  id: string;
  user_id: string;
  date: Date;
  shift_type: string;
}

type ShiftType = "SANG" | "CHIEU" | "TOI" | "DEM";

interface ShiftRegistrationContextValue {
  currentDate: Date;
  shifts: Shift[];
  isPending: boolean;
  onToggleShift: (
    date: Date,
    shiftType: ShiftType,
    existingShiftId?: string,
  ) => Promise<void>;
}

// --- Context ---
const ShiftRegistrationContext =
  createContext<ShiftRegistrationContextValue | null>(null);

function useShiftRegistrationContext() {
  const context = useContext(ShiftRegistrationContext);
  if (!context) {
    throw new Error(
      "ShiftRegistration components must be used within ShiftRegistration.Provider",
    );
  }
  return context;
}

// --- Provider ---
interface ProviderProps {
  children: React.ReactNode;
  currentDate: Date;
  shifts: Shift[];
}

export function ShiftRegistrationProvider({
  children,
  currentDate,
  shifts,
}: ProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleShift = async (
    date: Date,
    shiftType: ShiftType,
    existingShiftId?: string,
  ) => {
    startTransition(async () => {
      try {
        if (existingShiftId) {
          // Cancel shift
          const result = await cancelMyShiftAction(existingShiftId);
          if (result.success) {
            toast.success("Đã hủy ca làm.");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        } else {
          // Register shift
          const result = await registerMyShiftAction(
            formatToICTDateOnly(date),
            shiftType,
          );
          if (result.success) {
            toast.success("Đăng ký ca thành công.");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        }
      } catch (e) {
        console.error("Error toggling shift:", e);
        toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
      }
    });
  };

  return (
    <ShiftRegistrationContext.Provider
      value={{
        currentDate,
        shifts,
        isPending,
        onToggleShift: handleToggleShift,
      }}
    >
      {children}
    </ShiftRegistrationContext.Provider>
  );
}

// --- Constants ---
const SHIFT_TYPES = [
  { id: "SANG", label: "Sáng\n(05:30-12:00)", shortLabel: "Sáng" },
  { id: "CHIEU", label: "Chiều\n(12:00-18:00)", shortLabel: "Chiều" },
  { id: "TOI", label: "Tối\n(18:00-22:00)", shortLabel: "Tối" },
  { id: "DEM", label: "Đêm\n(22:00-02:30)", shortLabel: "Đêm" },
] as const;

// --- Desktop Week Grid (Vercel best practices for table layout) ---
export function ShiftRegistrationWeekGrid() {
  const { currentDate, shifts, isPending, onToggleShift } =
    useShiftRegistrationContext();

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  return (
    <div className="w-full">
      <table className="w-full text-sm text-left border-collapse table-fixed">
        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <tr>
            <th className="px-2 py-4 border-r border-b border-slate-200 dark:border-slate-700 font-semibold bg-slate-100 dark:bg-slate-800 w-[12%] text-center">
              Ca Làm Việc
            </th>
            {weekDays.map((date, idx) => (
              <th
                key={idx}
                className="px-2 py-3 border-r border-b border-slate-200 dark:border-slate-700 w-[12.5%] text-center"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider mb-1">
                  {dayNames[idx]}
                </div>
                <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
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
              className="bg-white dark:bg-slate-900 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
            >
              {/* Fixed Y-Axis Label */}
              <td className="px-2 py-6 border-r border-b border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-950 align-middle font-medium whitespace-pre-line text-xs text-slate-700 dark:text-slate-300">
                {shiftRow.label}
              </td>

              {/* X-Axis Cells */}
              {weekDays.map((date, idx) => {
                const cellShift = shifts.find(
                  (s) =>
                    formatICTDateToLocalString(new Date(s.date)) ===
                      formatICTDateToLocalString(date) &&
                    s.shift_type === shiftRow.id,
                );

                const isRegistered = !!cellShift;

                return (
                  <td
                    key={idx}
                    className="p-1.5 border-r border-b border-slate-200 dark:border-slate-700 align-middle"
                  >
                    <button
                      onClick={() =>
                        onToggleShift(
                          date,
                          shiftRow.id as ShiftType,
                          cellShift?.id,
                        )
                      }
                      disabled={isPending}
                      className={`
                        w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                        border-2
                        ${
                          isRegistered
                            ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300 shadow-sm"
                            : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                        }
                        ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
                      `}
                    >
                      {isRegistered ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span className="text-xs font-semibold">
                            Đã đăng ký
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-medium">
                          Bấm để đăng ký
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Mobile List View (Optimized for small screens) ---
export function ShiftRegistrationMobileList() {
  const { currentDate, shifts, isPending, onToggleShift } =
    useShiftRegistrationContext();

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-col gap-6">
      {weekDays.map((date, idx) => {
        const todayShifts = shifts.filter(
          (s) =>
            formatICTDateToLocalString(new Date(s.date)) ===
            formatICTDateToLocalString(date),
        );

        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  {format(date, "EEEE", { locale: vi })}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {format(date, "dd MMMM, yyyy", { locale: vi })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SHIFT_TYPES.map((shiftRow) => {
                const cellShift = todayShifts.find(
                  (s) => s.shift_type === shiftRow.id,
                );
                const isRegistered = !!cellShift;

                return (
                  <button
                    key={shiftRow.id}
                    onClick={() =>
                      onToggleShift(
                        date,
                        shiftRow.id as ShiftType,
                        cellShift?.id,
                      )
                    }
                    disabled={isPending}
                    className={`
                      relative flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all border-2
                      ${
                        isRegistered
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300 shadow-sm"
                          : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      }
                      ${isPending ? "opacity-50 cursor-not-allowed" : "active:scale-95"}
                    `}
                  >
                    <span className="font-semibold text-sm mb-1">
                      {shiftRow.shortLabel}
                    </span>
                    <span className="text-[10px] opacity-80 text-center whitespace-pre-line leading-tight">
                      {shiftRow.label.replace(shiftRow.shortLabel + "\n", "")}
                    </span>

                    {isRegistered && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Đang lưu...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
