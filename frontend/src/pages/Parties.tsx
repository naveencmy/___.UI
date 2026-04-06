import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PartyAPI, type Party, type LedgerEntry, type CreatePartyRequest } from "@/lib/api";

export default function Parties() {
  const [partyType, setPartyType] = useState<"customer" | "supplier">("customer");
  const [parties, setParties] = useState<Party[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    creditLimit: "",
    openingBalance: "",
  });

  useEffect(() => {
    PartyAPI.getAll()
      .then(setParties)
      .catch(() => setError("Failed to load parties"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectParty = async (party: Party) => {
    setSelectedParty(party);
    setLedgerLoading(true);
    try {
      const entries = await PartyAPI.ledger(party.id);
      setLedger(entries);
    } catch {
      setLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleAddParty = async () => {
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);
    try {
      const payload: CreatePartyRequest = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        type: partyType,
        credit_limit: formData.creditLimit ? parseInt(formData.creditLimit) : undefined,
        opening_balance: formData.openingBalance ? parseInt(formData.openingBalance) : undefined,
      };
      const created = await PartyAPI.create(payload);
      setParties((prev) => [...prev, created]);
      setShowForm(false);
      setFormData({ name: "", phone: "", email: "", address: "", creditLimit: "", openingBalance: "" });
    } catch {
      setError("Failed to create party");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParty = async (party: Party) => {
    if (!confirm(`Delete ${party.name}?`)) return;
    try {
      await PartyAPI.delete(party.id);
      setParties((prev) => prev.filter((p) => p.id !== party.id));
      if (selectedParty?.id === party.id) setSelectedParty(null);
    } catch {
      setError("Failed to delete party");
    }
  };

  const filteredParties = parties.filter(
    (p) =>
      p.type === partyType &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm))
  );

  const totalCustomerBalance = parties
    .filter((p) => p.type === "customer")
    .reduce((sum, p) => sum + Math.max(0, p.outstanding ?? 0), 0);

  const totalSupplierBalance = parties
    .filter((p) => p.type === "supplier")
    .reduce((sum, p) => sum + Math.max(0, p.outstanding ?? 0), 0);

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="metric-label">
              {partyType === "customer" ? "Total Customers" : "Total Suppliers"}
            </div>
            <div className="metric-value">{filteredParties.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">
              {partyType === "customer" ? "Total Receivables" : "Total Payables"}
            </div>
            <div
              className={`metric-value ${
                partyType === "customer"
                  ? "text-[hsl(var(--warning))]"
                  : "text-[hsl(var(--error))]"
              }`}
            >
              ₹{(partyType === "customer" ? totalCustomerBalance : totalSupplierBalance).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-md font-semibold transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add {partyType === "customer" ? "Customer" : "Supplier"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[hsl(var(--error))] text-sm p-4 bg-card border border-border rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left - Party List */}
          <div className="col-span-2">
            <div className="bg-card border border-border rounded-md p-4">
              {/* Type Selector */}
              <div className="flex gap-4 mb-4">
                {(["customer", "supplier"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setPartyType(type); setSelectedParty(null); }}
                    className={`px-4 py-2 rounded-sm text-sm font-medium transition capitalize ${
                      partyType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {type === "customer" ? "Customers" : "Suppliers"}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name / Phone"
                  className="w-full bg-input border border-border rounded-sm pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {loading ? (
                <div className="text-center text-muted-foreground text-sm py-8">Loading parties…</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredParties.map((party) => (
                    <button
                      key={party.id}
                      onClick={() => handleSelectParty(party)}
                      className={`w-full text-left p-4 rounded-sm border transition ${
                        selectedParty?.id === party.id
                          ? "bg-primary bg-opacity-10 border-primary"
                          : "bg-secondary border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground">{party.name}</div>
                          <div className="text-xs text-muted-foreground">{party.phone}</div>
                        </div>
                        <div
                          className={`font-semibold text-lg ${
                            party.outstanding > 0
                              ? partyType === "customer"
                                ? "text-[hsl(var(--warning))]"
                                : "text-[hsl(var(--error))]"
                              : "text-foreground"
                          }`}
                        >
                          ₹{(party.outstanding ?? 0).toLocaleString()}
                        </div>
                      </div>
                      {party.credit_limit && (
                        <div className="text-xs text-muted-foreground">
                          Credit Limit: ₹{party.credit_limit.toLocaleString()}
                        </div>
                      )}
                    </button>
                  ))}
                  {filteredParties.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground text-sm py-8">No parties found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right - Party Details */}
          {selectedParty && (
            <div className="col-span-1 sticky top-6">
              <div className="bg-card border border-border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {selectedParty.name}
                    </h3>
                    <div className="text-xs text-muted-foreground capitalize">
                      {selectedParty.type}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-secondary rounded-sm transition">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="text-foreground">{selectedParty.phone}</div>
                  </div>
                  {selectedParty.credit_limit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit Limit:</span>
                      <span className="font-semibold text-foreground">
                        ₹{selectedParty.credit_limit.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {selectedParty.type === "customer" ? "Outstanding" : "Payable"}:
                    </span>
                    <span
                      className={`font-semibold ${
                        selectedParty.type === "customer"
                          ? "text-[hsl(var(--warning))]"
                          : "text-[hsl(var(--error))]"
                      }`}
                    >
                      ₹{(selectedParty.outstanding ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Ledger History */}
                <div className="border-t border-border pt-3">
                  <h4 className="text-xs font-semibold text-foreground mb-3">Ledger History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {ledgerLoading ? (
                      <div className="text-center text-muted-foreground py-4">Loading…</div>
                    ) : ledger.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">No ledger entries</div>
                    ) : (
                      ledger.map((entry, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2 bg-secondary rounded-sm"
                        >
                          <div>
                            <div className="text-foreground font-medium">{entry.type}</div>
                            <div className="text-muted-foreground">{entry.reference}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">
                              ₹{(entry.amount ?? 0).toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">{entry.date}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteParty(selectedParty)}
                  className="w-full mt-4 border border-[hsl(var(--error))] text-[hsl(var(--error))] hover:bg-[hsl(var(--error))] hover:bg-opacity-10 py-2 rounded-sm text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Party Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-md p-6 w-96 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Add {partyType === "customer" ? "Customer" : "Supplier"}
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Name", key: "name", type: "text" },
                  { label: "Phone", key: "phone", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Address", key: "address", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                    <input
                      type={type}
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
                {partyType === "customer" && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Credit Limit</label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Opening Balance</label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-sm text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddParty}
                  disabled={submitting || !formData.name || !formData.phone}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-2 rounded-sm text-sm font-medium transition"
                >
                  {submitting ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
