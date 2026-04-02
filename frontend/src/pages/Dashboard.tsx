import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ReportAPI, type DashboardData } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ReportAPI.dashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const metrics = data
    ? [
        { label: "Today Sales", value: `₹${data.today_sales.toLocaleString()}`, changeType: "increase" as const },
        { label: "Today Purchases", value: `₹${data.today_purchase.toLocaleString()}`, changeType: "increase" as const },
        { label: "Total Receivables", value: `₹${data.receivables.toLocaleString()}`, changeType: "increase" as const },
        { label: "Total Payables", value: `₹${data.payables.toLocaleString()}`, changeType: "decrease" as const },
      ]
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Loading dashboard…
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 text-[hsl(var(--error))] text-sm p-4 bg-card border border-border rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && data && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="metric-label">{metric.label}</div>
                      <div className="metric-value">{metric.value}</div>
                    </div>
                    <IndianRupee className="w-5 h-5 text-muted-foreground opacity-50" />
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {metric.changeType === "increase" ? (
                      <TrendingUp className="w-4 h-4 text-[hsl(var(--success))]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[hsl(var(--info))]" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Low Stock Alerts */}
            {data.low_stock.length > 0 && (
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))]" />
                  <h2 className="text-sm font-semibold text-foreground">Low Stock Alerts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.low_stock.map((item) => (
                    <div
                      key={item.name}
                      className="bg-background border border-border rounded-sm p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <span className="text-xs font-bold text-[hsl(var(--warning))]">
                          {item.quantity} units
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {data.recent.length > 0 && (
              <div className="bg-card border border-border rounded-md p-4">
                <h2 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Invoice</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Party</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((tx) => (
                        <tr
                          key={tx.invoice}
                          className="border-b border-border hover:bg-secondary transition"
                        >
                          <td className="py-3 px-4 text-foreground font-mono text-xs">{tx.invoice}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs font-medium ${
                                tx.type === "sale"
                                  ? "text-[hsl(var(--success))]"
                                  : "text-[hsl(var(--info))]"
                              }`}
                            >
                              {tx.type === "sale" ? "Sale" : "Purchase"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground">{tx.party}</td>
                          <td className="py-3 px-4 text-right text-foreground font-semibold">
                            ₹{tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
