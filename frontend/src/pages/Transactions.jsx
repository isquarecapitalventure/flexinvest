import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from './Dashboard';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Clock } from 'lucide-react';

// const API_URL = `http://localhost:8000/api`;
const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    active: 'badge-approved',
    completed: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
  };
  return <span className={styles[status] || 'badge-pending'}>{status}</span>;
};

export const TransactionsPage = () => {
  const { token } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depositsRes, withdrawalsRes, investmentsRes] = await Promise.all([
          axios.get(`${API_URL}/deposits/history`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/withdrawals/history`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/investments/history`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDeposits(depositsRes.data.deposits || []);
        setWithdrawals(withdrawalsRes.data.withdrawals || []);
        setInvestments(investmentsRes.data.investments || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Combine all transactions
  const allTransactions = [
    ...deposits.map(d => ({ ...d, type: 'deposit', icon: ArrowDownLeft, color: 'emerald' })),
    ...withdrawals.map(w => ({ ...w, type: 'withdrawal', icon: ArrowUpRight, color: 'red' })),
    ...investments.map(i => ({ ...i, type: 'investment', icon: TrendingUp, color: 'blue', amount: i.capital }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="transactions-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Transactions</h1>
          <p className="text-slate-400">View all your transaction history</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-slate-900/60 border border-slate-800 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">All</TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">Withdrawals</TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">Investments</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {allTransactions.length === 0 ? (
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <div className="text-slate-400">No transactions yet</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {allTransactions.map((tx, index) => (
                  <Card key={`${tx.type}-${tx.id}`} className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.color === 'emerald' ? 'bg-emerald-500/10' : 
                            tx.color === 'red' ? 'bg-red-500/10' : 'bg-blue-500/10'
                          }`}>
                            <tx.icon className={`w-5 h-5 ${
                              tx.color === 'emerald' ? 'text-emerald-400' : 
                              tx.color === 'red' ? 'text-red-400' : 'text-blue-400'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-white capitalize">{tx.type}</div>
                            <div className="text-sm text-slate-400">
                              {new Date(tx.created_at).toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-heading font-bold ${
                            tx.type === 'deposit' ? 'text-emerald-400' : 
                            tx.type === 'withdrawal' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                          </div>
                          <StatusBadge status={tx.status} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deposits" className="mt-6">
            {deposits.length === 0 ? (
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">No deposit history</div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900">
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Amount</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Date</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map((deposit) => (
                        <tr key={deposit.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4 px-6 text-emerald-400 font-medium">{formatCurrency(deposit.amount)}</td>
                          <td className="py-4 px-6 text-slate-300">{new Date(deposit.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-6"><StatusBadge status={deposit.status} /></td>
                          <td className="py-4 px-6 text-slate-400 text-sm">{deposit.admin_note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            {withdrawals.length === 0 ? (
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">No withdrawal history</div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900">
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Amount</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Bank</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Date</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4 px-6 text-red-400 font-medium">{formatCurrency(withdrawal.amount)}</td>
                          <td className="py-4 px-6 text-slate-300">{withdrawal.bank_name}</td>
                          <td className="py-4 px-6 text-slate-300">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-6"><StatusBadge status={withdrawal.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="investments" className="mt-6">
            {investments.length === 0 ? (
              <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">No investment history</div>
                </CardContent>
              </Card>
            ) : (
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
                      {investments.map((inv) => (
                        <tr key={inv.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4 px-6 text-blue-400 font-medium">{formatCurrency(inv.capital)}</td>
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
