"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkInAction, checkOutAction } from "@/app/actions/timekeeping";
import { logoutAction } from "@/app/actions/auth";
import { formatICTTime } from "@/lib/timezone";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Clock, LogOut, CalendarDays } from "lucide-react";

import { User } from "@supabase/supabase-js";

export function CheckInCard({
  user,
  existingRecord,
}: {
  user: User;
  existingRecord: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedIn = !!existingRecord;
  const hasCheckedOut = !!existingRecord?.check_out_time;

  async function handleAction() {
    setIsLoading(true);

    if (!hasCheckedIn) {
      const res = await checkInAction();
      if (res?.error) {
        toast.error("Ghi nhận thất bại", {
          description: res.error,
          duration: 4000,
        });
      } else {
        toast.success("Thành công", {
          description: "Đã ghi nhận thời gian bắt đầu ca làm của bạn.",
        });
      }
    } else if (!hasCheckedOut) {
      const res = await checkOutAction();
      if (res?.error) {
        toast.error("Ghi nhận thất bại", {
          description: res.error,
          duration: 4000,
        });
      } else {
        toast.success("Thành công", {
          description: "Đã ghi nhận thời gian kết thúc ca làm của bạn.",
        });
      }
    }

    setIsLoading(false);
    router.refresh(); // Refresh page to get latest server data
  }

  async function handleLogout() {
    setIsLoading(true);
    await logoutAction();
    setIsLoading(false);
    toast.success("Đã đăng xuất");
    window.location.href = "/";
  }

  return (
    <div className="flex w-full min-h-[100dvh] items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-sm backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 shadow-2xl border-0 ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex justify-between items-center px-6 pt-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">
              Xin chào,
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {((user.user_metadata as Record<string, unknown>)
                ?.full_name as string) || (user.email as string)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut className="h-5 w-5 text-slate-500 hover:text-red-500" />
          </Button>
        </div>

        <CardHeader className="text-center pt-2 pb-0">
          <CardTitle
            className="text-5xl font-bold font-mono tracking-tighter text-blue-600 dark:text-blue-400"
            suppressHydrationWarning
          >
            {time.toLocaleTimeString("vi-VN", {
              hour12: false,
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </CardTitle>
          <CardDescription
            className="text-md font-medium mt-1"
            suppressHydrationWarning
          >
            {time.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6 flex flex-col items-center gap-4">
          {!hasCheckedIn && (
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 w-full border border-orange-100 dark:border-orange-500/20">
              <Clock className="h-8 w-8 mb-2" />
              <p className="font-semibold">Chưa vào ca / Check-in</p>
              <p className="text-xs mt-1 block w-full opacity-80">
                Hãy check-in để bắt đầu tính công
              </p>
            </div>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-full border border-emerald-100 dark:border-emerald-500/20">
              <Clock className="h-8 w-8 mb-2" />
              <p className="font-semibold">Đang trong ca làm việc</p>
              <p className="text-xs mt-1 block opacity-80">
                Check-in lúc:{" "}
                {formatICTTime(
                  new Date(
                    existingRecord?.check_in_time as string | number | Date,
                  ),
                )}
              </p>
            </div>
          )}

          {hasCheckedOut && (
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-full border border-slate-200 dark:border-slate-700">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p className="font-semibold">Đã hoàn thành ca</p>
              <p className="text-xs mt-1 block opacity-80">
                Check-in:{" "}
                {formatICTTime(
                  new Date(
                    existingRecord?.check_in_time as string | number | Date,
                  ),
                )}{" "}
                <br />
                Check-out:{" "}
                {formatICTTime(
                  new Date(
                    existingRecord?.check_out_time as string | number | Date,
                  ),
                )}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pb-6 w-full flex flex-col gap-3">
          <Button
            size="lg"
            className={`w-full text-lg font-bold shadow-lg transition-all ${
              !hasCheckedIn
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
                : hasCheckedOut
                  ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200 cursor-not-allowed shadow-none"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
            }`}
            onClick={handleAction}
            disabled={isLoading || hasCheckedOut}
          >
            {isLoading
              ? "Đang xử lý..."
              : !hasCheckedIn
                ? "CHECK IN (VÀO CA)"
                : hasCheckedOut
                  ? "KẾT THÚC HÔM NAY"
                  : "CHECK OUT (RA CA)"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-lg font-bold border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/30"
            onClick={() => router.push("/shifts")}
            disabled={isLoading}
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            ĐĂNG KÝ CA LÀM
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
