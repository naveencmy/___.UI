import { useState, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { InventoryAPI, type InventoryItem, type InventoryMovement } from "@/lib/api";

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    Promise.all([InventoryAPI.getAll(), InventoryAPI.movements()])
      .then(([inv, mov]) => {
        setItems(inv);
        setMovements(mov);
      })
      .catch(() => setError("Failed to load inventory data"))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.unit_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValuation = items.reduce((sum, i) => sum + i.stock_value, 0);
  const lowStockCount = items.filter((i) => i.quantity <= 10).length;

  const handleAdjustStock = async () => {
    if (!adjustmentQty || !selectedItem) return;
    setAdjusting(true);
    try {
      await InventoryAPI.adjust({
        product_unit_id: selectedItem.product_unit_id,
        quantity_change: parseInt(adjustmentQty),
        reason: adjustmentReason || "Manual Adjustment",
      });
      const updated = await InventoryAPI.getAll();
      setItems(updated);
      const found = updated.find(
        (i) => i.product_unit_id === selectedItem.product_unit_id
      );
      if (found) setSelectedItem(found);
      setAdjustmentQty("");
      setAdjustmentReason("");
    } catch {
      setError("Failed to adjust stock");
    } finally {
      setAdjusting(false);
    }
  };

  const itemMovements = movements.filter(
    (m) => selectedItem && m.unit_name === selectedItem.unit_name
  );

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{items.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Stock Valuation</div>
            <div className="metric-value">₹{totalValuation.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Low Stock Items</div>
            <div className="metric-value">{lowStockCount}</div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Loading inventory…
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 text-[hsl(var(--error))] text-sm p-4 bg-card border border-border rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4">
            {/* Left - Product List */}
            <div className="col-span-2">
              <div className="bg-card border border-border rounded-md p-4">
                <label className="text-xs text-muted-foreground block mb-3">Search Products</label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name / Unit"
                    className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <button
                      key={item.product_unit_id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-4 rounded-sm border transition ${
                        selectedItem?.product_unit_id === item.product_unit_id
                          ? "bg-primary bg-opacity-10 border-primary"
                          : "bg-secondary border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.unit_name}</div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            item.quantity <= 10
                              ? "text-[hsl(var(--warning))]"
                              : "text-foreground"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Purchase:</span>
                          <div className="font-semibold text-foreground">₹{item.purchase_rate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <div className="font-semibold text-foreground">{item.quantity}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <div className="font-semibold text-[hsl(var(--success))]">
                            ₹{item.stock_value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No products found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Product Details */}
            {selectedItem && (
              <div className="col-span-1 sticky top-6 space-y-4">
                <div className="bg-card border border-border rounded-md p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {selectedItem.name}
                    </h3>
                    <div className="text-xs text-muted-foreground">{selectedItem.unit_name}</div>
                  </div>

                  <div className="border-t border-border pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-semibold text-foreground">{selectedItem.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Rate:</span>
                      <span className="font-semibold text-foreground">₹{selectedItem.purchase_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock Value:</span>
                      <span className="font-semibold text-[hsl(var(--success))]">
                        ₹{selectedItem.stock_value.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stock Adjustment */}
                  <div className="border-t border-border pt-3">
                    <div className="text-xs font-semibold text-foreground mb-3">
                      Manual Adjustment
                    </div>
                    <div className="space-y-2 mb-3">
                      <input
                        type="number"
                        value={adjustmentQty}
                        onChange={(e) => setAdjustmentQty(e.target.value)}
                        placeholder="Qty (+ or -)"
                        className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        placeholder="Reason (e.g. Damage)"
                        className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleAdjustStock}
                      disabled={!adjustmentQty || adjusting}
                      className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-2 rounded-sm text-sm font-medium transition"
                    >
                      {adjusting ? "Adjusting…" : "Adjust Stock"}
                    </button>
                  </div>
                </div>

                {/* Movement History */}
                <div className="bg-card border border-border rounded-md p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-3">Recent Movements</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {itemMovements.length === 0 ? (
                      <div className="text-muted-foreground text-center py-4">No movements</div>
                    ) : (
                      itemMovements.slice(0, 10).map((m) => (
                        <div
                          key={m.id}
                          className="flex justify-between items-center p-2 bg-secondary rounded-sm"
                        >
                          <div>
                            <div className="text-foreground font-medium">{m.type}</div>
                            <div className="text-muted-foreground">{m.reference}</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-semibold ${
                                m.quantity > 0
                                  ? "text-[hsl(var(--success))]"
                                  : "text-[hsl(var(--error))]"
                              }`}
                            >
                              {m.quantity > 0 ? "+" : ""}{m.quantity} {m.unit_name}
                            </div>
                            <div className="text-muted-foreground">{m.date}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
