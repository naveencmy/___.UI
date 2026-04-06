import { useState, useEffect, useRef } from "react";
import { Lock, Save, LogOut, Info, Eye, EyeOff, UserPlus, Loader2, Pencil } from "lucide-react";
import { Layout } from "@/components/Layout";
import { UserAPI, BackupAPI, AuthAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SystemUser {
  id: number;
  username: string;
  role: string;
  active: boolean;
}

const ROLES = ["owner", "manager", "worker"] as const;

const roleBadgeClass: Record<string, string> = {
  owner: "bg-[hsl(var(--error))] text-white",
  manager: "bg-[hsl(var(--warning))] text-black",
  worker: "bg-[hsl(var(--info))] text-white",
};

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"general" | "users" | "backup" | "security">(
    "general"
  );

  /* ── General ── */
  const [businessName, setBusinessName] = useState("RetailPOS");
  const [businessPhone, setBusinessPhone] = useState("98765 00000");
  const [gstNo, setGstNo] = useState("18AABCR5055K1Z2");
  const [defaultWarehouse, setDefaultWarehouse] = useState("Main Store");
  const [taxRate, setTaxRate] = useState("5");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("IST");

  /* ── Users ── */
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Add user dialog
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<string>("worker");
  const [addingUser, setAddingUser] = useState(false);

  // Edit user dialog
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editRole, setEditRole] = useState<string>("worker");
  const [savingEdit, setSavingEdit] = useState(false);

  // Toggle state
  const [togglingId, setTogglingId] = useState<number | null>(null);

  /* ── Backup ── */
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("Every 6 hours");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Security ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState("30");

  /* ── Load users when tab becomes active ── */
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await UserAPI.getUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  /* ── User handlers ── */
  const handleAddUser = async () => {
    if (!addUsername.trim() || !addPassword) {
      toast.error("Username and password are required");
      return;
    }
    setAddingUser(true);
    try {
      await UserAPI.create({ username: addUsername.trim(), password: addPassword, role: addRole });
      toast.success("User created successfully");
      setShowAddUser(false);
      setAddUsername("");
      setAddPassword("");
      setAddRole("worker");
      fetchUsers();
    } catch {
      toast.error("Failed to create user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setShowEditUser(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      await UserAPI.update(editingUser.id, { role: editRole });
      toast.success("User role updated");
      setShowEditUser(false);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleUser = async (user: SystemUser) => {
    setTogglingId(user.id);
    try {
      await UserAPI.toggle(user.id);
      toast.success(user.active ? "User deactivated" : "User activated");
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Backup handlers ── */
  const handleBackupNow = async () => {
    setBackupLoading(true);
    try {
      await BackupAPI.create();
      toast.success("Backup created successfully");
    } catch {
      toast.error("Backup failed. Please try again.");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      toast.error("Please select a backup file first");
      return;
    }
    setRestoreLoading(true);
    try {
      await BackupAPI.restore(restoreFile);
      toast.success("Database restored successfully");
      setRestoreFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Restore failed. Please try again.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleSaveSchedule = () => {
    toast.success(`Auto backup schedule set to "${backupFrequency}"`);
  };

  /* ── Security handlers ── */
  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error("All password fields are required");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPwd.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setChangingPwd(true);
    try {
      await AuthAPI.changePassword({ current: currentPwd, newPassword: newPwd });
      toast.success("Password updated successfully");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch {
      toast.error("Failed to update password. Check your current password.");
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveGeneral = () => {
    toast.success("Settings saved successfully");
  };

  /* ── Shared input class ── */
  const inputCls =
    "w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">System Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your RetailPOS system</p>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-md">
          <div className="flex border-b border-border">
            {(["general", "users", "backup", "security"] as const).map((tab) => {
              const labels: Record<typeof tab, string> = {
                general: "General",
                users: "Users & Roles",
                backup: "Backup & Restore",
                security: "Security",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                    activeTab === tab
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* ── General ── */}
            {activeTab === "general" && (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={inputCls}
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
                    className={inputCls}
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
                    className={inputCls}
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
                      className={inputCls}
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
                      className={inputCls}
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
                      className={inputCls}
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
                      className={inputCls}
                    >
                      <option>IST (UTC+5:30)</option>
                      <option>UTC</option>
                      <option>EST</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSaveGeneral}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}

            {/* ── Users & Roles ── */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-foreground">System Users</h3>
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
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
                      {usersLoading ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 text-center text-sm text-muted-foreground"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-border hover:bg-secondary/50 transition"
                          >
                            <td className="py-3 px-4 text-foreground font-medium capitalize">
                              {user.username}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">—</td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold capitalize ${
                                  roleBadgeClass[user.role] ?? "bg-muted text-foreground"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold ${
                                  user.active
                                    ? "bg-[hsl(var(--success))] text-white"
                                    : "bg-[hsl(var(--error))] text-white"
                                }`}
                              >
                                {user.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center space-x-3">
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="text-primary hover:text-primary/80 text-xs font-medium transition inline-flex items-center gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </button>
                              {user.role !== "owner" && (
                                <button
                                  onClick={() => handleToggleUser(user)}
                                  disabled={togglingId === user.id}
                                  className="text-[hsl(var(--error))] hover:text-[hsl(var(--error))]/80 text-xs font-medium transition disabled:opacity-50"
                                >
                                  {togglingId === user.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin inline" />
                                  ) : user.active ? (
                                    "Deactivate"
                                  ) : (
                                    "Activate"
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-secondary border border-border rounded-md p-4 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Role Permissions</h4>
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
                      <strong className="text-foreground">Worker:</strong> Access to Sales and
                      basic Inventory only
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Backup & Restore ── */}
            {activeTab === "backup" && (
              <div className="space-y-4 max-w-2xl">
                {/* Database Backup */}
                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Database Backup</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Last backup: 2025-02-25 at 22:30 IST
                  </p>
                  <button
                    onClick={handleBackupNow}
                    disabled={backupLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
                  >
                    {backupLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Backup Now
                  </button>
                </div>

                {/* Restore from Backup */}
                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    Restore from Backup
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Choose a backup file to restore
                  </p>
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".backup,.sql"
                      onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
                      className="text-sm text-foreground file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border file:border-border file:text-xs file:font-medium file:bg-secondary file:text-foreground hover:file:bg-muted cursor-pointer"
                    />
                    <button
                      onClick={handleRestore}
                      disabled={restoreLoading || !restoreFile}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
                    >
                      {restoreLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Restore
                    </button>
                  </div>
                </div>

                {/* Auto Backup Schedule */}
                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Auto Backup Schedule
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Frequency</label>
                      <select
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        className={inputCls}
                      >
                        <option>Every 6 hours</option>
                        <option>Every 12 hours</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSaveSchedule}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition"
                    >
                      Save Backup Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {activeTab === "security" && (
              <div className="space-y-4 max-w-2xl">
                {/* Change Password */}
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
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className={inputCls}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          className={`${inputCls} pr-10`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        className={inputCls}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPwd}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
                    >
                      {changingPwd && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Session Security */}
                <div className="bg-secondary border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Session Security
                  </h4>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Auto Logout (minutes):</span>
                      <input
                        type="number"
                        value={autoLogoutMinutes}
                        onChange={(e) => setAutoLogoutMinutes(e.target.value)}
                        min="5"
                        max="480"
                        className="w-20 bg-input border border-border rounded-sm px-2 py-1 text-sm text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      User will be automatically logged out after inactivity
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-[hsl(var(--error))] hover:bg-[hsl(var(--error))]/90 text-white px-4 py-2 rounded-sm text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add User Dialog ── */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Username</label>
              <input
                type="text"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                className={inputCls}
                placeholder="e.g. john_cashier"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
              <input
                type="password"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                className={inputCls}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Role</label>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowAddUser(false)}
              className="px-4 py-2 rounded-sm text-sm font-medium text-muted-foreground border border-border hover:bg-secondary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={addingUser}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
            >
              {addingUser && <Loader2 className="w-4 h-4 animate-spin" />}
              Create User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground capitalize">
              Edit User — {editingUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowEditUser(false)}
              className="px-4 py-2 rounded-sm text-sm font-medium text-muted-foreground border border-border hover:bg-secondary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
            >
              {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
