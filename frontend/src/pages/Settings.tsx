import { useState } from "react";
import { Lock, Save, LogOut, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<
    "general" | "users" | "backup" | "security"
  >("general");
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("RetailPOS");
  const [businessPhone, setBusinessPhone] = useState("98765 00000");
  const [gstNo, setGstNo] = useState("18AABCR5055K1Z2");
  const [defaultWarehouse, setDefaultWarehouse] = useState("Main Store");
  const [taxRate, setTaxRate] = useState("5");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("IST");

  const [users] = useState([
    {
      id: "1",
      name: "John Owner",
      email: "john@retailpos.com",
      role: "Owner",
      status: "Active",
    },
    {
      id: "2",
      name: "Alice Manager",
      email: "alice@retailpos.com",
      role: "Manager",
      status: "Active",
    },
    {
      id: "3",
      name: "Bob Worker",
      email: "bob@retailpos.com",
      role: "Worker",
      status: "Active",
    },
  ]);

  const handleSaveChanges = () => {
    // In a real app, this would save to backend
    alert("Settings saved successfully");
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your RetailPOS system
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-md">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === "general"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === "users"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Users & Roles
            </button>
            <button
              onClick={() => setActiveTab("backup")}
              className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === "backup"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Backup & Restore
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === "security"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Business Phone
                  </label>
                  <input
                    type="text"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Default Warehouse
                    </label>
                    <select
                      value={defaultWarehouse}
                      onChange={(e) => setDefaultWarehouse(e.target.value)}
                      className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Main Store</option>
                      <option>Branch 1</option>
                      <option>Branch 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      step="0.01"
                      className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>INR</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-input border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>IST (UTC+5:30)</option>
                      <option>UTC</option>
                      <option>EST</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveChanges}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm font-medium transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Users & Roles */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-foreground">System Users</h3>
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition">
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                          Email
                        </th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                          Role
                        </th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                          Status
                        </th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border hover:bg-secondary transition"
                        >
                          <td className="py-3 px-4 text-foreground font-medium">
                            {user.name}
                          </td>
                          <td className="py-3 px-4 text-foreground">{user.email}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-xs px-2 py-1 rounded-sm font-medium ${
                                user.role === "Owner"
                                  ? "bg-[hsl(var(--error))] bg-opacity-10 text-[hsl(var(--error))]"
                                  : user.role === "Manager"
                                    ? "bg-[hsl(var(--warning))] bg-opacity-10 text-[hsl(var(--warning))]"
                                    : "bg-[hsl(var(--info))] bg-opacity-10 text-[hsl(var(--info))]"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-xs px-2 py-1 rounded-sm font-medium bg-[hsl(var(--success))] bg-opacity-10 text-[hsl(var(--success))]">
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center space-x-2">
                            <button className="text-primary hover:text-primary/80 text-xs font-medium transition">
                              Edit
                            </button>
                            {user.role !== "Owner" && (
                              <button className="text-[hsl(var(--error))] hover:text-[hsl(var(--error))]/80 text-xs font-medium transition">
                                Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-secondary border border-border rounded-md p-4 mt-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Role Permissions
                  </h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Owner:</strong> Full access to all
                      features and settings
                    </p>
                    <p>
                      <strong className="text-foreground">Manager:</strong> Access to Sales,
                      Purchase, Inventory, Reports
                    </p>
                    <p>
                      <strong className="text-foreground">Worker:</strong> Access to Sales
                      and basic Inventory only
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Backup & Restore */}
            {activeTab === "backup" && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Database Backup
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Last backup: 2025-02-25 at 22:30 IST
                  </p>
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition">
                    Backup Now
                  </button>
                </div>

                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Restore from Backup
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Choose a backup file to restore
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".backup,.sql"
                      className="bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition">
                      Restore
                    </button>
                  </div>
                </div>

                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Auto Backup Schedule
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        Frequency
                      </label>
                      <select className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Every 6 hours</option>
                        <option>Every 12 hours</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition">
                      Save Backup Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full bg-input border border-border rounded-sm px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Session Security
                  </h4>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auto Logout (minutes):</span>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-20 bg-input border border-border rounded-sm px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      User will be automatically logged out after inactivity
                    </p>
                  </div>

                  <button className="w-full bg-[hsl(var(--error))] hover:bg-[hsl(var(--error))]/90 text-white px-4 py-2 rounded-sm text-sm font-medium transition flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
