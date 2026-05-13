'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { citizensAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Phone, Lock, CreditCard, FileText, Bell } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [citizen, setCitizen] = useState(null);
  const [form, setForm]       = useState({ fullName: '', phone: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    citizensAPI.getMe().then(res => {
      const c = res.data.data;
      setCitizen(c);
      setForm(f => ({ ...f, fullName: c.fullName, phone: c.phone }));
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await citizensAPI.updateMe(form);
      setCitizen(res.data.data);
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')}/>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — account summary */}
        <div className="space-y-4">
          {/* Avatar card */}
          <Card className="text-center">
            <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center text-[#f59e0b] font-black text-3xl mx-auto mb-4">
              {citizen?.fullName?.charAt(0) || '?'}
            </div>
            <p className="font-bold text-[#0f172a] text-base">{citizen?.fullName}</p>
            <p className="text-[#64748b] text-sm mt-0.5">{citizen?.email}</p>
            <div className="mt-3">
              <Badge label={citizen?.role} variant={citizen?.role}/>
            </div>
          </Card>

          {/* Stats card */}
          <Card>
            <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4">
              {t('profile.account')}
            </p>
            <div className="space-y-3">
              {[
                { icon: FileText,   labelKey: 'common.applications', value: citizen?._count?.applications ?? '—' },
                { icon: Bell,       labelKey: 'notif.title',         value: citizen?._count?.notifications ?? '—' },
                { icon: CreditCard, labelKey: 'profile.national.id', value: citizen?.nationalIdNo || t('profile.not.issued') },
              ].map(({ icon: Icon, labelKey, value }) => (
                <div key={labelKey} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
                    <Icon size={14} className="text-[#64748b]"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#94a3b8]">{t(labelKey)}</p>
                    <p className="text-sm font-semibold text-[#0f172a] truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right — edit form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="font-bold text-[#0f172a] mb-6 text-base">{t('profile.update')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label={t('profile.fullname')} name="fullName" icon={User}
                  value={form.fullName} onChange={handleChange}/>
                <Input label={t('profile.phone')} name="phone" type="tel" icon={Phone}
                  value={form.phone} onChange={handleChange}/>
              </div>

              <div className="pt-4 border-t border-[#f1f5f9]">
                <p className="text-sm font-bold text-[#0f172a] mb-4">
                  {t('profile.curr.pass').replace('Current ', '').replace('Mawu Achinsinsi Akale', 'Sinthani Mawu Achinsinsi')}
                </p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input label={t('profile.curr.pass')} name="currentPassword" type="password"
                    icon={Lock} value={form.currentPassword} onChange={handleChange}
                    placeholder="Enter current password"/>
                  <Input label={t('profile.new.pass')} name="newPassword" type="password"
                    icon={Lock} value={form.newPassword} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    hint="Leave blank to keep current password"/>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" loading={loading}>
                  {loading ? t('profile.saving') : t('profile.save')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}