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
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/dashboard/products", icon: ShoppingBag },
  { name: "Danh mục", href: "/dashboard/categories", icon: ListTree },
  { name: "Người dùng", href: "/dashboard/users", icon: Users },
  { name: "Chấm công", href: "/dashboard/timekeeping", icon: Calendar },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggle } = useSidebar();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/");
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 256 }}
      initial={false}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative hidden md:flex h-screen flex-col border-r border-border/50 bg-white text-gray-700 dark:bg-[#0d1525] dark:border-white/5 dark:text-gray-300 shrink-0 overflow-hidden"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-center border-b border-border/50 px-4 dark:border-white/5 overflow-hidden">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.span
              key="icon"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400"
            >
              S
            </motion.span>
          ) : (
            <motion.h1
              key="text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400 whitespace-nowrap"
            >
              ShopeFe
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isCollapsed ? "justify-center" : "",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
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

      {/* Logout */}
      <div className="border-t border-border/50 p-2 dark:border-white/5">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Đăng xuất" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Đăng xuất
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggle}
        className="absolute bottom-20 -right-3 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#1a2540] border border-border/50 dark:border-white/10 shadow-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-30"
        aria-label={isCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </motion.div>
  );
};
