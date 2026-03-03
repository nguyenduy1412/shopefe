"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ClipboardList, Search } from "lucide-react";

export default function TimekeepingTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "schedule";
  const viewMode =
    searchParams.get("view") || (activeTab === "history" ? "day" : "month");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // Sync state with URL when it changes externally
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }

      // Only push if the search param actually changed
      const currentSearchUrl = params.get("search") || "";
      const previousSearchUrl = searchParams.get("search") || "";

      if (currentSearchUrl !== previousSearchUrl) {
        router.push(`/dashboard/timekeeping?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, router, searchParams]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    if (value === "history") {
      params.set("view", "day");
    } else {
      params.delete("view");
    }
    router.push(`/dashboard/timekeeping?${params.toString()}`);
  };

  const handleViewModeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    router.push(`/dashboard/timekeeping?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Xếp Ca Làm Việc</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng ký ca làm</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Dữ liệu Chấm Công</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {activeTab === "history" && (
          <Tabs
            value={viewMode}
            onValueChange={handleViewModeChange}
            className="w-fit"
          >
            <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="day" className="px-6">
                Ngày
              </TabsTrigger>
              <TabsTrigger value="week" className="px-6">
                Tuần
              </TabsTrigger>
              <TabsTrigger value="month" className="px-6">
                Tháng
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm nhân viên..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
