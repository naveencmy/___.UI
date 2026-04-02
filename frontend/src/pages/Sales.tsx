import { useEffect, useState, useRef } from "react";
import { Search, Plus, Trash2, Receipt } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { ProductAPI, PartyAPI, SalesAPI, type ProductSearchItem, type Party } from "@/lib/api";

interface CartItem {
  product_unit_id: number;
  product: string;
  unit: string;
  quantity: number;
  rate: number;
}

export default function Sales() {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role ?? "owner";
  const canUsePayments = userRole === "cashier" || userRole === "manager" || userRole === "owner";

  // Party / Customer
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Party | null>(null);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [apiProducts, setApiProducts] = useState<ProductSearchItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [billType, setBillType] = useState<"sale" | "return">("sale");
  const [orderSource, setOrderSource] = useState<"inperson" | "phone">("inperson");
  const [discountAmount, setDiscountAmount] = useState("");
  const [cashInput, setCashInput] = useState("");
  const [upiInput, setUpiInput] = useState("");
  const [summaryTab, setSummaryTab] = useState<"summary" | "payment">("summary");
  const [billPaymentType, setBillPaymentType] = useState<"cash" | "credit">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch parties on mount
  useEffect(() => {
    PartyAPI.getAll().then(setAllParties).catch(() => {});
  }, []);

  // Debounced product search
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

  const customers = allParties.filter(
    (p) =>
      p.type === "customer" &&
      (p.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        p.phone.includes(customerSearch))
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

    setCart((prev) => {
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
          rate: selectedProduct.sales_rate,
        },
      ];
    });
    setProductSearch("");
    setSelectedProduct(null);
    setQuantity("");
    setApiProducts([]);
  };

  const handleDeleteCartItem = (unit_id: number) =>
    setCart((prev) => prev.filter((i) => i.product_unit_id !== unit_id));

  const handleQuantityChange = (unit_id: number, newQty: number) => {
    if (newQty <= 0) { handleDeleteCartItem(unit_id); return; }
    setCart((prev) => prev.map((i) => i.product_unit_id === unit_id ? { ...i, quantity: newQty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.rate, 0);
  const discount = parseInt(discountAmount || "0");
  const grandTotal = subtotal - discount;
  const cashAmount = parseInt(cashInput || "0");
  const upiAmount = parseInt(upiInput || "0");
  const creditAmount = Math.max(0, grandTotal - cashAmount - upiAmount);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const paymentStatus =
    creditAmount === 0 ? "fully-paid" : creditAmount === grandTotal ? "full-credit" : "partial";

  useEffect(() => {
    if (!canUsePayments && summaryTab === "payment") setSummaryTab("summary");
  }, [canUsePayments, summaryTab]);

  const handleFinalizeBill = async () => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const payments = [
        cashAmount > 0 ? { method: "cash" as const, amount: cashAmount } : null,
        upiAmount > 0 ? { method: "upi" as const, amount: upiAmount } : null,
        creditAmount > 0 ? { method: "credit" as const, amount: creditAmount } : null,
      ].filter(Boolean) as { method: "cash" | "upi" | "credit"; amount: number }[];

      if (payments.length === 0) payments.push({ method: "cash", amount: grandTotal });

      const res = await (billType === "sale"
        ? SalesAPI.create({
            party_id: selectedCustomer?.id ?? null,
            subtotal,
            discount,
            tax: 0,
            total: grandTotal,
            items: cart.map((i) => ({
              product_unit_id: i.product_unit_id,
              quantity: i.quantity,
              rate: i.rate,
              total: i.quantity * i.rate,
            })),
            payments,
          })
        : SalesAPI.returnSale({
            party_id: selectedCustomer?.id ?? null,
            subtotal,
            discount,
            tax: 0,
            total: grandTotal,
            items: cart.map((i) => ({
              product_unit_id: i.product_unit_id,
              quantity: i.quantity,
              rate: i.rate,
              total: i.quantity * i.rate,
            })),
            payments,
          }));

      setSuccessMsg(`✓ ${res.invoice_number ?? "Bill recorded"}`);
      setCart([]);
      setCashInput("");
      setUpiInput("");
      setDiscountAmount("");
      setSelectedCustomer(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("✗ Failed to record bill");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 pb-96">
        <div className="text-xs text-muted-foreground">
          Logged in as{" "}
          <span className="font-semibold text-foreground">{currentUser?.name ?? "Owner"}</span>
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 uppercase tracking-[0.25em]">
            {userRole}
          </span>
          {successMsg && (
            <span className={`ml-4 font-semibold ${successMsg.startsWith("✓") ? "text-[hsl(var(--success))]" : "text-[hsl(var(--error))]"}`}>
              {successMsg}
            </span>
          )}
        </div>

        {/* Header */}
        <div className="bg-card border border-border rounded-md p-4 flex gap-6 items-start">
          <div className="flex gap-6 shrink-0">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Bill Type</label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value as "sale" | "return")}
                className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="sale">Sale</option>
                <option value="return">Return</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Order Source</label>
              <select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value as "inperson" | "phone")}
                className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="inperson">In-Person</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          {/* Customer Search */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-2">Customer Search</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Name / Phone / Bill No"
                  className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {selectedCustomer && (
                <button
                  onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                  className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-sm text-sm transition"
                >
                  Clear
                </button>
              )}
            </div>

            {customerSearch && !selectedCustomer && customers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-w-md bg-card border border-border shadow-lg rounded-sm overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); }}
                      className="w-full text-left p-3 hover:bg-secondary transition border-b border-border last:border-0"
                    >
                      <div className="font-medium text-foreground text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCustomer && (
              <div className="mt-2 p-2 bg-secondary rounded-sm flex items-center gap-4">
                <div className="text-sm font-medium text-foreground">{selectedCustomer.name}</div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Outstanding:</span>{" "}
                    <span className="font-semibold text-[hsl(var(--warning))]">
                      ₹{selectedCustomer.outstanding.toLocaleString()}
                    </span>
                  </div>
                  {selectedCustomer.credit_limit && (
                    <div>
                      <span className="text-muted-foreground">Limit:</span>{" "}
                      <span className="font-semibold text-foreground">
                        ₹{selectedCustomer.credit_limit.toLocaleString()}
                      </span>
                    </div>
                  )}
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
                      {p.unit_name} — ₹{p.sales_rate}
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
                    {selectedProduct.unit_name} · ₹{selectedProduct.sales_rate} · Barcode: {selectedProduct.barcode}
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
                  Add to Cart (Enter)
                </button>
              </div>
            )}
          </div>

          {/* Cart Table */}
          {cart.length > 0 && (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Cart ({cart.length} items)</h3>
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
                    {cart.map((item) => (
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
                          <button onClick={() => handleDeleteCartItem(item.product_unit_id)} className="p-1 hover:bg-secondary rounded-sm transition text-muted-foreground hover:text-foreground">
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
          className="fixed bottom-0 right-0 bg-card border-t border-border rounded-t-md transition-all duration-300 z-30"
          style={{ left: "var(--sidebar-width)" }}
        >
          <div className="flex border-b border-border">
            <button
              onClick={() => setSummaryTab("summary")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition border-b-2 flex items-center justify-center gap-2 ${summaryTab === "summary" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Summary ({itemCount})</span>
            </button>
            {canUsePayments && (
              <button
                onClick={() => setSummaryTab("payment")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition border-b-2 ${summaryTab === "payment" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
              >
                💳 <span className="hidden sm:inline">Payment</span>
              </button>
            )}
          </div>

          <div className="p-6">
            {summaryTab === "summary" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-foreground font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Discount (₹):</label>
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-foreground font-semibold">Grand Total:</span>
                        <span className="text-2xl font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary border border-border rounded-sm p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-semibold text-foreground">{itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bill Type:</span>
                      <span className="font-semibold text-foreground">{billType === "sale" ? "Sale" : "Return"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Source:</span>
                      <span className="font-semibold text-foreground">{orderSource === "inperson" ? "In-Person" : "Phone"}</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="text-xs text-muted-foreground mb-2">Payment Type:</div>
                      {canUsePayments ? (
                        <select
                          value={billPaymentType}
                          onChange={(e) => setBillPaymentType(e.target.value as "cash" | "credit")}
                          className="w-full bg-input border border-border rounded-sm px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="cash">Cash</option>
                          <option value="credit">Credit</option>
                        </select>
                      ) : (
                        <span className="text-sm font-semibold text-foreground">Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {summaryTab === "payment" && canUsePayments && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {[{ label: "Cash", state: cashInput, set: setCashInput }, { label: "UPI", state: upiInput, set: setUpiInput }].map(({ label, state, set }) => (
                      <div key={label}>
                        <label className="text-xs text-muted-foreground block mb-2">{label}</label>
                        <input
                          type="number"
                          value={state}
                          onChange={(e) => set(e.target.value)}
                          placeholder="0"
                          className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Credit</label>
                      <div className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm font-semibold text-foreground">
                        ₹{creditAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-secondary border border-border rounded-sm p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-4 h-4 rounded-full ${paymentStatus === "fully-paid" ? "bg-[hsl(var(--success))]" : paymentStatus === "partial" ? "bg-[hsl(var(--warning))]" : "bg-[hsl(var(--error))]"}`} />
                        <span className="text-sm font-semibold text-foreground">
                          {paymentStatus === "fully-paid" ? "Fully Paid" : paymentStatus === "partial" ? "Partial Payment" : "Full Credit"}
                        </span>
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="text-xs text-muted-foreground mb-1">Total to Collect:</div>
                        <div className="text-2xl font-bold text-primary">₹{grandTotal.toLocaleString()}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleFinalizeBill}
                      disabled={cart.length === 0 || submitting}
                      className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-3 rounded-sm font-semibold transition"
                    >
                      {submitting ? "Processing…" : "Finalize Bill"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
