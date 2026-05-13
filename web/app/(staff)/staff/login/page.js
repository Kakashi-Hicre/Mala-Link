'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function StaffLoginPage() {
  const { staffLogin }        = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffLogin(form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
      <div className="w-full max-w-md fade-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-[#0f172a]"/>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Staff Portal</h1>
          <p className="text-[#64748b] text-sm">Mala-Link Agency Staff Login</p>
        </div>

        {/* Form card */}
        <div className="bg-[#000000] backdrop-blur border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email address" name="email" type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="staff@agency.mw"
              icon={Mail} required/>
              
            <Input label="Password" name="password" type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              icon={Lock} required/>

            <Button type="submit" loading={loading} fullWidth size="lg" variant="gold">
              Sign in to Staff Portal
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#64748b] mt-6">
          Citizen account?{' '}
          <Link href="/login" className="text-[#f59e0b] font-semibold hover:text-[#fcd34d] transition-colors">
            Login here →
          </Link>
        </p>
      </div>
    </div>
  );
}