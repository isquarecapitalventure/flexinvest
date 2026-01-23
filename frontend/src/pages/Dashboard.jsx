import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { 
  TrendingUp, Wallet, Home, Package, History, LogOut, Menu, X, 
  Banknote, Upload, Plus, ArrowUpRight, ArrowDownLeft, Clock, 
  CheckCircle, XCircle, ChevronRight, HelpCircle, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `http://localhost:8000/api`;

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    active: 'badge-approved',
    completed: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
    open: 'badge-pending',
    resolved: 'badge-approved'
  };
  return <span className={styles[status] || 'badge-pending'}>{status}</span>;
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Investments', path: '/dashboard/investments' },
    { icon: Wallet, label: 'Fund Wallet', path: '/dashboard/fund' },
    { icon: Banknote, label: 'Withdraw', path: '/dashboard/withdraw' },
    { icon: History, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: HelpCircle, label: 'Support', path: '/dashboard/support' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center glow-emerald">
                <TrendingUp className="w-6 h-6 text-slate-950" />
              </div>
              <span className="font-heading text-xl font-bold text-white">FlexInvest</span>
            </Link>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-4 border-t border-b border-slate-800">
            <div className="text-sm text-slate-400">Welcome back,</div>
            <div className="font-semibold text-white truncate">{user?.full_name || 'User'}</div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
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
              data-testid="logout-btn"
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

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-heading font-bold text-white">FlexInvest</span>
          </div>
          <div className="w-6" />
        </div>
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

// Dashboard Overview
export const DashboardOverview = () => {
  const { user, token, refreshProfile } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshProfile();
        const response = await axios.get(`${API_URL}/investments/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestments(response.data.investments || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, refreshProfile]);

  const totalActiveInvestment = investments.reduce((sum, inv) => sum + inv.capital, 0);
  const totalEarned = investments.reduce((sum, inv) => sum + inv.profit_earned, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-overview">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your investment overview.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">Wallet Balance</div>
              <div className="font-heading text-2xl font-bold text-emerald-400" data-testid="wallet-balance">
                {formatCurrency(user?.wallet_balance || 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <span className="badge-approved">{investments.length} Active</span>
              </div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">Active Investment</div>
              <div className="font-heading text-2xl font-bold text-white" data-testid="active-investment">
                {formatCurrency(totalActiveInvestment)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">Total Earned</div>
              <div className="font-heading text-2xl font-bold text-white" data-testid="total-earned">
                {formatCurrency(totalEarned)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">Account Status</div>
              <div className="font-heading text-2xl font-bold text-emerald-400">
                {user?.is_verified ? 'Verified' : 'Pending'}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/dashboard/fund')}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">Fund Wallet</h3>
                  <p className="text-slate-400 text-sm">Add money to your wallet</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/dashboard/investments')}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">Start Investment</h3>
                  <p className="text-slate-400 text-sm">Choose a package and earn daily</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </CardContent>
          </Card>
        </div>
        {investments.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold text-white mb-4">Active Investments</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {investments.slice(0, 4).map((inv) => (
                <Card key={inv.id} className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-heading text-lg font-semibold text-emerald-400">
                        {formatCurrency(inv.capital)}
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Daily Profit</span>
                        <span className="text-white">{formatCurrency(inv.daily_profit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Earned So Far</span>
                        <span className="text-emerald-400">{formatCurrency(inv.profit_earned)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{inv.days_completed}/{inv.duration} days</span>
                      </div>
                      <Progress value={(inv.days_completed / inv.duration) * 100} className="h-2 bg-slate-800" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Investments Page with ability to select and invest in a package
export const InvestmentsPage = () => {
  const { token, user, refreshProfile } = useAuth();
  const [packages, setPackages] = useState([]);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [allInvestments, setAllInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pkg, active, all] = await Promise.all([
          axios.get(`${API_URL}/investments/packages`),
          axios.get(`${API_URL}/investments/active`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/investments/history`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setPackages(pkg.data.packages || []);
        setActiveInvestments(active.data.investments || []);
        setAllInvestments(all.data.investments || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAll();
  }, [token]);

  const handleInvest = async () => {
    if (!selectedPackage) return;
    if ((user?.wallet_balance || 0) < selectedPackage.capital) {
      toast.error('Insufficient wallet balance. Please fund your wallet first.');
      setShowConfirmModal(false);
      return;
    }
    setInvesting(true);
    try {
      await axios.post(`${API_URL}/investments/subscribe`, { package_id: selectedPackage.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Investment started successfully!');
      setShowConfirmModal(false);
      await refreshProfile();
      // Refresh investments on page
      const [active, all] = await Promise.all([
        axios.get(`${API_URL}/investments/active`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/investments/history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setActiveInvestments(active.data.investments || []);
      setAllInvestments(all.data.investments || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start investment');
    } finally {
      setInvesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="investments-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Investments</h1>
            <p className="text-slate-400">Choose a package and start earning daily profits</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Wallet Balance</div>
            <div className="font-heading text-xl font-bold text-emerald-400">{formatCurrency(user?.wallet_balance || 0)}</div>
          </div>
        </div>
        {/* Investment Packages to select and invest */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-white mb-4">Investment Packages</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, idx) => (
              <Card 
                key={pkg.id} 
                className={`bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden group hover:border-emerald-500/30 transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="font-heading text-2xl font-bold text-emerald-400 mb-1">
                      {formatCurrency(pkg.capital)}
                    </div>
                    <span className="text-slate-500 text-sm">Capital</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Daily Profit</span>
                      <span className="text-white font-medium">{formatCurrency(pkg.daily_profit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-white font-medium">{pkg.duration} days</span>
                    </div>
                    <div className="h-px bg-slate-800"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Return</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(pkg.total_return)}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => { setSelectedPackage(pkg); setShowConfirmModal(true); }}
                    className="w-full btn-primary"
                    data-testid={`invest-pkg-${pkg.id}`}>
                      Invest Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold text-white mb-4">Active Investments</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {activeInvestments.map((inv) => (
                <Card key={inv.id} className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-heading text-lg font-semibold text-emerald-400">
                        {formatCurrency(inv.capital)}
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Daily Profit</span>
                        <span className="text-white">{formatCurrency(inv.daily_profit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Earned So Far</span>
                        <span className="text-emerald-400">{formatCurrency(inv.profit_earned)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{inv.days_completed}/{inv.duration} days</span>
                      </div>
                      <Progress value={(inv.days_completed / inv.duration) * 100} className="h-2 bg-slate-800" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* Investment History */}
        {allInvestments.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold text-white mb-4">Investment History</h2>
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Capital</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Daily Profit</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Progress</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Earned</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInvestments.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-4 px-6 text-white font-medium">{formatCurrency(inv.capital)}</td>
                        <td className="py-4 px-6 text-slate-300">{formatCurrency(inv.daily_profit)}</td>
                        <td className="py-4 px-6 text-slate-300">{inv.days_completed}/{inv.duration} days</td>
                        <td className="py-4 px-6 text-emerald-400">{formatCurrency(inv.profit_earned)}</td>
                        <td className="py-4 px-6"><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
        {/* Confirm Investment Dialog */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Confirm Investment</DialogTitle>
              <DialogDescription className="text-slate-400">
                You are about to invest in this package
              </DialogDescription>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capital</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(selectedPackage.capital)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Profit</span>
                    <span className="text-white">{formatCurrency(selectedPackage.daily_profit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white">{selectedPackage.duration} days</span>
                  </div>
                  <div className="h-px bg-slate-700"></div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Return</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(selectedPackage.total_return)}</span>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  Your wallet balance: <span className="text-white">{formatCurrency(user?.wallet_balance || 0)}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="btn-secondary">
                Cancel
              </Button>
              <Button onClick={handleInvest} className="btn-primary" disabled={investing} data-testid="confirm-invest-btn">
                {investing ? 'Processing...' : 'Confirm Investment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export { DashboardLayout };
