import { useState } from "react";
import {
  Code2,
  Settings,
  LogOut,
  ArrowLeft,
  Search,
  Command,
} from "lucide-react";
import { UserAvatar } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommandPalette from "../dashboard/CommandPalette";
import useAuth from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import favicon from "../../../public/favicon.svg";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditor = location.pathname.startsWith("/editor/");
  const { isSignedIn, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <nav className="flex items-center justify-between px-5 py-2.5 h-12">
          {/* Left: Logo + Back */}
          <div className="flex items-center gap-2.5">
            {isEditor && (
              <Link
                to="/projects"
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{ color: "var(--text-secondary)" }}
                title="Back to Projects"
              >
                <ArrowLeft size={15} />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div
                className="p-1 rounded-md"
                style={{ backgroundColor: "var(--accent-light)" }}
              >
                <img src={favicon} alt="klyro" width={16} height={16} />
              </div>
              <span
                className="font-semibold text-sm tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                klyro
              </span>
            </Link>
          </div>

          {/* Center: Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Projects", to: "/projects" },
              { label: "Templates", to: "/templates" },
            ].map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] bg-[var(--bg-tertiary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Command Search */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex h-7 px-2 gap-1.5 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                  onClick={() => setCmdOpen(true)}
                >
                  <Search size={13} />
                  <span className="hidden lg:inline">Search</span>
                  <kbd
                    className="pointer-events-none inline-flex h-4 items-center gap-0.5 rounded border px-1 text-[10px] font-medium"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <Command size={9} />K
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Command palette</TooltipContent>
            </Tooltip>
            <div
              className="w-px h-4 mx-0.5"
              style={{ backgroundColor: "var(--border)" }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-tertiary)]"
                  style={{ color: "var(--text-secondary)" }}
                  aria-label="Settings"
                >
                  <Settings size={15} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            {isSignedIn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md transition-colors hover:bg-red-500/10"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label="Log out"
                  >
                    <LogOut size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Log out</TooltipContent>
              </Tooltip>
            )}

            <div
              className="w-px h-4 mx-0.5"
              style={{ backgroundColor: "var(--border)" }}
            />

            <UserAvatar
              appearance={{
                elements: {
                  avatarBox: "w-6 h-6",
                },
              }}
            />
          </div>
        </nav>
      </header>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}
