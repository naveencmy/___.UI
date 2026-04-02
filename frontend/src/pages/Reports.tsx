import { useState, useEffect } from "react";
import { Download, Filter, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ReportAPI, InventoryAPI, PartyAPI, type SalesReportItem, type InventoryItem, type Party } from "@/lib/api";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

export default function Reports() {
  const [reportType, setReportType] = useState<"sales" | "inventory" | "parties">("sales");
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [partiesData, setPartiesData] = useState<Party[]>([]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      if (reportType === "sales") {
        const data = await ReportAPI.sales(startDate, endDate);
        setSalesData(data);
      } else if (reportType === "inventory") {
        const data = await InventoryAPI.getAll();
        setInventoryData(data);
      } else {
        const data = await PartyAPI.getAll();
        setPartiesData(data);
      }
    } catch {
      setError(`Failed to load ${reportType} report`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  // ── Summary metrics ──────────────────────────────────────────────────────
  const totalSales = salesData.reduce((s, r) => s + r.net_sales, 0);
  const totalTransactions = salesData.reduce((s, r) => s + r.transactions, 0);
  const avgBill = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;
  const totalInventoryValue = inventoryData.reduce((s, i) => s + i.stock_value, 0);
  const totalReceivables = partiesData
    .filter((p) => p.type === "customer")
    .reduce((s, p) => s + Math.max(0, p.outstanding), 0);
  const totalPayables = partiesData
    .filter((p) => p.type === "supplier")
    .reduce((s, p) => s + Math.max(0, p.outstanding), 0);

  return (
    <Layout>
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportType === "sales" && (
            <>
              <div className="metric-card"><div className="metric-label">Period Sales</div><div className="metric-value">₹{totalSales.toLocaleString()}</div></div>
              <div className="metric-card"><div className="metric-label">Transactions</div><div className="metric-value">{totalTransactions}</div></div>
              <div className="metric-card"><div className="metric-label">Avg Bill</div><div className="metric-value">₹{avgBill.toLocaleString()}</div></div>
              <div className="metric-card"><div className="metric-label">Days</div><div className="metric-value">{salesData.length}</div></div>
            </>
          )}
          {reportType === "inventory" && (
            <>
              <div className="metric-card"><div className="metric-label">Stock Valuation</div><div className="metric-value">₹{totalInventoryValue.toLocaleString()}</div></div>
              <div className="metric-card"><div className="metric-label">Total SKUs</div><div className="metric-value">{inventoryData.length}</div></div>
              <div className="metric-card"><div className="metric-label">Low Stock</div><div className="metric-value">{inventoryData.filter(i => i.quantity <= 10).length}</div></div>
              <div className="metric-card"><div className="metric-label">Avg Value</div><div className="metric-value">₹{inventoryData.length ? Math.round(totalInventoryValue / inventoryData.length).toLocaleString() : 0}</div></div>
            </>
          )}
          {reportType === "parties" && (
            <>
              <div className="metric-card"><div className="metric-label">Total Receivables</div><div className="metric-value text-[hsl(var(--warning))]">₹{totalReceivables.toLocaleString()}</div></div>
              <div className="metric-card"><div className="metric-label">Total Payables</div><div className="metric-value text-[hsl(var(--error))]">₹{totalPayables.toLocaleString()}</div></div>
              <div className="metric-card"><div className="metric-label">Customers</div><div className="metric-value">{partiesData.filter(p => p.type === "customer").length}</div></div>
              <div className="metric-card"><div className="metric-label">Suppliers</div><div className="metric-value">{partiesData.filter(p => p.type === "supplier").length}</div></div>
            </>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-md p-4 flex gap-4 flex-wrap items-end">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as typeof reportType)}
              className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="parties">Parties Report</option>
            </select>
          </div>
          {reportType === "sales" && (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {loading ? "Loading…" : "Apply"}
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[hsl(var(--error))] text-sm p-4 bg-card border border-border rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Sales Table */}
        {reportType === "sales" && !loading && (
          <div className="bg-card border border-border rounded-md overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Daily Sales Report</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {["Date", "Gross Sales", "Returns", "Net Sales", "Transactions", "Avg Bill"].map((h) => (
                      <th key={h} className={`py-3 px-4 text-muted-foreground font-medium ${h === "Date" ? "text-left" : h === "Transactions" ? "text-center" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salesData.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No data for selected period</td></tr>
                  ) : (
                    salesData.map((r) => (
                      <tr key={r.date} className="border-b border-border hover:bg-secondary transition">
                        <td className="py-3 px-4 text-foreground font-mono">{r.date}</td>
                        <td className="py-3 px-4 text-right text-foreground font-semibold">₹{r.total_sales.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-[hsl(var(--error))]">₹{r.total_returns.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-[hsl(var(--success))] font-semibold">₹{r.net_sales.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-foreground">{r.transactions}</td>
                        <td className="py-3 px-4 text-right text-foreground">₹{r.avg_bill.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        {reportType === "inventory" && !loading && (
          <div className="bg-card border border-border rounded-md overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Stock Position Report</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {["Product", "Unit", "Quantity", "Purchase Rate", "Stock Value"].map((h) => (
                      <th key={h} className={`py-3 px-4 text-muted-foreground font-medium ${h === "Product" || h === "Unit" ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item) => (
                    <tr key={item.product_unit_id} className="border-b border-border hover:bg-secondary transition">
                      <td className="py-3 px-4 text-foreground">{item.name}</td>
                      <td className="py-3 px-4 text-foreground text-xs font-mono">{item.unit_name}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${item.quantity <= 10 ? "text-[hsl(var(--warning))]" : "text-foreground"}`}>{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-foreground">₹{item.purchase_rate}</td>
                      <td className="py-3 px-4 text-right text-foreground font-semibold">₹{item.stock_value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Parties Table */}
        {reportType === "parties" && !loading && (
          <div className="bg-card border border-border rounded-md overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Party Ledger Report</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {["Party Name", "Type", "Phone", "Credit Limit", "Outstanding"].map((h) => (
                      <th key={h} className={`py-3 px-4 text-muted-foreground font-medium ${h === "Party Name" || h === "Phone" ? "text-left" : h === "Type" ? "text-center" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partiesData.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-secondary transition">
                      <td className="py-3 px-4 text-foreground font-medium">{p.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-sm font-medium ${p.type === "customer" ? "bg-[hsl(var(--info))] bg-opacity-10 text-[hsl(var(--info))]" : "bg-[hsl(var(--error))] bg-opacity-10 text-[hsl(var(--error))]"}`}>
                          {p.type === "customer" ? "C" : "S"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground">{p.phone}</td>
                      <td className="py-3 px-4 text-right text-foreground">{p.credit_limit ? `₹${p.credit_limit.toLocaleString()}` : "—"}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${p.outstanding > 0 ? p.type === "customer" ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--error))]" : "text-foreground"}`}>
                        ₹{p.outstanding.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
