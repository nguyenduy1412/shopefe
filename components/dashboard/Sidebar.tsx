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
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: ShoppingBag },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white text-gray-800 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
      <div className="flex h-16 items-center justify-center border-b px-6 dark:border-gray-800">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          ShopeFe
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 h-8 w-1 rounded-r-md bg-blue-600 dark:bg-blue-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 dark:border-gray-800">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
