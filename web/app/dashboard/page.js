'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicationsAPI, citizensAPI, idcardsAPI } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FilePlus, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DashboardPage() {
  const [citizen, setCitizen]           = useState(null);
  const [applications, setApplications] = useState([]);
  const [idCards, setIdCards]           = useState([]);

  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      citizensAPI.getMe(),
      applicationsAPI.getMy(),
      idcardsAPI.getMy(),
    ]).then(([c, a, id]) => {
      setCitizen(c.data.data);
      setApplications(a.data.data);
      setIdCards(id.data.data);
    }).catch(() => {});
  }, []);

  const stats = [
    { label: t('dash.stat.totalApps'), value: applications.length,                                                 icon: FileText,    color: 'navy'  },
    { label: t('dash.stat.active'),     value: applications.filter(a => !['COLLECTED','REJECTED'].includes(a.status)).length, icon: FilePlus, color: 'blue'  },
    { label: t('dash.stat.readyCollect'), value: applications.filter(a => a.status === 'READY').length,               icon: CheckCircle, color: 'green' },
    { label: t('dash.stat.idCardsIssued'),    value: idCards.length,                                                      icon: CreditCard,  color: 'gold'  },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title={`${t('dash.greeting')}, ${citizen?.fullName?.split(' ')[0] || '...'} 👋`}
        subtitle={citizen?.nationalIdNo ? `${t('dash.subtitle.nationalId')}: ${citizen.nationalIdNo}` : t('dash.subtitle.completeNationalId')}
        action={<Link href="/dashboard/apply"><Button variant="gold" size="md"><FilePlus size={16}/>{t('dash.newApplication')}</Button></Link>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className={`fade-up fade-up-${i + 1}`}>
            <StatCard {...s}/>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <Card className="fade-up fade-up-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[#0f172a] text-base">{t('dash.recent.title')}</h2>
          <Link href="/dashboard/track" className="text-sm text-[#f59e0b] font-semibold hover:text-[#d97706] transition-colors">
            {t('dash.viewAll')} →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#f8fafc] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-[#0a49a2]"/>
            </div>
            <p className="text-[#859299] font-medium">{t('dash.no.apps')}</p>
            <p className="text-[#7c8899] text-sm mt-1">{t('dash.no.apps.sub')}</p>
            <div className="mt-4">
              <Link href="/dashboard/apply">
                <Button variant="gold" size="sm"><FilePlus size={14}/>{t('dash.apply.now')}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {applications.slice(0, 6).map((app) => (
              <Link key={app.id} href={`/dashboard/track?id=${app.id}`}
                className="flex items-center justify-between py-3.5 hover:bg-[#f8fafc] -mx-2 px-2 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center group-hover:border-[#f59e0b] transition-colors">
                    <FileText size={16} className="text-[#64748b]"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">
                      {app.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {app.agency?.name} · {new Date(app.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <Badge label={app.status} variant={app.status}/>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}