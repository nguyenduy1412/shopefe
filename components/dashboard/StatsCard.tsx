"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  description?: string;
  color?: string; // e.g., "blue", "green", "purple"
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  description,
  color = "blue",
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <div
          className={`rounded-lg p-2 bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </h3>
        <div className="mt-1 flex items-center text-xs">
          {trend && (
            <span
              className={`flex items-center font-medium ${trendDirection === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {trendDirection === "up" ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              )}
              {trend}
            </span>
          )}
          {description && (
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
