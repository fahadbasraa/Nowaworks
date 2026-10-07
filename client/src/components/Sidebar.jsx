import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { LayoutDashboard, FolderKanban, Users, ListChecks, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Avatar } from "./ui/Avatar.jsx";
import { RolePill } from "./ui/Pill.jsx";

const NAV_BY_ROLE = {
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/team", label: "Team", icon: Users },
  ],
  MANAGER: [
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/team", label: "Team", icon: Users },
  ],
  AGENT: [
    { to: "/my-tasks", label: "My Tasks", icon: ListChecks },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/team", label: "Team", icon: Users },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const items = NAV_BY_ROLE[user?.role] ?? [];

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-border bg-surface lg:w-60">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-[#0B0B0F]">
          N
        </div>
        <span className="hidden text-sm font-medium text-text lg:inline">NovaWorks</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "relative flex h-[34px] items-center gap-2.5 rounded-field px-2.5 text-sm transition-colors duration-150",
                isActive ? "bg-surface-2 text-text" : "text-text-2 hover:bg-hover hover:text-text"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent" />
                )}
                <Icon size={16} className="shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-1">
        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          className="flex h-[34px] w-full items-center gap-2.5 rounded-field px-2.5 text-sm text-text-2 transition-colors duration-150 hover:bg-hover hover:text-text"
        >
          {theme === "dark" ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
          <span className="hidden lg:inline">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
        <Avatar name={user?.name} size="md" />
        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="truncate text-sm text-text">{user?.name}</div>
          <RolePill role={user?.role} className="mt-0.5" />
        </div>
        <button
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={logout}
          className="ml-auto shrink-0 rounded-field p-1.5 text-text-3 transition-colors duration-150 hover:bg-hover hover:text-text"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
