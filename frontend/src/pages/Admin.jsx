import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  TrendingUp,
  Users,
  Wallet,
  Banknote,
  MessageSquare,
  Home,
  LogOut,
  Menu,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

// const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";
const API_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "badge-pending",
    approved: "badge-approved",
    rejected: "badge-rejected",
    active: "badge-approved",
    completed:
      "bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
    open: "badge-pending",
    resolved: "badge-approved",
  };
  return <span className={styles[status] || "badge-pending"}>{status}</span>;
};

// Admin Login Page
export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <span className="font-heading text-2xl font-bold text-white">
              FlexInvest Admin
            </span>
          </div>
        </div>

        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl text-white">
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flexinvest.com"
                  className="bg-slate-950/50 border-slate-800 text-white"
                  required
                  data-testid="admin-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-slate-950/50 border-slate-800 text-white"
                  required
                  data-testid="admin-password-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
                data-testid="admin-login-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Login as Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Sidebar
const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Wallet, label: "Deposits", path: "/admin/deposits" },
    { icon: Banknote, label: "Withdrawals", path: "/admin/withdrawals" },
    { icon: TrendingUp, label: "Investments", path: "/admin/investments" },
    { icon: MessageSquare, label: "Complaints", path: "/admin/complaints" },
  ];

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-slate-950" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Admin
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Admin Layout
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-heading font-bold text-white">Admin Panel</span>
          <div className="w-6" />
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
};

