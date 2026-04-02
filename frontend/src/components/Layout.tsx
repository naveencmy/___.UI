import { type CSSProperties, type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/sales", icon: ShoppingCart, label: "Sales", shortcut: "F1" },
  { path: "/purchase", icon: Package, label: "Purchase", shortcut: "F2" },
  { path: "/inventory", icon: Package, label: "Inventory", shortcut: "F3" },
  { path: "/parties", icon: Users, label: "Parties", shortcut: "F4" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentTime = new Date();
  const isOnline = true;
  const userName = currentUser?.name ?? "Guest";
  const userRole = currentUser?.role ?? "Guest";
    const visibleNavItems = navItems.filter((item) => {
    if (!currentUser) return item.path === "/dashboard";

    if (userRole === "owner") return true;
    if (userRole === "manager") {
      return ["/dashboard", "/sales", "/purchase", "/inventory", "/parties", "/reports"].includes(
        item.path
      );
    }
    if (userRole === "cashier") {
      return ["/dashboard", "/sales"].includes(item.path);
    }
    if (userRole === "worker") {
      return ["/dashboard", "/sales", "/inventory", "/parties"].includes(item.path);
    }
    return false;
  });

  return (
    <div
      className="h-screen bg-background flex flex-col"
      style={{
        "--sidebar-width": isCollapsed ? "4rem" : "16rem",
      } as CSSProperties}
    >
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-secondary rounded-sm transition mr-2"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">POS</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">RetailPOS</h1>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-muted-foreground">
            {currentTime.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-[hsl(var(--success))]">LAN Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-[hsl(var(--error))]" />
                <span className="text-[hsl(var(--error))]">Offline</span>
              </>
            )}
          </div>
          <div className="border-l border-border pl-6 flex items-center gap-3">
            <div className="text-right">
              <div className="text-foreground font-medium text-sm">{userName}</div>
              <div className="text-muted-foreground text-xs capitalize">{userRole}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="p-1.5 hover:bg-secondary rounded-sm transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        <aside
          className={cn(
            "border-r border-border bg-sidebar fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <nav className="p-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-sm transition",
                    isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-4 py-2.5",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.shortcut && (
                    <span className="text-xs font-mono text-muted-foreground">{item.shortcut}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
