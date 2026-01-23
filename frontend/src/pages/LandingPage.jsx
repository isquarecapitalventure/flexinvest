import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  Clock,
  ChevronRight,
  ArrowRight,
  Users,
  Banknote,
  BarChart3,
  Settings,
  Star,
  X,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Zap,
  Award,
  Globe,
  Building,
  Target,
  PieChart,
  Lock,
  Heart,
  Flag, // Use Flag icon instead of NigerianFlag
  Coffee,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';

const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

const INVESTMENT_PACKAGES = [
  { 
    id: "pkg_1", 
    capital: 10000, 
    daily_profit: 800, 
    duration: 42, 
    total_return: 33600,
    bestFor: "Beginners",
    features: ["Daily Withdrawals", "Basic Support", "Market Updates"]
  },
  { 
    id: "pkg_2", 
    capital: 20000, 
    daily_profit: 1400, 
    duration: 42, 
    total_return: 58800,
    bestFor: "Starters",
    features: ["Priority Support", "Weekly Reports", "Risk Management"]
  },
  { 
    id: "pkg_3", 
    capital: 40000, 
    daily_profit: 1900, 
    duration: 42, 
    total_return: 79800,
    bestFor: "Growing Investors",
    features: ["Advanced Analytics", "Dedicated Account Manager", "Insurance Coverage"]
  },
  { 
    id: "pkg_4", 
    capital: 60000, 
    daily_profit: 2300, 
    duration: 42, 
    total_return: 96600,
    bestFor: "Serious Traders",
    features: ["VIP Signals", "Tax Optimization", "Portfolio Review"]
  },
  { 
    id: "pkg_5", 
    capital: 100000, 
    daily_profit: 4500, 
    duration: 42, 
    total_return: 189000,
    bestFor: "Premium Investors",
    features: ["Personal Advisor", "Exclusive Webinars", "Advanced Tools", "Priority Processing"]
  },
  { 
    id: "pkg_6", 
    capital: 150000, 
    daily_profit: 6000, 
    duration: 42, 
    total_return: 252000,
    bestFor: "Enterprise",
    features: ["Team Management", "API Access", "Custom Reports", "Dedicated Server"]
  },
  { 
    id: "pkg_7", 
    capital: 200000, 
    daily_profit: 8000, 
    duration: 42, 
    total_return: 336000,
    bestFor: "Institutional",
    features: ["White Label", "Full Automation", "Risk Hedging", "24/7 Monitoring"]
  },
  { 
    id: "pkg_8", 
    capital: 300000, 
    daily_profit: 11000, 
    duration: 42, 
    total_return: 462000,
    bestFor: "Ultra High Net Worth",
    features: ["Family Office Services", "Estate Planning", "Global Access", "Private Events"]
  },
];

// Social Media Platforms (Nigerian focused)
const SOCIAL_MEDIA = [
  { 
    name: 'WhatsApp', 
    icon: MessageCircle, 
    color: '#25D366',
    url: 'https://wa.me/2349012345678',
    description: 'Chat with our support team'
  },
  { 
    name: 'Telegram', 
    icon: MessageCircle, 
    color: '#0088CC',
    url: 'https://t.me/flexinvestng',
    description: 'Join our community channel'
  },
  { 
    name: 'Instagram', 
    icon: '📸',
    color: '#E4405F',
    url: 'https://instagram.com/flexinvestng',
    description: 'Follow our success stories'
  },
  { 
    name: 'Twitter', 
    icon: '𝕏',
    color: '#000000',
    url: 'https://twitter.com/flexinvestng',
    description: 'Latest market insights'
  },
  { 
    name: 'YouTube', 
    icon: '▶️',
    color: '#FF0000',
    url: 'https://youtube.com/c/flexinvestng',
    description: 'Educational videos & webinars'
  },
  { 
    name: 'Email', 
    icon: Mail, 
    color: '#EA4335',
    url: 'mailto:support@squarecapital.ng',
    description: 'Send us an email'
  },
];

// Animated Users Counter - Slower pace (1 user per 3 seconds)
const MIN_USERS = 12500;
const MAX_USERS = 25000;
const INCREMENT_STEP = 1;
const INTERVAL_MS = 3000; // 1 new user per 3 seconds

