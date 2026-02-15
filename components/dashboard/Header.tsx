"use client";

import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming you might have or want a UI library input, but standard input for now
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/ModeToggle";

export const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600"></span>
        </button>

        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
