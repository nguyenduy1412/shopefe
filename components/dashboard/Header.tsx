"use client";

import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming you might have or want a UI library input, but standard input for now
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/ModeToggle";

export const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-white px-6 dark:bg-[#0d1525] dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="h-9 w-64 rounded-lg border border-border/60 bg-gray-50/80 pl-9 text-sm outline-none transition-all duration-150 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/20"
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
