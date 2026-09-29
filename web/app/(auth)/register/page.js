'use client';
import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LanguageToggle from '@/components/ui/LanguageToggle';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const [form, setForm]       = useState({ fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.register.error'));
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
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center font-black text-[#0f172a] text-xl">M</div>
              <span className="text-white font-bold text-xl">Mala-Link</span>
            </div>
            <LanguageToggle />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            {t('auth.register.hero.line1')}<br/>
            <span className="text-[#f59e0b]">{t('auth.register.hero.highlight')}</span><br/>
            {t('auth.register.hero.line2')}
          </h1>
          <p className="text-[#64748b] text-base leading-relaxed mb-10">
            {t('auth.register.hero.desc')}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '3', labelKey: 'auth.register.stat.services' },
              { value: '3', labelKey: 'auth.register.stat.agencies' },
              { value: '24/7', labelKey: 'auth.register.stat.available' },
            ].map(({ value, labelKey }) => (
              <div key={labelKey} className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-[#f59e0b] text-2xl font-black">{value}</p>
                <p className="text-[#64748b] text-xs mt-1">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md fade-up">
          <div className="flex items-center justify-between gap-2 mb-10 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center font-black text-[#f59e0b]">M</div>
              <span className="font-bold text-[#0f172a]">Mala-Link</span>
            </div>
            <LanguageToggle />
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">{t('auth.register')}</h2>
          <p className="text-[#64748b] text-sm mb-8">{t('auth.register.sub')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label={t('auth.fullname')} name="fullName" type="text"
              value={form.fullName} onChange={handleChange}
              placeholder={t('auth.fullname.placeholder')} icon={User} required/>
            <Input label={t('auth.email')} name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder={t('auth.email.placeholder')} icon={Mail} required/>
            <Input label={t('auth.phone')} name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              placeholder={t('auth.phone.placeholder')} icon={Phone}
              hint={t('auth.phone.hint')} required/>
            <Input label={t('auth.password')} name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder={t('auth.password.placeholder.min')} icon={Lock} required/>

            <Button type="submit" loading={loading} fullWidth size="lg" variant="primary">
              {t('auth.create.btn')}
            </Button>
          </form>

          <p className="text-center text-sm text-[#64748b] mt-6 pt-6 border-t border-[#e2e8f0]">
            {t('auth.have.account')}{' '}
            <Link href="/login" className="text-[#0f172a] font-semibold hover:text-[#f59e0b] transition-colors">
              {t('auth.signin.link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}