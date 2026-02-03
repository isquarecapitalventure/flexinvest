import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from './Dashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MessageSquare, Send, Phone, Mail, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

// const API_URL = `http://localhost:8000/api`;
const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

const StatusBadge = ({ status }) => {
  const styles = {
    open: 'badge-pending',
    resolved: 'badge-approved',
  };
  return <span className={styles[status] || 'badge-pending'}>{status}</span>;
};

export const SupportPage = () => {
  const { token } = useAuth();
  const [supportLinks, setSupportLinks] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, complaintsRes] = await Promise.all([
          axios.get(`${API_URL}/support/links`),
          axios.get(`${API_URL}/complaints/history`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setSupportLinks(linksRes.data.links);
        setComplaints(complaintsRes.data.complaints || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/complaints/create`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Complaint submitted successfully!');
      setForm({ subject: '', message: '' });
      
      // Refresh complaints
      const complaintsRes = await axios.get(`${API_URL}/complaints/history`, { headers: { Authorization: `Bearer ${token}` } });
      setComplaints(complaintsRes.data.complaints || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="support-page">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-slate-400">Get help through our support channels</p>
        </div>

        {/* Support Channels */}
        <div className="grid md:grid-cols-3 gap-6">
          <a 
            href={supportLinks?.whatsapp || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
            data-testid="whatsapp-link"
          >
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-green-500/50 transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">WhatsApp</h3>
                  <p className="text-slate-400 text-sm">Chat with us instantly</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 ml-auto" />
              </CardContent>
            </Card>
          </a>

          <a 
            href={supportLinks?.telegram || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
            data-testid="telegram-link"
          >
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">Telegram</h3>
                  <p className="text-slate-400 text-sm">Join our channel</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 ml-auto" />
              </CardContent>
            </Card>
          </a>

          <a 
            href={`mailto:${supportLinks?.email || 'support@flexinvest.com'}`}
            className="block"
            data-testid="email-link"
          >
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">Email</h3>
                  <p className="text-slate-400 text-sm">{supportLinks?.email || 'support@flexinvest.com'}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 ml-auto" />
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Submit Complaint */}
        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              Submit a Complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Subject</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({...form, subject: e.target.value})}
                  placeholder="Brief description of your issue"
                  className="bg-slate-950/50 border-slate-800 text-white"
                  data-testid="complaint-subject-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="bg-slate-950/50 border-slate-800 text-white resize-none"
                  data-testid="complaint-message-input"
                />
              </div>
              <Button type="submit" className="btn-primary" disabled={submitting} data-testid="submit-complaint-btn">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Complaint
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Complaint History */}
        {complaints.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold text-white mb-4">Your Complaints</h2>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="bg-slate-900/60 backdrop-blur-md border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{complaint.subject}</h3>
                        <p className="text-sm text-slate-400">
                          {new Date(complaint.created_at).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-slate-300 text-sm mb-4">{complaint.message}</p>
                    {complaint.admin_response && (
                      <div className="bg-slate-800/50 rounded-lg p-4 border-l-2 border-emerald-500">
                        <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Admin Response</div>
                        <p className="text-slate-300 text-sm">{complaint.admin_response}</p>
                      </div>
                    )}
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
