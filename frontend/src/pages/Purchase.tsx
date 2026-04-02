import { useState, useEffect, useRef } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductAPI, PartyAPI, PurchaseAPI, type ProductSearchItem, type Party } from "@/lib/api";

interface PurchaseItem {
  product_unit_id: number;
  product: string;
  unit: string;
  quantity: number;
  rate: number;
}

export default function Purchase() {
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);

  const [productSearch, setProductSearch] = useState("");
  const [apiProducts, setApiProducts] = useState<ProductSearchItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [billType, setBillType] = useState<"purchase" | "return">("purchase");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    PartyAPI.getAll().then(setAllParties).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!productSearch.trim()) { setApiProducts([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await ProductAPI.search(productSearch);
        setApiProducts(results);
      } catch { setApiProducts([]); }
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [productSearch]);

  const suppliers = allParties.filter(
    (p) =>
      p.type === "supplier" &&
      (p.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        p.phone.includes(supplierSearch))
  );

  const handleSelectProduct = (product: ProductSearchItem) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setApiProducts([]);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity) return;
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product_unit_id === selectedProduct.unit_id);
      if (existing) {
        return prev.map((i) =>
          i.product_unit_id === selectedProduct.unit_id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          product_unit_id: selectedProduct.unit_id,
          product: selectedProduct.name,
          unit: selectedProduct.unit_name,
          quantity: qty,
          rate: selectedProduct.purchase_rate ?? selectedProduct.sales_rate,
        },
      ];
    });
    setProductSearch("");
    setSelectedProduct(null);
    setQuantity("");
    setApiProducts([]);
  };

  const handleDeleteItem = (unit_id: number) =>
    setItems((prev) => prev.filter((i) => i.product_unit_id !== unit_id));

  const handleQuantityChange = (unit_id: number, newQty: number) => {
    if (newQty <= 0) { handleDeleteItem(unit_id); return; }
    setItems((prev) => prev.map((i) => i.product_unit_id === unit_id ? { ...i, quantity: newQty } : i));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const handleRecordPurchase = async () => {
    if (items.length === 0 || !selectedSupplier || submitting) return;
    setSubmitting(true);
    try {
      const res = await PurchaseAPI.create({
        party_id: selectedSupplier.id,
        subtotal,
        discount: 0,
        tax: gst,
        total,
        items: items.map((i) => ({
          product_unit_id: i.product_unit_id,
          quantity: i.quantity,
          rate: i.rate,
          total: i.quantity * i.rate,
        })),
        payments: [{ method: "cash", amount: total }],
      });
      setSuccessMsg(`✓ ${res.invoice_number ?? "Purchase recorded"}`);
      setItems([]);
      setSelectedSupplier(null);
      setSupplierSearch("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("✗ Failed to record purchase");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 pb-48">
        {successMsg && (
          <div className={`text-sm font-semibold px-4 py-2 rounded-sm ${successMsg.startsWith("✓") ? "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10" : "text-[hsl(var(--error))] bg-[hsl(var(--error))]/10"}`}>
            {successMsg}
          </div>
        )}

        {/* Header */}
        <div className="bg-card border border-border rounded-md p-4 flex gap-6 items-start">
          <div className="flex gap-6 shrink-0">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Bill Type</label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value as "purchase" | "return")}
                className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="purchase">Purchase</option>
                <option value="return">Purchase Return</option>
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-2">Supplier Search</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Name / Phone"
                  className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {selectedSupplier && (
                <button
                  onClick={() => { setSelectedSupplier(null); setSupplierSearch(""); }}
                  className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-sm text-sm transition"
                >
                  Clear
                </button>
              )}
            </div>

            {supplierSearch && !selectedSupplier && suppliers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-w-md bg-card border border-border shadow-lg rounded-sm overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {suppliers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSupplier(s); setSupplierSearch(""); }}
                      className="w-full text-left p-3 hover:bg-secondary transition border-b border-border last:border-0"
                    >
                      <div className="font-medium text-foreground text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.phone}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSupplier && (
              <div className="mt-2 p-2 bg-secondary rounded-sm flex items-center gap-4">
                <div className="text-sm font-medium text-foreground">{selectedSupplier.name}</div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Payable:</span>{" "}
                  <span className="font-semibold text-[hsl(var(--error))]">
                    ₹{selectedSupplier.outstanding.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Search */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-md p-4">
            <label className="text-xs text-muted-foreground block mb-3">Product Search</label>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                  placeholder="Name / Barcode"
                  className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {productSearch && apiProducts.length > 0 && !selectedProduct && (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {apiProducts.map((p) => (
                  <button
                    key={`${p.id}-${p.unit_id}`}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full text-left p-3 bg-secondary hover:bg-secondary/80 rounded-sm text-sm transition"
                  >
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.unit_name} · Barcode: {p.barcode}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="space-y-3 mb-3">
                <div className="p-3 bg-secondary rounded-sm text-sm">
                  <div className="font-medium text-foreground">{selectedProduct.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedProduct.unit_name} · Purchase Rate: ₹{selectedProduct.purchase_rate ?? "—"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-sm text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item (Enter)
                </button>
              </div>
            )}
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Purchase Items ({items.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      {["Product", "Unit", "Qty", "Rate", "Total", ""].map((h, i) => (
                        <th key={i} className={`py-3 px-4 text-muted-foreground font-medium ${i === 0 ? "text-left" : i === 5 ? "text-center" : i >= 3 ? "text-right" : "text-center"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.product_unit_id} className="border-b border-border hover:bg-secondary transition">
                        <td className="py-3 px-4 text-foreground">{item.product}</td>
                        <td className="py-3 px-4 text-center text-foreground font-mono text-xs">{item.unit}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product_unit_id, parseInt(e.target.value))}
                            className="w-16 bg-input border border-border rounded-sm px-2 py-1 text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </td>
                        <td className="py-3 px-4 text-right text-foreground font-mono">₹{item.rate}</td>
                        <td className="py-3 px-4 text-right text-foreground font-semibold">₹{(item.quantity * item.rate).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleDeleteItem(item.product_unit_id)} className="p-1 hover:bg-secondary rounded-sm transition text-muted-foreground hover:text-foreground">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div
          className="fixed bottom-0 right-0 bg-card border-t border-border p-6 shadow-lg z-30 transition-all duration-300"
          style={{ left: "var(--sidebar-width)" }}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex gap-12 flex-1">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">GST (5%)</span>
                <span className="text-lg font-semibold text-foreground">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleRecordPurchase}
              disabled={items.length === 0 || !selectedSupplier || submitting}
              className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground px-10 py-3 rounded-sm font-bold text-lg transition shadow-sm"
            >
              {submitting ? "Recording…" : "Record Purchase"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
