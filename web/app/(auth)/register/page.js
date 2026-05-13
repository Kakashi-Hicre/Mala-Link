'use client';
import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm]       = useState({ fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f59e0b]/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f59e0b]/5 rounded-full translate-y-1/2 -translate-x-1/2"/>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center font-black text-[#0f172a] text-xl">M</div>
            <span className="text-white font-bold text-xl">Mala-Link</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join thousands of<br/>
            <span className="text-[#f59e0b]">Malawians</span><br/>
            already registered.
          </h1>
          <p className="text-[#64748b] text-base leading-relaxed mb-10">
            One account. Access all government services online, track your applications, and get notified instantly.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '3', label: 'Services' },
              { value: '3', label: 'Agencies' },
              { value: '24/7', label: 'Available' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-[#f59e0b] text-2xl font-black">{value}</p>
                <p className="text-[#64748b] text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md fade-up">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center font-black text-[#f59e0b]">M</div>
            <span className="font-bold text-[#0f172a]">Mala-Link</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Create your account</h2>
          <p className="text-[#64748b] text-sm mb-8">Free citizen account — takes 30 seconds</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full name" name="fullName" type="text"
              value={form.fullName} onChange={handleChange}
              placeholder="e.g. John Banda" icon={User} required/>
            <Input label="Email address" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" icon={Mail} required/>
            <Input label="Phone number" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              placeholder="+265 999 000 111" icon={Phone}
              hint="Used for SMS notifications" required/>
            <Input label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters" icon={Lock} required/>

            <Button type="submit" loading={loading} fullWidth size="lg" variant="primary">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-[#64748b] mt-6 pt-6 border-t border-[#e2e8f0]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}