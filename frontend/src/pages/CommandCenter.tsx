import { ArrowRight, Barcode, Package, ShoppingCart, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";

const stats = [
  { label: "LAN Connected", value: "Yes", icon: Store },
  { label: "Open Sessions", value: "04", icon: Users },
  { label: "Active Sales", value: "128", icon: ShoppingCart },
  { label: "Low Stock", value: "12", icon: Package },
];

const shortcuts = [
  { label: "Sales", to: "/sales", icon: ShoppingCart },
  { label: "Purchase", to: "/purchase", icon: Package },
  { label: "Inventory", to: "/inventory", icon: Barcode },
];

export default function CommandCenter() {
  const { currentUser } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">
              Retail POS Command Center
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black leading-none tracking-tight text-foreground">
                COMMAND
              </h1>
              <h2 className="text-5xl lg:text-7xl font-black leading-none tracking-tight text-primary">
                POS
              </h2>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
                      <span>{item.label}</span>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-foreground">{item.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary to-sky-500 p-6 text-primary-foreground max-w-xl">
              <div className="text-xs uppercase tracking-[0.35em] opacity-80">
                Quick Access
              </div>
              <p className="mt-2 text-lg font-semibold">
                Welcome back{currentUser ? `, ${currentUser.name}` : ""}.
              </p>
              <p className="mt-1 text-sm opacity-80">
                Use the shortcuts below to jump into daily operations.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
              Terminal Actions
            </div>
            <div className="space-y-3">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-4 transition hover:border-primary/40 hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{item.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-background p-4">
              <div className="text-sm font-semibold text-foreground mb-2">Current Login</div>
              <div className="text-sm text-muted-foreground">
                {currentUser ? `${currentUser.name} · ${currentUser.role}` : "Not signed in"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
