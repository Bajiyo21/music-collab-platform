import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground shadow-sm"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon size={14} className="text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun size={14} className="text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}
