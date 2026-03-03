"use client";

import {
  Bell,
  Search,
  Menu,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  Calendar,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/dashboard/products", icon: ShoppingBag },
  { name: "Người dùng", href: "/dashboard/users", icon: Users },
  { name: "Chấm công", href: "/dashboard/timekeeping", icon: Calendar },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
];

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toggle } = useSidebar();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-white px-4 md:px-6 dark:bg-[#0d1525] dark:border-white/5">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile Hamburger – opens Sheet drawer */}
        <Sheet>
          <SheetTrigger asChild>
            {/* Visible only on mobile */}
            <button className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-800">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] p-0 flex flex-col bg-white dark:bg-[#0d1525] border-r-border/50 dark:border-white/5"
          >
            <SheetTitle className="sr-only">Menu Điều Hướng</SheetTitle>
            <SheetDescription className="sr-only">
              Điều hướng ứng dụng
            </SheetDescription>
            <div className="flex h-16 items-center justify-center border-b border-border/50 px-6 dark:border-white/5">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400">
                ShopeFe
              </h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto w-full">
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
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border/50 p-4 dark:border-white/5 w-full">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Hamburger – toggles sidebar collapse */}
        <button
          onClick={toggle}
          className="hidden md:flex p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="h-9 w-48 md:w-64 rounded-lg border border-border/60 bg-gray-50/80 pl-9 text-sm outline-none transition-all duration-150 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />
        <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0d1525]"></span>
        </button>

        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
