'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageToggle from '@/components/ui/LanguageToggle';
import {
  ArrowRight, CreditCard, Globe, Car,
  Bell, Upload, Search, Shield, CheckCircle, ChevronDown,
  Loader2, AlertCircle, X, Calendar, User, Building2,
  Hash, Clock, ShieldCheck, ShieldX, ShieldAlert,
} from 'lucide-react';

const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

const CARD_STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  icon: ShieldCheck,  desc: 'This card is valid and active.' },
  EXPIRED:   { label: 'Expired',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  icon: Clock,        desc: 'This card has expired. Please apply for a renewal.' },
  LOST:      { label: 'Reported Lost', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: ShieldX,      desc: 'This card has been reported as lost.' },
  SUSPENDED: { label: 'Suspended',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)', icon: ShieldAlert,  desc: 'This card has been suspended. Contact the issuing agency.' },
};

const APP_STATUS_CONFIG = {
  PENDING:    { label: 'Pending Review',       dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  color: '#f59e0b' },
  PROCESSING: { label: 'Being Processed',      dot: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  color: '#3b82f6' },
  PRINTING:   { label: 'Printing',             dot: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)', color: '#8b5cf6' },
  READY:      { label: 'Ready for Collection', dot: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  color: '#10b981' },
  COLLECTED:  { label: 'Collected',            dot: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', color: '#94a3b8' },
  REJECTED:   { label: 'Rejected',             dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  color: '#ef4444' },
};

const TYPE_LABEL = {
  NATIONAL_ID:     'National ID',
  PASSPORT:        'Passport',
  DRIVING_LICENCE: 'Driving Licence',
};

const AGENCY_FULL = {
  NRB:         'National Registration Bureau',
  IMMIGRATION: 'Department of Immigration',
  DRTSS:       'Road Traffic & Safety Services',
};

const TYPE_ICON = {
  NATIONAL_ID:     '🃏',
  PASSPORT:        '🛂',
  DRIVING_LICENCE: '🚗',
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—';

// ── ID Card Search ─────────────────────────────────────────
function IDCardSearch() {
  const { t }                   = useTranslation();
  const [query,   setQuery]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);
  const [error,   setError]     = useState('');
  const inputRef                = useRef(null);
  const API_URL                 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res  = await fetch(`${API_URL}/idcards/search?cardNumber=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok) setError(json.message || 'Something went wrong. Please try again.');
      else         setResult(json.data);
    } catch {
      setError('Could not connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery(''); setResult(null); setError('');
    inputRef.current?.focus();
  };

  const cardCfg    = result ? CARD_STATUS_CONFIG[result.cardStatus] : null;
  const appCfg     = result?.status ? APP_STATUS_CONFIG[result.status] : null;
  const StatusIcon = cardCfg?.icon;

  const isExpiringSoon = result?.expiryDate &&
    new Date(result.expiryDate) > new Date() &&
    (new Date(result.expiryDate) - new Date()) < 90 * 24 * 60 * 60 * 1000;

  return (
    <section className="py-20 bg-[#0f172a] relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none"/>

      <div className="relative z-10 max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-full px-4 py-1.5 mb-5">
            <Search size={13} className="text-[#f59e0b]"/>
            <span className="text-[#f59e0b] text-xs font-semibold tracking-wide uppercase">
              {t('search.badge')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            {t('search.title')}
          </h2>
          <p className="text-[#64748b] text-sm leading-relaxed max-w-md mx-auto">
            {t('search.subtitle')}
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch}>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Hash size={15} className="text-[#6496dc]"/>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value.toUpperCase()); setError(''); setResult(null); }}
                placeholder={t('search.placeholder')}
                maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-10 py-4 text-white text-sm font-mono placeholder-[#808b9a] focus:outline-none focus:border-[#f59e0b]/50 transition-all"
              />
              {query && (
                <button type="button" onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors">
                  <X size={14}/>
                </button>
              )}
            </div>
            <button type="submit" disabled={!query.trim() || loading}
              className="bg-[#f59e0b] text-[#0f172a] font-bold px-6 py-4 rounded-2xl hover:bg-[#fcd34d] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap active:scale-95">
              {loading
                ? <><Loader2 size={15} className="animate-spin"/> {t('search.searching')}</>
                : <>{t('search.btn')} <ArrowRight size={15}/></>
              }
            </button>
          </div>
          <p className="text-center text-xs text-[#8fbdfd]">
            {t('search.format.label')}{' '}
            <span className="font-mono text-[#8490a1]">ML-AGENCY-YEAR-NUMBER</span>
          </p>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5"/>
            <div>
              <p className="text-red-300 font-semibold text-sm mb-1">{t('search.not.found')}</p>
              <p className="text-red-400/80 text-xs leading-relaxed">{error}</p>
              <p className="text-[#475569] text-xs mt-2">{t('search.not.found.hint')}</p>
            </div>
          </div>
        )}

        {/* Result card */}
        {result && cardCfg && (
          <div className="mt-6 rounded-2xl overflow-hidden border"
            style={{ borderColor: cardCfg.border, background: 'rgba(255,255,255,0.03)' }}>

            {/* Status banner */}
            <div className="px-6 py-5 flex items-center gap-4"
              style={{ background: cardCfg.bg, borderBottom: `1px solid ${cardCfg.border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: cardCfg.border }}>
                {StatusIcon && <StatusIcon size={20} style={{ color: cardCfg.color }}/>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-base" style={{ color: cardCfg.color }}>
                    {cardCfg.label}
                  </span>
                  {result.type && <span className="text-lg">{TYPE_ICON[result.type]}</span>}
                </div>
                <p className="text-xs" style={{ color: cardCfg.color, opacity: 0.75 }}>
                  {cardCfg.desc}
                </p>
              </div>
            </div>

            {/* Expiring soon warning */}
            {isExpiringSoon && (
              <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
                <Clock size={13} className="text-amber-400 shrink-0"/>
                <p className="text-amber-300 text-xs font-medium">
                  {t('search.expiring.soon')} {fmtDate(result.expiryDate)}
                </p>
              </div>
            )}

            {/* Details grid */}
            <div className="px-6 py-5">
              <p className="text-[#475569] text-xs uppercase tracking-widest font-semibold mb-4">
                {t('search.card.details')}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash size={12} className="text-[#475569]"/>
                    <p className="text-[#475569] text-xs uppercase tracking-wide font-medium">{t('search.card.number')}</p>
                  </div>
                  <p className="text-white font-mono text-base font-bold tracking-wider">{result.cardNumber}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User size={12} className="text-[#475569]"/>
                    <p className="text-[#475569] text-xs uppercase tracking-wide font-medium">{t('search.holder')}</p>
                  </div>
                  <p className="text-white font-semibold text-sm">{result.holderName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={12} className="text-[#475569]"/>
                    <p className="text-[#475569] text-xs uppercase tracking-wide font-medium">{t('search.doc.type')}</p>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {result.type ? TYPE_LABEL[result.type] : '—'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={12} className="text-[#475569]"/>
                    <p className="text-[#475569] text-xs uppercase tracking-wide font-medium">{t('search.issued')}</p>
                  </div>
                  <p className="text-white font-semibold text-sm">{fmtDate(result.issuedAt)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={12} className="text-[#475569]"/>
                    <p className="text-[#475569] text-xs uppercase tracking-wide font-medium">{t('search.expiry')}</p>
                  </div>
                  <p className="font-semibold text-sm"
                    style={{ color: result.cardStatus === 'EXPIRED' ? '#ef4444' : isExpiringSoon ? '#f59e0b' : 'white' }}>
                    {fmtDate(result.expiryDate)}
                  </p>
                </div>
                {result.agency && (
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={12} className="text-[#475569]"/>
                      <p className="text-[#475569] text-xs uppercase tracking-wide font-medium">{t('search.agency')}</p>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {result.agency} — {AGENCY_FULL[result.agency] || result.agency}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Application status */}
            {appCfg && (
              <div className="px-6 pb-5">
                <div className="rounded-xl p-4"
                  style={{ background: appCfg.bg, border: `1px solid ${appCfg.border}` }}>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-2"
                    style={{ color: appCfg.color, opacity: 0.7 }}>
                    {t('search.app.status')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: appCfg.dot }}/>
                    <span className="font-bold text-sm" style={{ color: appCfg.color }}>{appCfg.label}</span>
                  </div>
                  {result.status === 'READY' && (
                    <p className="text-xs mt-2" style={{ color: appCfg.color, opacity: 0.8 }}>
                      ✅ {t('search.ready.msg')} {result.agency} {t('search.ready.msg2')}
                    </p>
                  )}
                  {result.status === 'REJECTED' && (
                    <p className="text-xs mt-2" style={{ color: appCfg.color, opacity: 0.8 }}>
                      {t('search.rejected.msg')} {result.agency} {t('search.rejected.msg2')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 pb-5">
              <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                <p className="text-[#475569] text-xs">{t('search.footer.text')}</p>
                <Link href="/register"
                  className="text-[#f59e0b] text-xs font-semibold hover:underline whitespace-nowrap flex items-center gap-1">
                  {t('search.footer.link')} <ArrowRight size={11}/>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main landing page ─────────────────────────────────────
export default function LandingPage() {
  const { t }    = useTranslation();
  const citizens = useCounter(12400);
  const apps     = useCounter(34800);
  const agencies = useCounter(3);

  // Services and steps use t() so they're inside the component
  const services = [
    { icon: CreditCard, label: t('service.national.id'), agency: 'NRB',        color: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50',    text: 'text-blue-700',    desc: t('land.service.id.desc') },
    { icon: Globe,      label: t('service.passport'),    agency: 'Immigration', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', desc: t('land.service.passport.desc') },
    { icon: Car,        label: t('service.licence'),     agency: 'DRTSS',      color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',   text: 'text-amber-700',   desc: t('land.service.licence.desc') },
  ];

  const steps = [
    { icon: Shield,      title: t('land.step.register'), desc: t('land.step.register.desc') },
    { icon: Upload,      title: t('land.step.apply'),    desc: t('land.step.apply.desc') },
    { icon: Search,      title: t('land.step.track'),    desc: t('land.step.track.desc') },
    { icon: Bell,        title: t('land.step.notify'),   desc: t('land.step.notify.desc') },
    { icon: CheckCircle, title: t('land.step.collect'),  desc: t('land.step.collect.desc') },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center font-black text-[#f59e0b] text-sm">M</div>
            <span className="font-bold text-[#0f172a] text-base">Mala-Link</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748b]">
            <a href="#services" className="hover:text-[#0f172a] transition-colors">{t('land.nav.services')}</a>
            <a href="#how"      className="hover:text-[#0f172a] transition-colors">{t('land.nav.how')}</a>
            <a href="#agencies" className="hover:text-[#0f172a] transition-colors">{t('land.nav.agencies')}</a>
            <a href="#search"   className="hover:text-[#0f172a] transition-colors">{t('land.nav.check')}</a>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle in navbar for landing page */}
            <LanguageToggle/>
            <Link href="/login"
              className="text-sm font-semibold text-[#0f172a] hover:text-[#f59e0b] transition-colors px-4 py-2">
              {t('land.signin')}
            </Link>
            <Link href="/register"
              className="bg-[#f59e0b] text-[#0f172a] text-sm font-bold px-5 py-2 rounded-xl hover:bg-[#d97706] transition-colors">
              {t('land.get.started')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="min-h-screen bg-[#0f172a] flex items-center relative overflow-hidden pt-20">
        <div className="absolute top-1/4 right-0 w-150 h-150 bg-[#f59e0b]/8 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute bottom-0 left-1/4 w-100 h-100 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"/>
              <span className="text-[#94a3b8] text-xs font-medium">{t('land.hero.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {t('land.hero.line1')}<br/>
              {t('land.hero.line2')}<br/>
              <span className="text-[#f59e0b]">{t('land.hero.line3')}</span>
            </h1>
            <p className="text-[#64748b] text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              {t('land.sub')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-[#f59e0b] text-[#0f172a] font-bold px-8 py-4 rounded-2xl hover:bg-[#fcd34d] active:scale-95 transition-all text-base">
                {t('land.create.account')} <ArrowRight size={18}/>
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all text-base">
                {t('land.signin')}
              </Link>
              <a href="#search"
                className="inline-flex items-center gap-2 border border-white/10 text-[#64748b] font-medium px-6 py-4 rounded-2xl hover:bg-white/5 hover:text-white transition-all text-sm">
                <Search size={15}/> {t('land.check.status')}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-20 pt-10 border-t border-white/10">
            {[
              { value: citizens.toLocaleString() + '+', label: t('land.stat.citizens') },
              { value: apps.toLocaleString() + '+',     label: t('land.stat.apps') },
              { value: agencies + ' ' + t('land.stat.agencies.unit'), label: t('land.stat.agencies') },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
                <p className="text-[#64748b] text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <p className="text-[#475569] text-xs">{t('land.scroll')}</p>
          <ChevronDown size={16} className="text-[#475569] animate-bounce"/>
        </div>
      </section>

      {/* ── ID CARD SEARCH ──────────────────────────────── */}
      <div id="search"><IDCardSearch/></div>

      {/* ── SERVICES ────────────────────────────────────── */}
      <section id="services" className="py-24 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-3">{t('land.services.badge')}</p>
            <h2 className="text-4xl font-black text-[#0f172a]">
              {t('land.services.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, label, agency, color, bg, text, desc }) => (
              <div key={label}
                className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`bg-linear-to-br ${color} p-8 relative overflow-hidden`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <Icon size={26} className="text-white"/>
                  </div>
                  <h3 className="text-xl font-black text-white">{label}</h3>
                  <p className="text-white/70 text-sm mt-1">{t('service.via')} {agency}</p>
                </div>
                <div className="p-6">
                  <p className="text-[#64748b] text-sm leading-relaxed mb-5">{desc}</p>
                  <Link href="/register"
                    className={`inline-flex items-center gap-1.5 text-sm font-bold ${text} hover:gap-3 transition-all`}>
                    {t('land.apply.now')} <ArrowRight size={14}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-3">{t('land.how.badge')}</p>
            <h2 className="text-4xl font-black text-[#0f172a]">{t('land.how.title')}</h2>
            <p className="text-[#64748b] mt-3 max-w-lg mx-auto">{t('land.how.sub')}</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-10 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#e2e8f0] to-transparent"/>
            <div className="grid md:grid-cols-5 gap-6">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon size={26} className="text-[#f59e0b]"/>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f59e0b] rounded-full flex items-center justify-center text-[#0f172a] text-xs font-black">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-[#0f172a] mb-2">{title}</h3>
                  <p className="text-[#64748b] text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENCIES ────────────────────────────────────── */}
      <section id="agencies" className="py-24 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-3">{t('land.agencies.badge')}</p>
            <h2 className="text-4xl font-black text-white">{t('land.agencies.title')}</h2>
            <p className="text-[#64748b] mt-3">{t('land.agencies.sub')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'NRB',         full: t('land.agency.nrb'),         icon: '🪪', handles: t('land.agency.nrb.handles') },
              { name: 'Immigration', full: t('land.agency.immigration'),  icon: '🛂', handles: t('land.agency.immigration.handles') },
              { name: 'DRTSS',       full: t('land.agency.drtss'),        icon: '🚗', handles: t('land.agency.drtss.handles') },
            ].map(({ name, full, icon, handles }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4">{icon}</div>
                <p className="text-[#f59e0b] font-black text-lg">{name}</p>
                <p className="text-white font-medium text-sm mt-0.5">{full}</p>
                <p className="text-[#475569] text-xs mt-2">{t('land.agency.handles')}: {handles}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#f59e0b]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-[#0f172a] leading-tight mb-4">
            {t('land.cta.title')}
          </h2>
          <p className="text-[#78350f] text-lg mb-10">{t('land.cta.sub')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-[#0f172a] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#1e293b] active:scale-95 transition-all text-base">
              {t('land.create.account')} <ArrowRight size={18}/>
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 border-2 border-[#0f172a]/30 text-[#0f172a] font-semibold px-10 py-4 rounded-2xl hover:border-[#0f172a] transition-all text-base">
              {t('land.cta.have.account')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-[#0f172a] border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#f59e0b] rounded-lg flex items-center justify-center font-black text-[#0f172a] text-xs">M</div>
            <span className="font-bold text-white text-sm">Mala-Link</span>
          </div>
          <p className="text-[#475569] text-xs text-center">{t('land.footer.copy')}</p>
          <div className="flex items-center gap-6 text-xs text-[#475569]">
            <a href="#search"         className="hover:text-white transition-colors">{t('land.nav.check')}</a>
            <Link href="/login"       className="hover:text-white transition-colors">{t('land.signin')}</Link>
            <Link href="/register"    className="hover:text-white transition-colors">{t('land.get.started')}</Link>
            <Link href="/staff/login" className="hover:text-white transition-colors">{t('land.staff.portal')}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}