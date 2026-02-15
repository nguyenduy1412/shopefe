"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const activities = [
  {
    id: 1,
    user: "Alice Smith",
    action: "created a new order",
    target: "#ORD-001",
    time: "2 minutes ago",
  },
  {
    id: 2,
    user: "Bob Johnson",
    action: "registered as a new customer",
    target: "",
    time: "1 hour ago",
  },
  {
    id: 3,
    user: "System",
    action: "updated product inventory",
    target: "Wireless Headphones",
    time: "3 hours ago",
  },
  {
    id: 4,
    user: "Charlie Brown",
    action: "left a review",
    target: "Smart Watch",
    time: "5 hours ago",
  },
];

export const RecentActivity = () => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activity.user}{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  {activity.action}
                </span>{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {activity.target}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
