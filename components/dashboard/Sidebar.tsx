"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/dashboard/products", icon: ShoppingBag },
  { name: "Đơn hàng", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Người dùng", href: "/dashboard/users", icon: Users },
  { name: "Khách hàng", href: "/dashboard/customers", icon: Users },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-white text-gray-700 dark:bg-[#0d1525] dark:border-white/5 dark:text-gray-300">
      <div className="flex h-16 items-center justify-center border-b border-border/50 px-6 dark:border-white/5">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400">
          ShopeFe
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 h-7 w-[3px] rounded-r-full bg-blue-600 dark:bg-blue-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/50 p-4 dark:border-white/5">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};
