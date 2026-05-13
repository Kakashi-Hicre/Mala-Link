'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f59e0b]/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f59e0b]/5 rounded-full translate-y-1/2 -translate-x-1/2"/>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center font-black text-[#0f172a] text-xl">M</div>
            <span className="text-white font-bold text-xl">Mala-Link</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your documents.<br/>
            <span className="text-[#f59e0b]">Your rights.</span><br/>
            Online.
          </h1>
          <p className="text-[#64748b] text-lg leading-relaxed">
            Apply for your National ID, Passport, or Driving Licence from anywhere in Malawi.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '🪪', label: 'National ID via NRB' },
            { icon: '🛂', label: 'Passport via Immigration' },
            { icon: '🚗', label: 'Driving Licence via DRTSS' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-[#94a3b8] text-sm">
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center font-black text-[#f59e0b]">M</div>
            <span className="font-bold text-[#0f172a]">Mala-Link</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Welcome back</h2>
          <p className="text-[#64748b] text-sm mb-8">Sign in to your citizen account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={Lock}
              required
            />

            <Button type="submit" loading={loading} fullWidth size="lg" variant="primary">
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e2e8f0] space-y-3">
            <p className="text-center text-sm text-[#64748b]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors">
                Create one free
              </Link>
            </p>
            <p className="text-center text-sm text-[#64748b]">
              Agency staff?{' '}
              <Link href="/staff/login" className="text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors">
                Staff portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}