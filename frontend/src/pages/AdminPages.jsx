import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './Admin';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
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

// Admin Withdrawals Page
export const AdminWithdrawalsPage = () => {
  const { adminToken } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ open: false, withdrawal: null, action: null });
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [adminToken]);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionModal.action === 'rejected' && !reason) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/admin/withdrawals/${actionModal.withdrawal.id}`, {
        status: actionModal.action,
        reason: reason || null
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success(`Withdrawal ${actionModal.action}!`);
      setActionModal({ open: false, withdrawal: null, action: null });
      setReason('');
      fetchWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-withdrawals-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Withdrawals</h1>
          <p className="text-slate-400">Review and process withdrawal requests</p>
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Amount</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Bank Details</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Date</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">{withdrawal.user_name}</div>
                        <div className="text-slate-400 text-sm">{withdrawal.user_email}</div>
                      </td>
                      <td className="py-4 px-6 text-red-400 font-medium">{formatCurrency(withdrawal.amount)}</td>
                      <td className="py-4 px-6">
                        <div className="text-white text-sm">{withdrawal.bank_name}</div>
                        <div className="text-slate-400 text-sm font-mono">{withdrawal.account_number}</div>
                        <div className="text-slate-400 text-sm">{withdrawal.account_name}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6"><StatusBadge status={withdrawal.status} /></td>
                      <td className="py-4 px-6">
                        {withdrawal.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActionModal({ open: true, withdrawal, action: 'approved' })}
                              className="text-emerald-400 hover:text-emerald-300"
                              data-testid={`approve-withdrawal-${withdrawal.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActionModal({ open: true, withdrawal, action: 'rejected' })}
                              className="text-red-400 hover:text-red-300"
                              data-testid={`reject-withdrawal-${withdrawal.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Action Modal */}
        <Dialog open={actionModal.open} onOpenChange={(open) => setActionModal({ ...actionModal, open })}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {actionModal.action === 'approved' ? 'Approve' : 'Reject'} Withdrawal
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {formatCurrency(actionModal.withdrawal?.amount || 0)} to {actionModal.withdrawal?.user_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {actionModal.withdrawal && (
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <div className="text-white font-medium">{actionModal.withdrawal.bank_name}</div>
                  <div className="text-slate-300 font-mono">{actionModal.withdrawal.account_number}</div>
                  <div className="text-slate-400">{actionModal.withdrawal.account_name}</div>
                </div>
              )}
              {actionModal.action === 'rejected' && (
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
              {actionModal.action === 'approved' && (
                <p className="text-slate-300">This will deduct {formatCurrency(actionModal.withdrawal?.amount || 0)} from the user's wallet.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionModal({ open: false, withdrawal: null, action: null })} className="btn-secondary">
                Cancel
              </Button>
              <Button 
                onClick={handleAction} 
                className={actionModal.action === 'approved' ? 'btn-primary' : 'bg-red-500 hover:bg-red-600 text-white'} 
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {actionModal.action === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

// Admin Investments Page
export const AdminInvestmentsPage = () => {
  const { adminToken } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        // Get all users first, then their investments
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        // For now, we'll show users with their wallet balances
        // In a real app, you'd have an admin endpoint to list all investments
        setInvestments(usersRes.data.users || []);
      } catch (error) {
        console.error('Failed to fetch investments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [adminToken]);

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-investments-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Investments</h1>
          <p className="text-slate-400">View all platform investments</p>
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
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">User</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Email</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Wallet Balance</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-4 px-6 text-white font-medium">{user.full_name}</td>
                      <td className="py-4 px-6 text-slate-300">{user.email}</td>
                      <td className="py-4 px-6 text-emerald-400 font-medium">{formatCurrency(user.wallet_balance)}</td>
                      <td className="py-4 px-6">
                        {user.is_verified ? (
                          <span className="badge-approved">Verified</span>
                        ) : (
                          <span className="badge-pending">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

// Admin Complaints Page
export const AdminComplaintsPage = () => {
  const { adminToken } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseModal, setResponseModal] = useState({ open: false, complaint: null });
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [adminToken]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/complaints`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setComplaints(res.data.complaints || []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/admin/complaints/${responseModal.complaint.id}?status=resolved&response=${encodeURIComponent(response)}`, null, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Response sent successfully!');
      setResponseModal({ open: false, complaint: null });
      setResponse('');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-complaints-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Complaints</h1>
          <p className="text-slate-400">View and respond to user complaints</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : complaints.length === 0 ? (
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <div className="text-slate-400">No complaints yet</div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{complaint.subject}</h3>
                      <p className="text-sm text-slate-400">
                        {complaint.user_name} ({complaint.user_email}) • {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <p className="text-slate-300 text-sm mb-4">{complaint.message}</p>
                  {complaint.admin_response && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border-l-2 border-emerald-500 mb-4">
                      <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Admin Response</div>
                      <p className="text-slate-300 text-sm">{complaint.admin_response}</p>
                    </div>
                  )}
                  {complaint.status === 'open' && (
                    <Button
                      onClick={() => setResponseModal({ open: true, complaint })}
                      className="btn-primary"
                      data-testid={`respond-complaint-${complaint.id}`}
                    >
                      Respond
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Response Modal */}
        <Dialog open={responseModal.open} onOpenChange={(open) => setResponseModal({ ...responseModal, open })}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Respond to Complaint</DialogTitle>
              <DialogDescription className="text-slate-400">
                {responseModal.complaint?.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 text-sm">{responseModal.complaint?.message}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Your Response</Label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response"
                  rows={4}
                  className="bg-slate-950/50 border-slate-800 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResponseModal({ open: false, complaint: null })} className="btn-secondary">
                Cancel
              </Button>
              <Button onClick={handleRespond} className="btn-primary" disabled={submitting || !response}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
