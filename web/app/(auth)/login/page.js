'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LanguageToggle from '@/components/ui/LanguageToggle';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.login.error'));
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
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center font-black text-[#0f172a] text-xl">M</div>
              <span className="text-white font-bold text-xl">Mala-Link</span>
            </div>
            <LanguageToggle />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            {t('auth.login.hero.line1')}<br/>
            <span className="text-[#f59e0b]">{t('auth.login.hero.highlight')}</span><br/>
            {t('auth.login.hero.line2')}
          </h1>
          <p className="text-[#64748b] text-lg leading-relaxed">
            {t('auth.login.hero.desc')}
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '🪪', labelKey: 'auth.login.feature.nationalId' },
            { icon: '🛂', labelKey: 'auth.login.feature.passport' },
            { icon: '🚗', labelKey: 'auth.login.feature.licence' },
          ].map(({ icon, labelKey }) => (
            <div key={labelKey} className="flex items-center gap-3 text-[#94a3b8] text-sm">
              <span className="text-lg">{icon}</span>
              <span>{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md fade-up">
          {/* Mobile logo */}
          <div className="flex items-center justify-between gap-2 mb-10 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center font-black text-[#f59e0b]">M</div>
              <span className="font-bold text-[#0f172a]">Mala-Link</span>
            </div>
            <LanguageToggle />
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">{t('auth.welcome')}</h2>
          <p className="text-[#64748b] text-sm mb-8">{t('auth.signin.sub')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('auth.email.placeholder')}
              icon={Mail}
              required
            />
            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('auth.password.placeholder')}
              icon={Lock}
              required
            />

            <Button type="submit" loading={loading} fullWidth size="lg" variant="primary">
              {t('auth.signin.btn')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e2e8f0] space-y-3">
            <p className="text-center text-sm text-[#64748b]">
              {t('auth.no.account')}{' '}
              <Link href="/register" className="text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors">
                {t('auth.create.one')}
              </Link>
            </p>
            <p className="text-center text-sm text-[#64748b]">
              {t('auth.staff')}{' '}
              <Link href="/staff/login" className="text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors">
                {t('auth.staff.portal')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}