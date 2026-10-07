'use client';
// Replaces: app/admin/page.js  (the Phase 1 placeholder)

import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import StatCard   from '@/components/ui/StatCard';
import Badge      from '@/components/ui/Badge';
import toast      from 'react-hot-toast';
import {
  Users, FolderOpen, CreditCard, UserCog,
  RefreshCw, Building2, Activity,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────
const STATUSES = ['PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED'];

// Matches Badge.js variant colours exactly
const STATUS_CFG = {
  PENDING:    { bg: '#fffbeb', text: '#b45309' },
  PROCESSING: { bg: '#eff6ff', text: '#1d4ed8' },
  PRINTING:   { bg: '#faf5ff', text: '#7e22ce' },
  READY:      { bg: '#f0fdf4', text: '#15803d' },
  COLLECTED:  { bg: '#f8fafc', text: '#475569' },
  REJECTED:   { bg: '#fff1f2', text: '#be123c' },
};

const AGENCY_META = {
  NRB:         { label: 'NRB',         sub: 'National Registration Bureau', accent: '#3b82f6' },
  IMMIGRATION: { label: 'Immigration', sub: 'Immigration Department',       accent: '#10b981' },
  DRTSS:       { label: 'DRTSS',       sub: 'Road Traffic & Safety',        accent: '#f59e0b' },
};

// ── Helpers ───────────────────────────────────────────────────
const fmt = n => (n ?? 0).toLocaleString();

const fmtType = t =>
  (t || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const timeAgo = iso => {
  const ms   = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Skeleton bone ─────────────────────────────────────────────
function Bone({ h = 4, w = 'full', rounded = 'lg' }) {
  return (
    <div
      className={`animate-pulse bg-[#f1f5f9] rounded-${rounded}`}
      style={{ height: h * 4, width: w === 'full' ? '100%' : w * 4 }}
    />
  );
}

// ── Agency card ───────────────────────────────────────────────
function AgencyCard({ name, data, loading }) {
  const meta          = AGENCY_META[name] || { label: name, sub: '', accent: '#0f172a' };
  const completePct   = data?.total > 0
    ? Math.round(((data?.COLLECTED || 0) / data.total) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">

      {/* Coloured header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: meta.accent }}
      >
        <div>
          <p className="text-white font-bold text-sm leading-none">{meta.label}</p>
          <p className="text-white/60 text-xs mt-0.5">{meta.sub}</p>
        </div>

        {loading ? (
          <div className="w-16 h-8 bg-white/20 rounded-xl animate-pulse" />
        ) : (
          <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
            <p className="text-white font-black text-lg leading-none">{fmt(data?.total)}</p>
            <p className="text-white/60 text-xs">total</p>
          </div>
        )}
      </div>

      {/* Status grid — 3 columns × 2 rows */}
      <div className="p-4 grid grid-cols-3 gap-2">
        {STATUSES.map(status => {
          const cfg = STATUS_CFG[status];
          const label = status.charAt(0) + status.slice(1).toLowerCase();
          return (
            <div
              key={status}
              className="rounded-xl px-3 py-2.5 text-center"
              style={{ background: cfg.bg }}
            >
              {loading ? (
                <div className="h-5 w-8 bg-white/60 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p style={{ color: cfg.text, fontWeight: 800, fontSize: 17, lineHeight: 1 }}>
                  {fmt(data?.[status])}
                </p>
              )}
              <p style={{ color: cfg.text, fontSize: 10, fontWeight: 600, marginTop: 3, opacity: 0.8 }}>
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Completion bar */}
      {!loading && (
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs text-[#94a3b8] font-medium">Collection rate</p>
            <p className="text-xs font-bold text-[#0f172a]">{completePct}%</p>
          </div>
          <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completePct}%`, background: meta.accent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recent application row ────────────────────────────────────
function RecentRow({ app }) {
  const cfg = STATUS_CFG[app.status] || STATUS_CFG.PENDING;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#f1f5f9] last:border-0">

      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: cfg.text }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0f172a] truncate">
          {fmtType(app.type)}
        </p>
        <p className="text-xs text-[#94a3b8] truncate">{app.citizen?.fullName}</p>
      </div>

      {/* Right: badge + time */}
      <div className="text-right shrink-0 space-y-0.5">
        <Badge label={app.status} variant={app.status} />
        <p className="text-xs text-[#94a3b8]">{timeAgo(app.createdAt)}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOverview();
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load overview stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = stats;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1.5">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            System-wide view across all agencies
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

      {/* ── Row 1: stat cards ────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {loading ? (
          /* Skeleton stat cards while loading */
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#f1f5f9] animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-7 w-14 bg-[#f1f5f9] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#f1f5f9] rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Citizens"
              value={fmt(s?.totalCitizens)}
              color="blue"
            />
            <StatCard
              icon={FolderOpen}
              label="Total Applications"
              value={fmt(s?.totalApplications)}
              color="gold"
            />
            <StatCard
              icon={CreditCard}
              label="Cards Issued"
              value={fmt(s?.totalCards)}
              color="green"
            />
            <StatCard
              icon={UserCog}
              label="Agency Staff"
              value={fmt(s?.totalStaff)}
              color="navy"
            />
          </>
        )}
      </div>

      {/* ── Row 2: application status summary strip ──────────── */}
      {!loading && s?.applicationsByStatus && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-[#94a3b8]" />
            <p className="text-sm font-bold text-[#0f172a]">Application Pipeline</p>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {STATUSES.map(status => {
              const cfg   = STATUS_CFG[status];
              const count = s.applicationsByStatus[status] || 0;
              const pct   = s.totalApplications > 0
                ? Math.round((count / s.totalApplications) * 100)
                : 0;
              const label = status.charAt(0) + status.slice(1).toLowerCase();

              return (
                <div key={status} className="text-center">
                  <div
                    className="rounded-xl py-3 mb-2"
                    style={{ background: cfg.bg }}
                  >
                    <p style={{ color: cfg.text, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                      {fmt(count)}
                    </p>
                    <p style={{ color: cfg.text, fontSize: 10, fontWeight: 600, opacity: 0.8, marginTop: 3 }}>
                      {pct}%
                    </p>
                  </div>
                  <p className="text-xs text-[#94a3b8] font-medium">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Row 3: agency breakdown + recent activity ─────────── */}
      <div className="grid grid-cols-3 gap-6">

        {/* Agency breakdown — 2 cols */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 size={15} className="text-[#94a3b8]" />
            <p className="text-sm font-bold text-[#0f172a]">Agency Breakdown</p>
          </div>

          {['NRB', 'IMMIGRATION', 'DRTSS'].map(name => (
            <AgencyCard
              key={name}
              name={name}
              data={s?.byAgency?.[name]}
              loading={loading}
            />
          ))}
        </div>

        {/* Recent applications — 1 col */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-[#94a3b8]" />
            <p className="text-sm font-bold text-[#0f172a]">Recent Applications</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-1">
            {loading ? (
              /* Skeleton rows */
              <div className="space-y-4 py-3">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#f1f5f9] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-[#f1f5f9] rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-[#f1f5f9] rounded animate-pulse w-1/2" />
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="h-5 w-20 bg-[#f1f5f9] rounded-full animate-pulse" />
                      <div className="h-3 w-12 bg-[#f1f5f9] rounded animate-pulse ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !s?.recentApplications?.length ? (
              <p className="text-sm text-[#94a3b8] text-center py-10">
                No applications yet
              </p>
            ) : (
              s.recentApplications.map(app => (
                <RecentRow key={app.id} app={app} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}