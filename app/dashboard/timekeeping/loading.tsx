"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function TimekeepingLoading() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  // Match the colors used in other parts of the system
  const skeletonBaseColor = isDark ? "#1f2937" : "#f3f4f6";
  const skeletonHighlightColor = isDark ? "#374151" : "#e5e7eb";

  if (!mounted) {
    return null;
  }

  return (
    <SkeletonTheme
      baseColor={skeletonBaseColor}
      highlightColor={skeletonHighlightColor}
    >
      <div className="rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-sm">
            <table className="w-full text-sm text-left border-collapse min-w-max">
              <thead className="bg-[#accdfc] dark:bg-blue-900/40 text-gray-800 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-3 min-w-[140px]">
                    <Skeleton height={20} width={60} />
                  </th>
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <th key={idx} className="px-2 py-2 min-w-[200px]">
                      <Skeleton height={16} width={50} className="mb-1" />
                      <Skeleton height={12} width={40} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-2 py-8">
                      <Skeleton height={40} width={80} />
                    </td>
                    {Array.from({ length: 7 }).map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-2 py-2 border-l border-gray-200 dark:border-gray-700 min-w-[200px]"
                      >
                        <div className="flex flex-col gap-2 min-h-[100px]">
                          <Skeleton height={30} />
                          {rowIdx % 2 === 0 && colIdx % 3 === 0 && (
                            <Skeleton height={30} />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
