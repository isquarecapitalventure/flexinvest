import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { TrendingUp, Eye, EyeOff, Loader2, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

function BrandingInfo() {
  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <Link to="/" className="inline-flex items-center gap-3 mb-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-slate-950" />
        </div>
        <span className="font-heading text-3xl font-bold text-white tracking-tight drop-shadow-md">FlexInvest</span>
      </Link>
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-emerald-400 tracking-tight mb-1">
          Empower Your Wealth With FlexInvest
        </h2>
        <p className="text-slate-300 text-base font-medium">
          FlexInvest is your gateway to smarter investments. Grow your portfolio with confidence, easily track your assets, and join a vibrant community of financial enthusiasts. <span className="text-emerald-300">Secure, intuitive, and crafted for you.</span>
        </p>
      </div>
    </div>
  );
}

// Update BASE_API_URL to target backend on localhost:8000
const BASE_API_URL = 'http://localhost:8000';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'new_password'
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to your dashboard!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Update endpoint URLs to hit localhost:8000
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    setForgotPasswordLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      
      if (response.ok) {
        toast.success('Reset instructions sent to your email');
        setForgotPasswordStep('otp');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send reset instructions');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (resetOtp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    
    setForgotPasswordLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotPasswordEmail, 
          otp: resetOtp 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResetToken(data.reset_token);
        toast.success('OTP verified successfully');
        setForgotPasswordStep('new_password');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setForgotPasswordLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotPasswordEmail,
          otp: resetOtp,
          new_password: newPassword
        }),
      });
      
      if (response.ok) {
        toast.success('Password reset successfully! You can now login');
        setShowForgotPassword(false);
        resetForgotPasswordState();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setForgotPasswordEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordStep('email');
    setResetToken('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#14243d] to-[#13262d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <BrandingInfo />
        <Card className="bg-slate-900/75 backdrop-blur-xl border-slate-800 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-3xl text-white tracking-tight">
              Welcome Back, Investor!
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-base mt-1">
              Log in to unlock your <span className="text-emerald-400 font-semibold">all-in-one</span> investment dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 focus:border-emerald-400"
                  required
                  data-testid="login-email-input"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 pr-10 focus:border-emerald-400"
                    required
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-lg mt-2 shadow"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
            <div className="mt-7 text-center text-base text-slate-400 font-medium">
              New to FlexInvest?{' '}
              <Link to="/register" className="text-emerald-400 font-bold hover:underline hover:text-emerald-300 transition">
                Create your free account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => {
        if (!open) resetForgotPasswordState();
        setShowForgotPassword(open);
      }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-lg px-6 pt-8 pb-7 shadow-xl max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-slate-950" />
              </div>
            </div>
            <DialogTitle className="font-heading text-2xl text-emerald-400 text-center mb-2">
              {forgotPasswordStep === 'email' && 'Reset Your Password'}
              {forgotPasswordStep === 'otp' && 'Verify Your Identity'}
              {forgotPasswordStep === 'new_password' && 'Set New Password'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-center">
              {forgotPasswordStep === 'email' && 'Enter your email address to receive reset instructions'}
              {forgotPasswordStep === 'otp' && `Enter the 6-digit OTP sent to ${forgotPasswordEmail}`}
              {forgotPasswordStep === 'new_password' && 'Create a strong new password for your account'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-3">
            {forgotPasswordStep === 'email' && (
              <div className="space-y-3">
                <Label htmlFor="forgot-email" className="text-slate-300">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 focus:border-emerald-400"
                />
                <Button
                  onClick={handleForgotPassword}
                  className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                  disabled={forgotPasswordLoading || !forgotPasswordEmail}
                >
                  {forgotPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Instructions
                </Button>
              </div>
            )}

            {forgotPasswordStep === 'otp' && (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <Label className="text-slate-300">Enter OTP</Label>
                  <InputOTP
                    maxLength={6}
                    value={resetOtp}
                    onChange={setResetOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="bg-slate-950 border-emerald-600/60 text-white" />
                      <InputOTPSlot index={1} className="bg-slate-950 border-emerald-600/60 text-white" />
                      <InputOTPSlot index={2} className="bg-slate-950 border-emerald-600/60 text-white" />
                      <InputOTPSlot index={3} className="bg-slate-950 border-emerald-600/60 text-white" />
                      <InputOTPSlot index={4} className="bg-slate-950 border-emerald-600/60 text-white" />
                      <InputOTPSlot index={5} className="bg-slate-950 border-emerald-600/60 text-white" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyResetOtp}
                  className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                  disabled={forgotPasswordLoading || resetOtp.length !== 6}
                >
                  {forgotPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify OTP
                </Button>
                <button
                  onClick={() => setForgotPasswordStep('email')}
                  className="text-sm text-slate-400 hover:text-emerald-400 w-full text-center"
                >
                  Use a different email
                </button>
              </div>
            )}

            {forgotPasswordStep === 'new_password' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="new-password" className="text-slate-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="confirm-password" className="text-slate-300">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600"
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleResetPassword}
                    className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                    disabled={forgotPasswordLoading || !newPassword || !confirmPassword}
                  >
                    {forgotPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Reset Password
                  </Button>
                  <button
                    onClick={() => setForgotPasswordStep('otp')}
                    className="text-sm text-slate-400 hover:text-emerald-400 w-full text-center"
                  >
                    Go back to OTP verification
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-center text-slate-500 pt-4 border-t border-slate-800">
            <span className="font-medium text-emerald-300">Remember your password?</span>{' '}
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Back to login
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, verifyOTP, resendOTP } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please verify your email.');
      setShowOTPModal(true);
      setResendTimer(300); // 5 minutes
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await verifyOTP(formData.email, otp);
      toast.success('Email verified successfully! Welcome to FlexInvest.');
      setShowOTPModal(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(formData.email);
      toast.success('New OTP sent to your email');
      setResendTimer(300);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to resend OTP');
    }
  };

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#14243d] to-[#13262d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <BrandingInfo />
        <Card className="bg-slate-900/75 backdrop-blur-xl border-slate-800 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-3xl text-white tracking-tight">
              Get Started With FlexInvest
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-base mt-1">
              Secure your future. <span className="text-emerald-400 font-semibold">Sign up</span> and join thousands investing smarter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 focus:border-emerald-400"
                  required
                  data-testid="register-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 focus:border-emerald-400"
                  required
                  data-testid="register-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 focus:border-emerald-400"
                  required
                  data-testid="register-phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="bg-slate-950/60 border-emerald-600/40 text-white placeholder:text-slate-600 pr-10 focus:border-emerald-400"
                    required
                    minLength={6}
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-lg mt-2 shadow"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
            <div className="mt-7 text-center text-base text-slate-400 font-medium">
              Already a FlexInvest member?{' '}
              <Link to="/login" className="text-emerald-400 font-bold hover:underline hover:text-emerald-300 transition">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification Modal */}
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-lg px-6 pt-8 pb-7 shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl text-emerald-400 mb-2">
                Verify Your Email Address
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">
                We've sent a <span className="text-emerald-300 font-semibold">6-digit code</span> to <span className="text-white">{formData.email}</span><br />
                Enter it below to activate your account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-7 py-3">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                data-testid="otp-input"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-slate-950 border-emerald-600/60 text-white" />
                  <InputOTPSlot index={1} className="bg-slate-950 border-emerald-600/60 text-white" />
                  <InputOTPSlot index={2} className="bg-slate-950 border-emerald-600/60 text-white" />
                  <InputOTPSlot index={3} className="bg-slate-950 border-emerald-600/60 text-white" />
                  <InputOTPSlot index={4} className="bg-slate-950 border-emerald-600/60 text-white" />
                  <InputOTPSlot index={5} className="bg-slate-950 border-emerald-600/60 text-white" />
                </InputOTPGroup>
              </InputOTP>
              <Button
                onClick={handleVerifyOTP}
                className="w-full btn-primary bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                disabled={loading || otp.length !== 6}
                data-testid="verify-otp-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verify Email
              </Button>
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className="text-sm text-slate-400 hover:text-emerald-400 disabled:opacity-50 underline-offset-2"
                data-testid="resend-otp-btn"
              >
                {resendTimer > 0
                  ? `Resend OTP in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
                  : 'Resend OTP'}
              </button>
            </div>
            <div className="text-xs text-center text-slate-500 pt-2">
              <span className="font-medium text-emerald-300">Need help?</span> Contact our support anytime.
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};