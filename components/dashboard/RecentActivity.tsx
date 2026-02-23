"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const activities = [
  {
    id: 1,
    user: "Alice Smith",
    action: "đã tạo đơn hàng mới",
    target: "#ORD-001",
    time: "2 phút trước",
  },
  {
    id: 2,
    user: "Bob Johnson",
    action: "đã đăng ký khách hàng mới",
    target: "",
    time: "1 giờ trước",
  },
  {
    id: 3,
    user: "Hệ thống",
    action: "đã cập nhật kho sản phẩm",
    target: "Tai nghe không dây",
    time: "3 giờ trước",
  },
  {
    id: 4,
    user: "Charlie Brown",
    action: "đã đánh giá",
    target: "Đồng hồ thông minh",
    time: "5 giờ trước",
  },
];

export const RecentActivity = () => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Hoạt động gần đây
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