// Admin Dashboard
export const AdminDashboard = () => {
  const { adminToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [adminToken]);

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-dashboard">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Overview of platform activity</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Total Users
                  </div>
                  <div className="font-heading text-2xl font-bold text-white">
                    {stats.total_users}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-yellow-400" />
                    </div>
                    {stats.pending_deposits > 0 && (
                      <span className="badge-pending">
                        {stats.pending_deposits} pending
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Total Deposited
                  </div>
                  <div className="font-heading text-2xl font-bold text-emerald-400">
                    {formatCurrency(stats.total_deposited)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-red-400" />
                    </div>
                    {stats.pending_withdrawals > 0 && (
                      <span className="badge-pending">
                        {stats.pending_withdrawals} pending
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Total Withdrawn
                  </div>
                  <div className="font-heading text-2xl font-bold text-red-400">
                    {formatCurrency(stats.total_withdrawn)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Active Investments
                  </div>
                  <div className="font-heading text-2xl font-bold text-white">
                    {stats.active_investments}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-white">
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Pending Deposits</span>
                  </div>
                  <span className="font-bold text-yellow-400">
                    {stats.pending_deposits}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Pending Withdrawals</span>
                  </div>
                  <span className="font-bold text-yellow-400">
                    {stats.pending_withdrawals}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Open Complaints</span>
                  </div>
                  <span className="font-bold text-yellow-400">
                    {stats.open_complaints}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Admin Users Page
export const AdminUsersPage = () => {
  const { adminToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditModal, setCreditModal] = useState({ open: false, user: null });
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [adminToken]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditWallet = async () => {
    if (!creditAmount || !creditReason) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/admin/credit-wallet`,
        {
          user_id: creditModal.user.id,
          amount: parseFloat(creditAmount),
          reason: creditReason,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      toast.success("Wallet credited successfully!");
      setCreditModal({ open: false, user: null });
      setCreditAmount("");
      setCreditReason("");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to credit wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-users-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            Users
          </h1>
          <p className="text-slate-400">Manage platform users</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      User
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Wallet
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">
                          {user.full_name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {user.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{user.email}</td>
                      <td className="py-4 px-6 text-emerald-400 font-medium">
                        {formatCurrency(user.wallet_balance)}
                      </td>
                      <td className="py-4 px-6">
                        {user.is_verified ? (
                          <span className="badge-approved">Verified</span>
                        ) : (
                          <span className="badge-pending">Unverified</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          onClick={() => setCreditModal({ open: true, user })}
                          className="btn-secondary text-xs"
                          data-testid={`credit-user-${user.id}`}
                        >
                          Credit Wallet
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Credit Wallet Modal */}
        <Dialog
          open={creditModal.open}
          onOpenChange={(open) =>
            setCreditModal({ open, user: creditModal.user })
          }
        >
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Credit Wallet
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Credit wallet for {creditModal.user?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Amount (₦)</Label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-slate-950/50 border-slate-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Reason</Label>
                <Textarea
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Enter reason for crediting"
                  className="bg-slate-950/50 border-slate-800 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreditModal({ open: false, user: null })}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreditWallet}
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Credit Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

// Admin Deposits Page
export const AdminDepositsPage = () => {
  const { adminToken } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState({
    open: false,
    deposit: null,
    proof: null,
  });
  const [actionModal, setActionModal] = useState({
    open: false,
    deposit: null,
    action: null,
  });
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, [adminToken]);

  const fetchDeposits = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/deposits`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setDeposits(response.data.deposits || []);
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewProof = async (deposit) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/deposits/${deposit.id}/proof`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      setProofModal({ open: true, deposit, proof: response.data.proof_image });
    } catch (error) {
      toast.error("Failed to load proof image");
    }
  };

  const handleAction = async () => {
    if (actionModal.action === "rejected" && !reason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `${API_URL}/admin/deposits/${actionModal.deposit.id}`,
        {
          status: actionModal.action,
          reason: reason || null,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      toast.success(`Deposit ${actionModal.action}!`);
      setActionModal({ open: false, deposit: null, action: null });
      setReason("");
      fetchDeposits();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-deposits-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            Deposits
          </h1>
          <p className="text-slate-400">Review and approve funding requests</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      User
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">
                          {deposit.user_name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {deposit.user_email}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-emerald-400 font-medium">
                        {formatCurrency(deposit.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={deposit.status} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewProof(deposit)}
                            className="text-blue-400 hover:text-blue-300"
                            data-testid={`view-proof-${deposit.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {deposit.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setActionModal({
                                    open: true,
                                    deposit,
                                    action: "approved",
                                  })
                                }
                                className="text-emerald-400 hover:text-emerald-300"
                                data-testid={`approve-deposit-${deposit.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setActionModal({
                                    open: true,
                                    deposit,
                                    action: "rejected",
                                  })
                                }
                                className="text-red-400 hover:text-red-300"
                                data-testid={`reject-deposit-${deposit.id}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Proof Modal */}
        <Dialog
          open={proofModal.open}
          onOpenChange={(open) => setProofModal({ ...proofModal, open })}
        >
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Payment Proof
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {proofModal.deposit?.user_name} -{" "}
                {formatCurrency(proofModal.deposit?.amount || 0)}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {proofModal.proof && (
                <img
                  src={`data:image/jpeg;base64,${proofModal.proof}`}
                  alt="Payment Proof"
                  className="max-w-full rounded-lg mx-auto"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Action Modal */}
        <Dialog
          open={actionModal.open}
          onOpenChange={(open) => setActionModal({ ...actionModal, open })}
        >
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {actionModal.action === "approved" ? "Approve" : "Reject"}{" "}
                Deposit
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {formatCurrency(actionModal.deposit?.amount || 0)} from{" "}
                {actionModal.deposit?.user_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {actionModal.action === "rejected" && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Reason for Rejection</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason"
                    className="bg-slate-950/50 border-slate-800 text-white"
                  />
                </div>
              )}
              {actionModal.action === "approved" && (
                <p className="text-slate-300">
                  This will credit the user's wallet with{" "}
                  {formatCurrency(actionModal.deposit?.amount || 0)}.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setActionModal({ open: false, deposit: null, action: null })
                }
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                className={
                  actionModal.action === "approved"
                    ? "btn-primary"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {actionModal.action === "approved" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export { AdminLayout };
