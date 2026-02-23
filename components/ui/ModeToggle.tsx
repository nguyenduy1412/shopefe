"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import { flushSync } from "react-dom";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const handleToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const isDark = resolvedTheme === "dark";
      const nextTheme = isDark ? "light" : "dark";

      // Fallback if browser doesn't support View Transitions
      if (!document.startViewTransition) {
        setTheme(nextTheme);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const transition = document.startViewTransition(() => {
        // Disable global transitions so NextThemes updates the DOM instantly without CSS fighting it
        document.documentElement.classList.add("view-transition-active");

        // Force synchronous DOM update
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
          document.documentElement.style.colorScheme = "light";
        }

        // Also update React state synchronously
        flushSync(() => {
          setTheme(nextTheme);
        });
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 600,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });

      transition.finished.then(() => {
        document.documentElement.classList.remove("view-transition-active");
      });
    },
    [resolvedTheme, setTheme],
  );

  if (!mounted) return <div className="w-16 h-8" />;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <button
        ref={toggleRef}
        onClick={handleToggle}
        className="relative w-16 h-8 rounded-full p-1 transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          background: isDark
            ? "linear-gradient(to right, #1e293b, #0f172a)"
            : "linear-gradient(to right, #93c5fd, #60a5fa)",
        }}
        aria-label="Chuyển giao diện"
      >
        {/* Stars (dark mode) */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500"
          style={{ opacity: isDark ? 1 : 0 }}
        >
          <span className="absolute w-1 h-1 bg-white rounded-full top-2 left-3 animate-pulse" />
          <span className="absolute w-0.5 h-0.5 bg-white/70 rounded-full top-4 left-6" />
          <span className="absolute w-0.5 h-0.5 bg-white/60 rounded-full top-1.5 left-9" />
          <span
            className="absolute w-1 h-1 bg-white/50 rounded-full top-5 left-4 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        {/* Clouds (light mode) */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500"
          style={{ opacity: isDark ? 0 : 1 }}
        >
          <span className="absolute w-4 h-1.5 bg-white/60 rounded-full top-2 right-3" />
          <span className="absolute w-3 h-1 bg-white/40 rounded-full top-5 right-5" />
        </div>

        {/* Toggle circle (sun/moon) */}
        <div
          className="relative w-6 h-6 rounded-full shadow-md transition-all duration-500 ease-in-out"
          style={{
            transform: isDark ? "translateX(32px)" : "translateX(0px)",
            background: isDark
              ? "linear-gradient(135deg, #e2e8f0, #cbd5e1)"
              : "linear-gradient(135deg, #fbbf24, #f59e0b)",
          }}
        >
          {/* Moon craters */}
          {isDark && (
            <>
              <span
                className="absolute w-1.5 h-1.5 rounded-full bg-gray-400/40"
                style={{ top: "4px", left: "8px" }}
              />
              <span
                className="absolute w-1 h-1 rounded-full bg-gray-400/30"
                style={{ top: "12px", left: "5px" }}
              />
              <span
                className="absolute w-2 h-2 rounded-full bg-gray-400/20"
                style={{ top: "8px", left: "12px" }}
              />
            </>
          )}

          {/* Sun rays */}
          {!isDark && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute w-8 h-8 rounded-full animate-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #fbbf24 5%, transparent 10%, transparent 15%, #fbbf24 20%, transparent 25%, transparent 30%, #fbbf24 35%, transparent 40%, transparent 45%, #fbbf24 50%, transparent 55%, transparent 60%, #fbbf24 65%, transparent 70%, transparent 75%, #fbbf24 80%, transparent 85%, transparent 90%, #fbbf24 95%, transparent 100%)",
                  opacity: 0.3,
                  animationDuration: "10s",
                }}
              />
            </div>
          )}
        </div>
      </button>
    </>
  );
}