function useAnimatedUserCount() {
  const [userCount, setUserCount] = useState(MIN_USERS);
  const timeoutRef = useRef();
  
  useEffect(() => {
    if (userCount < MAX_USERS) {
      timeoutRef.current = setTimeout(() => {
        setUserCount((prev) => Math.min(prev + INCREMENT_STEP, MAX_USERS));
      }, INTERVAL_MS);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [userCount]);
  
  return userCount;
}

// Modal Components - FIXED: Always define hooks at the top level
const PackagesModal = ({ isOpen, onClose }) => {
  // FIX: Move hooks to the top, before any conditionals
  const [selectedPackage, setSelectedPackage] = useState(INVESTMENT_PACKAGES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/90 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-700/40 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
              <Building className="w-8 h-8 text-emerald-400" />
              Investment Packages
            </h2>
            <p className="text-slate-400 mt-2">Powered by Square Capital Ventures Nigeria Limited</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 p-8">
          {/* Package Selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Choose Your Plan</h3>
            {INVESTMENT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                  selectedPackage.id === pkg.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-lg">{formatCurrency(pkg.capital)}</h4>
                    <p className="text-sm text-slate-400">{pkg.bestFor}</p>
                  </div>
                  {selectedPackage.id === pkg.id && (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Package Details */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-500/20 rounded-full mb-3">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">{selectedPackage.bestFor}</span>
                  </div>
                  <h3 className="text-4xl font-bold text-white">{formatCurrency(selectedPackage.capital)}</h3>
                  <p className="text-slate-400">Initial Investment</p>
                </div>
                {selectedPackage.id === "pkg_5" && (
                  <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-bold text-sm">
                    MOST POPULAR
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-slate-400 text-sm mb-1">Daily Profit</div>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedPackage.daily_profit)}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-slate-400 text-sm mb-1">Duration</div>
                  <div className="text-2xl font-bold text-white">{selectedPackage.duration} days</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-slate-400 text-sm mb-1">Total Return</div>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedPackage.total_return)}</div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Package Features
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedPackage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="btn-primary flex-1 py-6 text-lg rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold hover:opacity-90 transition-opacity">
                  Invest Now <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
                <button className="flex-1 py-6 text-lg border-slate-700 hover:border-emerald-500 rounded-lg border bg-transparent text-white hover:bg-emerald-500/10 transition-colors">
                  Download Prospectus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactModal = ({ isOpen, onClose }) => {
  // FIX: Move hooks to the top, before any conditionals
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent successfully! We\'ll contact you within 24 hours.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/90 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-700/40 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
              <Phone className="w-8 h-8 text-blue-400" />
              Contact Us
            </h2>
            <p className="text-slate-400 mt-2">Get in touch with Square Capital Ventures</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
              
              <button type="submit" className="w-full btn-primary py-6 text-lg rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold hover:opacity-90 transition-opacity">
                <Mail className="w-5 h-5 mr-2 inline" />
                Send Message
              </button>
            </form>
          </div>

          {/* Social Media & Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Connect with us</h3>
            
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Social Media
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_MEDIA.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500 transition-all group"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: social.color }}
                    >
                      {typeof social.icon === 'string' ? (
                        <span>{social.icon}</span>
                      ) : (
                        <social.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white">{social.name}</div>
                      <div className="text-sm text-slate-400">{social.description}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto text-slate-500 group-hover:text-emerald-400" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                Office Address
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <div className="font-bold text-white">Square Capital Ventures Nigeria Ltd.</div>
                    <div className="text-slate-400">Plot 1234, Adeola Odeku Street, Victoria Island</div>
                    <div className="text-slate-400">Lagos, Nigeria</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">+234 (0) 901 234 5678</div>
                    <div className="text-slate-400">Mon-Fri, 8AM-6PM WAT</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">support@squarecapital.ng</div>
                    <div className="text-slate-400">invest@squarecapital.ng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userCount = useAnimatedUserCount();

  // Modal states
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Trust badges for Nigerian market
  const trustBadges = [
    { icon: ShieldCheck, text: 'SEC Registered', subtext: 'RC: 1234567' },
    { icon: Lock, text: 'NDIC Insured', subtext: 'Up to ₦500,000' },
    { icon: Building, text: 'Corporate Affairs', subtext: 'CAC Certified' },
    { icon: PieChart, text: 'Audited Returns', subtext: 'Annual Reports' },
  ];

  // Testimonials from Nigerian investors
  const testimonials = [
    {
      name: 'Chinedu Okoro',
      location: 'Lagos',
      investment: '₦150,000',
      profit: '₦252,000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      quote: 'As a small business owner in Lagos, FlexInvest has helped me grow my capital significantly. The daily profits are real!'
    },
    {
      name: 'Aisha Mohammed',
      location: 'Abuja',
      investment: '₦100,000',
      profit: '₦189,000',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w-100',
      quote: 'I was skeptical at first, but after 42 days, I received my full returns plus profits. Truly reliable!'
    },
    {
      name: 'Emeka Nwankwo',
      location: 'Port Harcourt',
      investment: '₦300,000',
      profit: '₦462,000',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      quote: 'Square Capital Ventures provides professional service. Their support team is always available.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c1421] font-sans relative overflow-x-hidden">
      {/* Nigerian-themed background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
        
        {/* Nigerian flag pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[length:100px_100px]" 
             style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0,0 L100,0 L100,33.33 L0,33.33 Z" fill="%23008753"/%3E%3Cpath d="M0,33.33 L100,33.33 L100,66.66 L0,66.66 Z" fill="%23FFFFFF"/%3E%3Cpath d="M0,66.66 L100,66.66 L100,100 L0,100 Z" fill="%23008753"/%3E%3C/svg%3E")'}} 
        />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-emerald-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <Flag className="w-3 h-3 text-slate-950" /> {/* FIXED: Changed NigerianFlag to Flag */}
              </div>
            </div>
            <div>
              <span className="font-heading text-2xl font-extrabold tracking-tight text-white">FlexInvest NG</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">Powered by Square Capital Ventures</span>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setShowPackagesModal(true)}
              className="text-slate-200 hover:text-emerald-400 transition-colors text-base font-medium hover:scale-105"
            >
              Packages
            </button>
            <Link to="/about" className="text-slate-200 hover:text-emerald-400 transition-colors text-base font-medium">About</Link>
            <button 
              onClick={() => setShowContactModal(true)}
              className="text-slate-200 hover:text-emerald-400 transition-colors text-base font-medium hover:scale-105"
            >
              Contact Us
            </button>
            
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn-primary px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold hover:opacity-90 transition-opacity"
              >
                Dashboard
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-medium">
                  Login
                </Link>
                <button 
                  onClick={() => navigate('/register')} 
                  className="btn-primary px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-fast">
              {/* Nigerian Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-400/10 border border-emerald-500/30 rounded-full mb-7 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 via-emerald-500 to-lime-400 animate-pulse" />
                  <span className="text-emerald-400">🇳🇬</span> {/* FIXED: Use emoji instead of icon */}
                </div>
                <span className="text-emerald-400 font-bold tracking-wide">🇳🇬 Nigerian Owned & Operated 🇳🇬</span>
              </div>

              <h1 className="font-heading text-[2.8rem] md:text-[4rem] font-black leading-tight mb-7 text-white max-w-xl">
                Multiply Your <span className="text-gradient bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Naira</span> <br />
                <span className="text-2xl font-normal text-slate-400 mt-2 block">Daily Profits • Secure • Tailored for Nigerians</span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-10 max-w-xl font-regular leading-relaxed">
                Invest in Naira, withdraw in Naira. <span className="text-emerald-400 font-semibold">Square Capital Ventures Nigeria Limited</span> brings you transparent, reliable investment opportunities with daily returns. Trusted by thousands of Nigerian investors since 2019.
              </p>
              
              <div className="flex flex-wrap gap-5 mb-10">
                <button 
                  onClick={handleGetStarted} 
                  className="btn-primary text-lg px-12 py-7 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold hover:opacity-90 transition-opacity shadow-xl hover:shadow-2xl"
                >
                  Start Investing Now <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
                <button 
                  onClick={() => setShowPackagesModal(true)}
                  className="btn-secondary text-lg px-10 py-7 rounded-lg border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/10 border bg-transparent text-white"
                >
                  View All Packages
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4">
                {trustBadges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
                    <badge.icon className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">{badge.text}</div>
                      <div className="text-xs text-slate-400">{badge.subtext}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              {/* Nigerian-themed decoration */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.6"
                  alt="Nigerian Business Success"
                  className="rounded-[40px] shadow-2xl border-4 border-emerald-700/30 relative z-10"
                />
                
                {/* Animated counter overlay */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-r from-emerald-600/30 to-blue-800/30 backdrop-blur-xl shadow-2xl z-20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Users className="w-8 h-8 text-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <div>
                      <div className="font-heading text-3xl font-bold text-white tracking-tight">
                        {userCount.toLocaleString()}+
                      </div>
                      <div className="text-sm text-emerald-200">Nigerian Investors</div>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-emerald-500/30" />
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold text-white">₦2.3B+</div>
                    <div className="text-sm text-slate-300">Paid Out</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-blue-950/30 border-y border-slate-900/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-white mb-3">Trusted Across Nigeria</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">From Lagos to Abuja, Port Harcourt to Kano - Nigerians trust Square Capital Ventures</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-2">
                {userCount.toLocaleString()}
              </div>
              <div className="text-slate-300">Active Investors</div>
              <div className="text-sm text-slate-500 mt-1">Growing daily</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">₦2.3B+</div>
              <div className="text-slate-300">Total Payouts</div>
              <div className="text-sm text-slate-500 mt-1">Verified & Audited</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">99.7%</div>
              <div className="text-slate-300">Success Rate</div>
              <div className="text-sm text-slate-500 mt-1">Since 2019</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">36</div>
              <div className="text-slate-300">States Covered</div>
              <div className="text-sm text-slate-500 mt-1">Nationwide Presence</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Nigerian Style */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-950/80 to-blue-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-4">How Naija Invests</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">Simple steps designed for <span className="text-emerald-400 font-bold">every Nigerian</span> - from students to business owners</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                step: 'Step 1', 
                icon: Wallet, 
                title: 'Fund Your Wallet', 
                desc: 'Transfer Naira via any Nigerian bank. Instant verification.',
                nigerianTip: 'Supports all Nigerian banks'
              },
              { 
                step: 'Step 2', 
                icon: TrendingUp, 
                title: 'Choose Your Plan', 
                desc: 'Pick from ₦10k to ₦300k packages. Start small, grow big.',
                nigerianTip: 'Flexible for all income levels'
              },
              { 
                step: 'Step 3', 
                icon: Banknote, 
                title: 'Earn Daily & Withdraw', 
                desc: 'Receive daily profits. Withdraw anytime to your Nigerian account.',
                nigerianTip: '24/7 withdrawals available'
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 p-8 rounded-3xl shadow-2xl h-full">
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-600/30 to-emerald-300/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <div className="relative">
                          <item.icon className="w-10 h-10 text-emerald-400" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="font-mono text-sm text-emerald-500 tracking-widest uppercase">{item.step}</span>
                        <h3 className="font-heading text-2xl font-bold text-white mt-2 mb-3">{item.title}</h3>
                        <p className="text-slate-300 text-md mb-4">{item.desc}</p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-slate-800 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <span className="text-sm text-emerald-400 font-medium">{item.nigerianTip}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages Preview */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-950/60 via-blue-950/30 to-slate-950/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 rounded-full mb-4">
              <Building className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Powered by Square Capital Ventures</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-4">Featured Investment Plans</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">Choose from our most popular packages designed for Nigerian investors</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {INVESTMENT_PACKAGES.filter(pkg => ['pkg_1', 'pkg_5', 'pkg_8'].includes(pkg.id)).map((pkg) => (
              <Card key={pkg.id} className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="font-heading text-5xl font-black text-emerald-400 mb-2">
                      {formatCurrency(pkg.capital)}
                    </div>
                    <div className="text-slate-400 font-medium uppercase tracking-wider">Capital</div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400">Daily Profit</span>
                      <span className="text-white font-bold text-lg">{formatCurrency(pkg.daily_profit)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-white font-bold">{pkg.duration} days</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400">Best For</span>
                      <span className="text-emerald-400 font-bold">{pkg.bestFor}</span>
                    </div>
                    <div className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">Total Returns</div>
                        <div className="text-3xl font-black text-emerald-400">{formatCurrency(pkg.total_return)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowPackagesModal(true)}
                    className="w-full btn-primary py-6 text-lg font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                  >
                    Invest Now <ChevronRight className="w-5 h-5 ml-2 inline" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setShowPackagesModal(true)}
              className="border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/10 px-12 py-6 text-lg rounded-lg border bg-transparent text-white"
            >
              View All 8 Packages <ChevronDown className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* Nigerian Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">What Naija Investors Say</h2>
            <p className="text-slate-400">Real stories from real Nigerians</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 bg-slate-700 flex items-center justify-center">
                      <Users className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                      <div className="text-slate-400">{testimonial.location}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-2 py-1 bg-emerald-500/10 rounded text-xs font-bold text-emerald-400">
                          Invested: {testimonial.investment}
                        </div>
                        <div className="px-2 py-1 bg-yellow-500/10 rounded text-xs font-bold text-yellow-400">
                          Earned: {testimonial.profit}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 italic mb-6">"{testimonial.quote}"</p>
                  
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-blue-950/40 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-400/10 rounded-full mb-8 border border-emerald-500/30">
            <Building className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">Square Capital Ventures Nigeria Limited</span>
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-8">
            Ready to Grow Your <span className="bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent">Naira</span>?
          </h2>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join <span className="text-emerald-400 font-bold">{userCount.toLocaleString()}+</span> Nigerians who trust Square Capital Ventures. 
            Start with as little as ₦10,000 and watch your money grow daily.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
            <button 
              onClick={handleGetStarted} 
              className="btn-primary text-lg px-14 py-7 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold hover:opacity-90 transition-opacity shadow-2xl"
            >
              Start Investing Now <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/10 text-lg px-12 py-7 rounded-lg border bg-transparent text-white"
            >
              <Phone className="w-5 h-5 mr-2 inline" />
              Contact Our Team
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>24/7 Nigerian Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Instant Withdrawals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 px-6 bg-gradient-to-b from-slate-950 to-black border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="font-heading text-2xl font-extrabold text-white">FlexInvest NG</div>
                  <div className="text-xs text-slate-500">by Square Capital Ventures</div>
                </div>
              </div>
              <p className="text-slate-400 mb-6">
                Nigeria's most trusted investment platform, bringing financial growth opportunities to every Nigerian.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2 inline" />
                  WhatsApp
                </button>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="border-slate-700 border px-3 py-2 rounded-lg text-sm text-white bg-transparent"
                >
                  <Mail className="w-4 h-4 mr-2 inline" />
                  Email
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><button onClick={() => setShowPackagesModal(true)} className="text-slate-400 hover:text-emerald-400 transition-colors">Investment Plans</button></li>
                <li><Link to="/faq" className="text-slate-400 hover:text-emerald-400 transition-colors">FAQ</Link></li>
                <li><Link to="/blog" className="text-slate-400 hover:text-emerald-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/disclaimer" className="text-slate-400 hover:text-emerald-400 transition-colors">Risk Disclaimer</Link></li>
                <li><Link to="/complaints" className="text-slate-400 hover:text-emerald-400 transition-colors">Complaints</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <div className="text-white font-medium">Square Capital Ventures</div>
                    <div className="text-slate-400 text-sm">Victoria Island, Lagos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div className="text-slate-400">+234 (0) 901 234 5678</div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <div className="text-slate-400">support@squarecapital.ng</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Square Capital Ventures Nigeria Limited. RC: 1234567.<br />
              All investments carry risk. Please read our risk disclaimer before investing.
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-slate-500">Follow us:</div>
              <div className="flex gap-2">
                {SOCIAL_MEDIA.slice(0, 4).map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                    style={{ color: social.color }}
                  >
                    {typeof social.icon === 'string' ? (
                      <span className="text-lg">{social.icon}</span>
                    ) : (
                      <social.icon className="w-5 h-5" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-slate-600 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with Nigerian Pride</span>
              <span>🇳🇬</span> {/* FIXED: Use emoji instead of icon */}
              <Coffee className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PackagesModal 
        isOpen={showPackagesModal} 
        onClose={() => setShowPackagesModal(false)} 
      />
      
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </div>
  );
};