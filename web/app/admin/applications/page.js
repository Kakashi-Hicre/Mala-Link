'use client';
// Place at: app/admin/applications/page.js
// Read-only cross-agency monitor. Admin views only — status changes are for agency staff.

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import {
  Search, X, FolderOpen, User, Mail, Phone,
  Building2, CreditCard, Calendar, RefreshCw,
  Clock, FileText, Printer, Package,
  CheckCircle, AlertTriangle, ChevronRight,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:    { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b',  label: 'Pending',    icon: Clock },
  PROCESSING: { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6',  label: 'Processing', icon: FileText },
  PRINTING:   { bg: '#faf5ff', text: '#7e22ce', dot: '#a855f7',  label: 'Printing',   icon: Printer },
  READY:      { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e',  label: 'Ready',      icon: Package },
  COLLECTED:  { bg: '#f8fafc', text: '#475569', dot: '#94a3b8',  label: 'Collected',  icon: CheckCircle },
  REJECTED:   { bg: '#fff1f2', text: '#be123c', dot: '#f43f5e',  label: 'Rejected',   icon: AlertTriangle },
};

const AGENCY_CFG = {
  NRB:         { label: 'NRB',         bg: '#eff6ff', text: '#1d4ed8' },
  IMMIGRATION: { label: 'Immigration', bg: '#f0fdf4', text: '#15803d' },
  DRTSS:       { label: 'DRTSS',       bg: '#fffbeb', text: '#b45309' },
};

const ALL_STATUSES = ['PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED'];

// ── Helpers ───────────────────────────────────────────────────
const fmtType = t =>
  (t || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const fmtDate = iso =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const timeAgo = iso => {
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000);
  if (days === 0)  return 'today';
  if (days === 1)  return 'yesterday';
  if (days < 30)   return `${days}d ago`;
  const mo = Math.floor(days / 30);
  return mo < 12 ? `${mo}mo ago` : `${Math.floor(mo / 12)}y ago`;
};

// ── Skeletons ─────────────────────────────────────────────────
function AppRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5
                    flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-[#f1f5f9] rounded" />
        <div className="h-3 w-1/2 bg-[#f1f5f9] rounded" />
      </div>
      <div className="h-6 w-20 bg-[#f1f5f9] rounded-full" />
      <div className="h-6 w-24 bg-[#f1f5f9] rounded-full" />
    </div>
  );
}

// ── Application row ───────────────────────────────────────────
function AppRow({ app, onClick }) {
  const cfg        = STATUS_CFG[app.status] || STATUS_CFG.PENDING;
  const StatusIcon = cfg.icon;
  const agencyCfg  = AGENCY_CFG[app.agency?.name] || AGENCY_CFG.NRB;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[#e2e8f0]
                 shadow-sm p-5 hover:shadow-md hover:border-[#cbd5e1]
                 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        {/* Status icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.bg }}
        >
          <StatusIcon size={17} style={{ color: cfg.text }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-bold text-[#0f172a] text-sm">{fmtType(app.type)}</p>
          </div>
          <p className="text-xs text-[#64748b] truncate">{app.citizen?.fullName}</p>
          <p className="text-xs text-[#94a3b8]">{timeAgo(app.createdAt)}</p>
        </div>

        {/* Agency */}
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 hidden sm:inline"
          style={{ background: agencyCfg.bg, color: agencyCfg.text }}
        >
          {agencyCfg.label}
        </span>

        {/* Status badge */}
        <Badge label={app.status} variant={app.status} />

        <ChevronRight size={15} className="text-[#94a3b8] group-hover:text-[#0f172a]
                                            group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}

// ── Read-only detail panel ────────────────────────────────────
function AppDetailPanel({ app, onClose }) {
  if (!app) return null;

  const agencyCfg = AGENCY_CFG[app.agency?.name] || AGENCY_CFG.NRB;
  const statusCfg = STATUS_CFG[app.status]        || STATUS_CFG.PENDING;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white z-50
                   shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease both' }}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#0f172a] border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center
                              justify-center shrink-0">
                <FolderOpen size={16} className="text-[#0f172a]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{fmtType(app.type)}</p>
                <p className="text-[#64748b] text-xs">{app.citizen?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge label={app.status} variant={app.status} />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center
                           text-[#94a3b8] hover:text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Agency + date strip */}
          <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#f1f5f9]
                          flex items-center gap-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: agencyCfg.bg, color: agencyCfg.text }}
            >
              {agencyCfg.label}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <Calendar size={12} />
              <span>Submitted {fmtDate(app.createdAt)}</span>
            </div>
          </div>

          {/* Citizen info */}
          <div className="px-6 py-5">
            <SectionHead icon={User} title="Citizen" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name', value: app.citizen?.fullName },
                { label: 'Email',     value: app.citizen?.email    || '—' },
                { label: 'Phone',     value: app.citizen?.phone    || '—' },
              ].map(({ label, value }) => (
                <InfoCell key={label} label={label} value={value} />
              ))}
            </div>
          </div>

          {/* Status section */}
          <div className="px-6 pb-5">
            <SectionHead icon={FileText} title="Application Status" />
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{ background: statusCfg.bg }}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: statusCfg.dot }}
              />
              <div>
                <p style={{ color: statusCfg.text, fontWeight: 700, fontSize: 15 }}>
                  {statusCfg.label}
                </p>
                <p style={{ color: statusCfg.text, fontSize: 12, opacity: 0.75 }}>
                  {app.status === 'REJECTED'
                    ? 'Application was rejected by agency staff'
                    : app.status === 'COLLECTED'
                    ? 'Card has been collected by the citizen'
                    : 'Being handled by agency staff'}
                </p>
              </div>
            </div>
          </div>

          {/* ID Card — if issued */}
          {app.idCard && (
            <div className="px-6 pb-6">
              <SectionHead icon={CreditCard} title="Issued ID Card" />
              <div className="bg-[#0f172a] rounded-2xl p-5 flex items-center gap-4">
                <CreditCard size={22} className="text-[#f59e0b] shrink-0" />
                <div>
                  <p className="text-[#94a3b8] text-xs mb-1">Card Number</p>
                  <p className="text-[#f59e0b] font-black text-lg tracking-widest font-mono">
                    {app.idCard.cardNumber}
                  </p>
                  <p className="text-[#475569] text-xs mt-1">
                    Status:{' '}
                    <span className="font-semibold text-white">
                      {app.idCard.cardStatus}
                    </span>
                    {app.idCard.issuedAt && (
                      <> · Issued {fmtDate(app.idCard.issuedAt)}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Read-only note */}
          <div className="mx-6 mb-6 flex items-center gap-2 bg-[#f8fafc]
                          border border-[#e2e8f0] rounded-xl px-4 py-3">
            <Building2 size={13} className="text-[#94a3b8] shrink-0" />
            <p className="text-xs text-[#64748b]">
              Status changes are handled by{' '}
              <span className="font-semibold text-[#0f172a]">
                {agencyCfg.label} agency staff
              </span>
              . Admin view is read-only.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Tiny shared sub-components ────────────────────────────────
function SectionHead({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center shrink-0">
        <Icon size={11} className="text-[#f59e0b]" />
      </div>
      <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">{title}</p>
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3">
      <p className="text-xs text-[#94a3b8] font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#0f172a] break-words">{value || '—'}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const [apps,          setApps]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [agencyFilter,  setAgencyFilter]  = useState('');
  const [selected,      setSelected]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllApplications();
      setApps(res.data.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Client-side filtering (instant) ──────────────────────
  const filtered = apps.filter(app => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || app.citizen?.fullName?.toLowerCase().includes(q)
      || app.citizen?.email?.toLowerCase().includes(q)
      || app.type?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || app.status === statusFilter;
    const matchAgency = !agencyFilter || app.agency?.name === agencyFilter;
    return matchSearch && matchStatus && matchAgency;
  });

  // Counts per status for pills
  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {});

  const agencyCounts = Object.keys(AGENCY_CFG).reduce((acc, name) => {
    acc[name] = apps.filter(a => a.agency?.name === name).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1.5">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Applications</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {loading ? '…' : `${filtered.length} of ${apps.length}`}
            {statusFilter || agencyFilter || search ? ' matching filters' : ' total'}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0]
                     rounded-xl text-sm font-medium text-[#64748b] hover:text-[#0f172a]
                     hover:border-[#0f172a] transition-all disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                     text-[#94a3b8] pointer-events-none" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search citizen name, email, or type…"
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#e2e8f0]
                     rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8]
                     focus:outline-none focus:border-[#f59e0b] transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-[#94a3b8] hover:text-[#0f172a] transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {[{ label: 'All statuses', value: '' }, ...ALL_STATUSES.map(s => ({
          label: STATUS_CFG[s].label, value: s,
        }))].map(({ label, value }) => (
          <button key={value} onClick={() => setStatusFilter(value)}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
              ${statusFilter === value
                ? 'bg-[#0f172a] text-white border-[#0f172a]'
                : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0f172a] hover:text-[#0f172a]'}
            `}>
            {label}
            {value && statusCounts[value] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                ${statusFilter === value ? 'bg-white/20' : 'bg-[#f1f5f9]'}`}>
                {statusCounts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Agency filter pills */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {[{ label: 'All agencies', value: '' }, ...Object.keys(AGENCY_CFG).map(name => ({
          label: AGENCY_CFG[name].label, value: name,
        }))].map(({ label, value }) => (
          <button key={value} onClick={() => setAgencyFilter(value)}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
              ${agencyFilter === value
                ? 'bg-[#0f172a] text-white border-[#0f172a]'
                : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0f172a] hover:text-[#0f172a]'}
            `}>
            {label}
            {value && agencyCounts[value] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                ${agencyFilter === value ? 'bg-white/20' : 'bg-[#f1f5f9]'}`}>
                {agencyCounts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => <AppRowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] py-20 text-center">
          <FolderOpen size={28} className="text-[#cbd5e1] mx-auto mb-3" />
          <p className="font-semibold text-[#64748b]">No applications found</p>
          <p className="text-sm text-[#94a3b8] mt-1">
            {search || statusFilter || agencyFilter
              ? 'Try adjusting your filters'
              : 'No applications submitted yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <AppRow key={app.id} app={app} onClick={() => setSelected(app)} />
          ))}
        </div>
      )}

      {selected && (
        <AppDetailPanel app={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}