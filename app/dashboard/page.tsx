"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DollarSign, Users, ShoppingBag, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Tổng quan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tổng quan hiệu suất cửa hàng của bạn.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng doanh thu"
          value="$45,231.89"
          icon={DollarSign}
          trend="+20.1% so với tháng trước"
          trendDirection="up"
          color="green"
        />
        <StatsCard
          title="Đăng ký"
          value="+2350"
          icon={Users}
          trend="+180.1% so với tháng trước"
          trendDirection="up"
          color="blue"
        />
        <StatsCard
          title="Đã bán"
          value="+12,234"
          icon={ShoppingBag}
          trend="+19% so với tháng trước"
          trendDirection="up"
          color="purple"
        />
        <StatsCard
          title="Đang hoạt động"
          value="+573"
          icon={Activity}
          trend="+201 từ giờ trước"
          trendDirection="up"
          color="orange"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="col-span-4 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tổng quan
          </h3>
          <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            Biểu đồ sẽ ở đây
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="col-span-3"
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  );
}
