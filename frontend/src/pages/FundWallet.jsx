import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from './Dashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Upload, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `http://localhost:8000/api`;

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };
  return <span className={styles[status] || 'badge-pending'}>{status}</span>;
};

const STATIC_BANK = {
  bank_name: "GT BANK",
  account_number: "1100298838",
  account_name: "Square Capital Ventures Nigeria Limited"
};

const WHATSAPP_NUMBER = "08038624730";
const WHATSAPP_LINK = `https://wa.me/234${WHATSAPP_NUMBER.replace(/^0/, '')}?text=Hello%20I%20want%20to%20send%20deposit%20evidence%20for%20my%20Square%20Capital%20account`;

export const FundWalletPage = () => {
  const { token, refreshProfile } = useAuth();
  // Override companyBank with the static bank info
  const [companyBank] = useState(STATIC_BANK);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        // Fetch only deposits, bank info is static
        const depositsRes = await axios.get(`${API_URL}/deposits/history`, { headers: { Authorization: `Bearer ${token}` } });
        setDeposits(depositsRes.data.deposits || []);
      } catch (error) {
        setDeposits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, [token]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !proofFile) {
      toast.error('Please enter amount and upload proof of payment');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('proof', proofFile);

      await axios.post(`${API_URL}/deposits/create`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Deposit request submitted successfully!');
      setShowUploadModal(false);
      setAmount('');
      setProofFile(null);
      setProofPreview(null);
      
      // Refresh deposits
      const depositsRes = await axios.get(`${API_URL}/deposits/history`, { headers: { Authorization: `Bearer ${token}` } });
      setDeposits(depositsRes.data.deposits || []);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to submit deposit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="fund-wallet-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Fund Wallet</h1>
          <p className="text-slate-400">
            Transfer to our bank account and upload your proof of payment below. You can also send your deposit evidence directly via WhatsApp after transfer.
          </p>
        </div>

        {/* Company Bank Details */}
        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              Company Bank Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Bank Name</div>
                  <div className="text-white font-medium">{companyBank.bank_name}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Account Number</div>
                  <div className="text-white font-medium font-mono">{companyBank.account_number}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(companyBank.account_number)}
                  className="text-emerald-400 hover:text-emerald-300"
                  data-testid="copy-account-btn"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Account Name</div>
                  <div className="text-white font-medium">{companyBank.account_name}</div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-200">
                  After making the transfer, upload your payment proof below or send your deposit evidence directly to us on WhatsApp for faster confirmation.
                </p>
                <Button
                  asChild
                  className="mt-3 bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                  data-testid="whatsapp-btn"
                >
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      width={20} height={20}
                      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}
                    >
                      <circle fill="#25D366" cx="16" cy="16" r="16"/>
                      <path fill="#FFF" d="M24.3 22.2c-.4-.2-2.1-1-2.4-1.2-.3-.1-.6-.2-.8.2s-.9 1.2-1.1 1.4c-.2.2-.4.2-.8.1-.4-.2-1.5-.6-2.8-1.7-1-0.9-1.7-2-1.9-2.3-.2-.4-.1-.6.1-.9.2-.3.4-.5.5-.7s.1-.4 0-.7c0-.2-.8-2-.9-2.2-.2-.5-.4-.4-.7-.4H10c-.3 0-.5.1-.7.3-.2.2-.7.7-.7 1.7s.7 2 1.1 2.2c.1.1.2.3.2.3.2.3.5.6.8.8.6.4 1.7 1.2 3.1 1.6.3.1.6.2.9.1.3-.1.9-.5 1.3-1s1-1.3 1.2-1.7c.2-.3.2-.5.1-.6-.1-.1-.3-.4-1.1-.7z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
            <Button onClick={() => setShowUploadModal(true)} className="w-full btn-primary" data-testid="upload-proof-btn">
              <Upload className="w-4 h-4 mr-2" /> Upload Proof of Payment
            </Button>
          </CardContent>
        </Card>

        {/* Deposit History */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-white mb-4">Funding History</h2>
          {(deposits.length === 0 || !deposits) ? (
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
              <CardContent className="p-8 text-center">
                <div className="text-slate-400">No deposits yet</div>
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
                        <td className="py-4 px-6 text-slate-300">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6"><StatusBadge status={deposit.status} /></td>
                        <td className="py-4 px-6 text-slate-400 text-sm">{deposit.admin_note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Upload Modal */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Upload Payment Proof</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the amount transferred and upload your payment receipt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Amount Transferred (₦)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-slate-950/50 border-slate-800 text-white"
                  data-testid="deposit-amount-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Payment Proof</Label>
                <div 
                  className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="proof-upload-zone"
                >
                  {proofPreview ? (
                    <img src={proofPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="proof-file-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadModal(false)} className="btn-secondary">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="btn-primary" disabled={submitting} data-testid="submit-deposit-btn">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
