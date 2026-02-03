import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "./Dashboard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Banknote,
  Building,
  CreditCard,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "badge-pending",
    approved: "badge-approved",
    rejected: "badge-rejected",
  };
  return <span className={styles[status] || "badge-pending"}>{status}</span>;
};

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "OPay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export const WithdrawPage = () => {
  const { token, user, refreshProfile } = useAuth();
  const [bankAccount, setBankAccount] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankRes, withdrawalsRes] = await Promise.all([
          axios.get(`${API_URL}/user/bank-account`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/withdrawals/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setBankAccount(bankRes.data);
        setWithdrawals(withdrawalsRes.data.withdrawals || []);
        if (bankRes.data) {
          setBankForm({
            bank_name: bankRes.data.bank_name,
            account_number: bankRes.data.account_number,
            account_name: bankRes.data.account_name,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSaveBank = async () => {
    if (
      !bankForm.bank_name ||
      !bankForm.account_number ||
      !bankForm.account_name
    ) {
      toast.error("Please fill all bank details");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/user/bank-account`, bankForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Bank account saved successfully!");
      setShowBankModal(false);
      setBankAccount(bankForm);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to save bank account",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (user?.wallet_balance || 0)) {
      toast.error("Insufficient wallet balance");
      return;
    }

    if (!bankAccount) {
      toast.error("Please add a bank account first");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/withdrawals/create`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Withdrawal request submitted successfully!");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      await refreshProfile();

      // Refresh withdrawals
      const withdrawalsRes = await axios.get(`${API_URL}/withdrawals/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawals(withdrawalsRes.data.withdrawals || []);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to submit withdrawal request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="withdraw-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
              Withdraw
            </h1>
            <p className="text-slate-400">
              Withdraw your earnings to your bank account
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Available Balance</div>
            <div
              className="font-heading text-xl font-bold text-emerald-400"
              data-testid="available-balance"
            >
              {formatCurrency(user?.wallet_balance || 0)}
            </div>
          </div>
        </div>

        {/* Bank Account Card */}
        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-blue-400" />
                </div>
                Bank Account
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBankModal(true)}
                className="btn-secondary text-sm"
                data-testid="edit-bank-btn"
              >
                {bankAccount ? "Edit" : "Add Bank"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bankAccount ? (
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Bank Name</div>
                    <div className="text-white font-medium">
                      {bankAccount.bank_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Account Number</div>
                    <div className="text-white font-medium font-mono">
                      {bankAccount.account_number}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Account Name</div>
                    <div className="text-white font-medium">
                      {bankAccount.account_name}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No bank account added yet</p>
                <Button
                  onClick={() => setShowBankModal(true)}
                  className="btn-primary"
                  data-testid="add-bank-btn"
                >
                  Add Bank Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdraw Button */}
        <Button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full btn-primary py-6 text-lg"
          disabled={!bankAccount || (user?.wallet_balance || 0) <= 0}
          data-testid="request-withdrawal-btn"
        >
          <Banknote className="w-5 h-5 mr-2" /> Request Withdrawal
        </Button>

        {/* Withdrawal History */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-white mb-4">
            Withdrawal History
          </h2>
          {withdrawals.length === 0 ? (
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
              <CardContent className="p-8 text-center">
                <div className="text-slate-400">No withdrawal requests yet</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                        Bank
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr
                        key={withdrawal.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30"
                      >
                        <td className="py-4 px-6 text-emerald-400 font-medium">
                          {formatCurrency(withdrawal.amount)}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {withdrawal.bank_name}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={withdrawal.status} />
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-sm">
                          {withdrawal.admin_note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Bank Account Modal */}
        <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {bankAccount ? "Edit" : "Add"} Bank Account
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter your bank details for withdrawals
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Bank Name</Label>
                <Select
                  value={bankForm.bank_name}
                  onValueChange={(value) =>
                    setBankForm({ ...bankForm, bank_name: value })
                  }
                >
                  <SelectTrigger
                    className="bg-slate-950/50 border-slate-800 text-white"
                    data-testid="bank-name-select"
                  >
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {NIGERIAN_BANKS.map((bank) => (
                      <SelectItem
                        key={bank}
                        value={bank}
                        className="text-white hover:bg-slate-800"
                      >
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Account Number</Label>
                <Input
                  value={bankForm.account_number}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, account_number: e.target.value })
                  }
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                  className="bg-slate-950/50 border-slate-800 text-white"
                  data-testid="account-number-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Account Name</Label>
                <Input
                  value={bankForm.account_name}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, account_name: e.target.value })
                  }
                  placeholder="Enter account holder name"
                  className="bg-slate-950/50 border-slate-800 text-white"
                  data-testid="account-name-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBankModal(false)}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBank}
                className="btn-primary"
                disabled={submitting}
                data-testid="save-bank-btn"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Bank Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw Modal */}
        <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Request Withdrawal
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the amount you want to withdraw
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">
                  Available Balance
                </div>
                <div className="font-heading text-2xl font-bold text-emerald-400">
                  {formatCurrency(user?.wallet_balance || 0)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Withdrawal Amount (₦)</Label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-slate-950/50 border-slate-800 text-white"
                  data-testid="withdraw-amount-input"
                />
              </div>
              {bankAccount && (
                <div className="bg-slate-800/30 rounded-lg p-4 text-sm">
                  <div className="text-slate-400 mb-2">Withdrawal to:</div>
                  <div className="text-white">{bankAccount.bank_name}</div>
                  <div className="text-slate-300 font-mono">
                    {bankAccount.account_number}
                  </div>
                  <div className="text-slate-300">
                    {bankAccount.account_name}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  Withdrawals are processed within 24-48 hours after admin
                  approval.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                className="btn-primary"
                disabled={submitting}
                data-testid="confirm-withdraw-btn"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
