'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { applicationsAPI } from '@/lib/api';
import { FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const STEPS = ['PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED'];

// Keys map to translations/index.js entries
const STEP_LABEL_KEYS = {
  PENDING:    { label: 'step.submitted',   desc: 'step.received' },
  PROCESSING: { label: 'step.processing',  desc: 'step.reviewed' },
  PRINTING:   { label: 'step.printing',    desc: 'step.doc.printing' },
  READY:      { label: 'step.ready',       desc: 'step.collect.office' },
  COLLECTED:  { label: 'step.collected',   desc: 'step.complete' },
};

export default function TrackPage() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [selected, setSelected]         = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    applicationsAPI.getMy()
      .then(res => { setApplications(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const currentStep = (status) => STEPS.indexOf(status);

  return (
    <DashboardLayout>
      <PageHeader title={t('track.title')} subtitle={t('track.subtitle')}/>

      {loading ? (
        <div className="text-center py-20 text-[#94a3b8]">{t('common.loading')}</div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-16">
          <FileText size={40} className="mx-auto text-[#cbd5e1] mb-4"/>
          <p className="font-semibold text-[#64748b]">{t('track.no.apps')}</p>
          <p className="text-sm text-[#94a3b8] mt-1">{t('dash.no.apps.sub')}</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {applications.map(app => (
              <button key={app.id} onClick={() => setSelected(app)}
                className={`
                  w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
                  ${selected?.id === app.id
                    ? 'border-[#f59e0b] bg-amber-50 shadow-sm'
                    : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}
                `}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-[#0f172a]">
                    {app.type.replace(/_/g, ' ')}
                  </p>
                  <Badge label={t(`status.${app.status}`)} variant={app.status}/>
                </div>
                <p className="text-xs text-[#94a3b8]">
                  {app.agency?.name} · {new Date(app.createdAt).toLocaleDateString('en-GB')}
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {!selected ? (
              <Card className="flex flex-col items-center justify-center py-20 text-center">
                <FileText size={36} className="text-[#cbd5e1] mb-3"/>
                <p className="text-[#64748b] font-medium">{t('track.select')}</p>
                <p className="text-sm text-[#94a3b8] mt-1">{t('track.select.sub')}</p>
              </Card>
            ) : (
              <Card>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#0f172a]">
                      {selected.type.replace(/_/g, ' ')}
                    </h2>
                    <p className="text-sm text-[#64748b]">{selected.agency?.name}</p>
                  </div>
                  <Badge label={t(`status.${selected.status}`)} variant={selected.status}/>
                </div>

                {/* Progress stepper */}
                {selected.status !== 'REJECTED' && (
                  <div className="mb-6">
                    <div className="relative flex items-center justify-between">
                      {/* Track line */}
                      <div className="absolute left-0 right-0 top-4 h-0.5 bg-[#e2e8f0] z-0"/>
                      <div className="absolute left-0 top-4 h-0.5 bg-[#f59e0b] z-0 transition-all duration-500"
                        style={{ width: `${(currentStep(selected.status) / (STEPS.length - 1)) * 100}%` }}/>

                      {STEPS.map((step, i) => {
                        const done    = i <= currentStep(selected.status);
                        const current = i === currentStep(selected.status);
                        return (
                          <div key={step} className="flex flex-col items-center z-10 gap-2">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                              ${done
                                ? current
                                  ? 'bg-[#f59e0b] text-[#0f172a] ring-4 ring-amber-100'
                                  : 'bg-[#0f172a] text-white'
                                : 'bg-white border-2 border-[#e2e8f0] text-[#94a3b8]'}
                            `}>
                              {done && !current ? <CheckCircle size={14}/> : i + 1}
                            </div>
                            <div className="text-center">
                              <p className={`text-xs font-semibold ${done ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                                {t(STEP_LABEL_KEYS[step].label)}
                              </p>
                              <p className="text-xs text-[#94a3b8] hidden sm:block">
                                {t(STEP_LABEL_KEYS[step].desc)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selected.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-red-700">{t('status.REJECTED')}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {selected.notes || `${t('search.rejected.msg')} ${selected.agency?.name} ${t('search.rejected.msg2')}`}
                    </p>
                  </div>
                )}

                {selected.status === 'READY' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold text-emerald-700">{t('track.ready.collect')}</p>
                    <p className="text-xs text-emerald-600 mt-1">{t('track.ready.sub')}</p>
                  </div>
                )}

                {selected.idCard && (
                  <div className="bg-[#0f172a] rounded-xl p-5 text-white mt-2">
                    <p className="text-xs text-[#94a3b8] font-medium mb-1">{t('search.card.number')}</p>
                    <p className="text-lg font-black tracking-widest text-[#f59e0b]">
                      {selected.idCard.cardNumber}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">
                      {t('search.issued')}: {new Date(selected.idCard.issuedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}