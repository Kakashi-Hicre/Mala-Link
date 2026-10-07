'use client';
// Place at: app/admin/cards/page.js

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Search, X, CreditCard, User, Calendar,
  RefreshCw, ChevronRight, Shield,
  CheckCircle, AlertTriangle, Ban, Clock,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────
const CARD_STATUS_CFG = {
  ACTIVE:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', label: 'Active',    icon: CheckCircle },
  SUSPENDED: { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', label: 'Suspended', icon: Clock },
  LOST:      { bg: '#fff1f2', text: '#be123c', dot: '#f43f5e', label: 'Lost',      icon: AlertTriangle },
  EXPIRED:   { bg: '#f8fafc', text: '#475569', dot: '#94a3b8', label: 'Expired',   icon: Ban },
};

const AGENCY_CFG = {
  NRB:         { label: 'NRB',         bg: '#eff6ff', text: '#1d4ed8' },
  IMMIGRATION: { label: 'Immigration', bg: '#f0fdf4', text: '#15803d' },
  DRTSS:       { label: 'DRTSS',       bg: '#fffbeb', text: '#b45309' },
};

const CARD_STATUSES = ['ACTIVE', 'SUSPENDED', 'LOST', 'EXPIRED'];

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = iso =>
  iso ? new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—';

const fmtType = t =>
  (t || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const isExpiringSoon = expiryDate => {
  if (!expiryDate) return false;
  const days = Math.floor((new Date(expiryDate) - Date.now()) / 86_400_000);
  return days >= 0 && days <= 90;  // warn within 90 days
};

const isExpiredDate = expiryDate =>
  expiryDate ? new Date(expiryDate) < new Date() : false;

// ── Skeleton ──────────────────────────────────────────────────
function CardRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5
                    flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-[#f1f5f9] rounded" />
        <div className="h-3 w-1/2 bg-[#f1f5f9] rounded" />
      </div>
      <div className="h-6 w-20 bg-[#f1f5f9] rounded-full" />
      <div className="w-8 h-8 rounded-xl bg-[#f1f5f9]" />
    </div>
  );
}

// ── Card row ──────────────────────────────────────────────────
function CardRow({ card, onClick }) {
  const cfg        = CARD_STATUS_CFG[card.cardStatus] || CARD_STATUS_CFG.ACTIVE;
  const StatusIcon = cfg.icon;
  const agencyName = card.application?.agency?.name;
  const agencyCfg  = AGENCY_CFG[agencyName];
  const expired    = isExpiredDate(card.expiryDate);
  const expiring   = isExpiringSoon(card.expiryDate);

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

        {/* Card number + holder */}
        <div className="flex-1 min-w-0">
          <p className="font-mono font-black text-[#f59e0b] text-sm tracking-wider mb-0.5">
            {card.cardNumber}
          </p>
          <p className="text-xs font-semibold text-[#0f172a] truncate">
            {card.holderName}
          </p>
          {/* Expiry warning */}
          {expired && card.cardStatus === 'ACTIVE' && (
            <p className="text-xs text-red-500 font-medium mt-0.5">
              ⚠ Expired {fmtDate(card.expiryDate)}
            </p>
          )}
          {expiring && !expired && (
            <p className="text-xs text-amber-500 font-medium mt-0.5">
              ⚡ Expires {fmtDate(card.expiryDate)}
            </p>
          )}
          {!expired && !expiring && (
            <p className="text-xs text-[#94a3b8]">
              Expires {fmtDate(card.expiryDate)}
            </p>
          )}
        </div>

        {/* Agency (if from an application) */}
        {agencyCfg && (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 hidden sm:inline"
            style={{ background: agencyCfg.bg, color: agencyCfg.text }}
          >
            {agencyCfg.label}
          </span>
        )}

        {/* Status badge */}
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
          style={{ background: cfg.bg, color: cfg.text }}
        >
          {cfg.label}
        </span>

        <ChevronRight size={15} className="text-[#94a3b8] group-hover:text-[#0f172a]
                                            group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}

// ── Mini card visual (panel preview) ─────────────────────────
function CardVisual({ card }) {
  const cfg = CARD_STATUS_CFG[card.cardStatus] || CARD_STATUS_CFG.ACTIVE;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
      borderRadius: 16, padding: '22px 22px 18px', color: 'white',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -20, top: -20, width: 100,
                    height: 100, borderRadius: '50%', background: 'rgba(245,158,11,0.08)' }} />
      <div style={{ position: 'absolute', right: 10, bottom: -30, width: 70,
                    height: 70, borderRadius: '50%', background: 'rgba(245,158,11,0.05)' }} />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 24, height: 24, background: '#f59e0b', borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={12} color="#0f172a" />
          </div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.6)' }}>MALA-LINK</p>
        </div>
        <span style={{ fontSize: 9, color: cfg.dot, fontWeight: 700,
                       letterSpacing: '0.05em' }}>
          ● {cfg.label.toUpperCase()}
        </span>
      </div>
      {/* Card number */}
      <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 900,
                  letterSpacing: '0.1em', color: '#f59e0b', marginBottom: 16 }}>
        {card.cardNumber}
      </p>
      {/* Bottom info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Holder', value: card.holderName },
          { label: 'Sex',    value: card.sex || '—' },
          { label: 'Expiry', value: fmtDate(card.expiryDate) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 600,
                        letterSpacing: '0.07em', marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Card detail panel ─────────────────────────────────────────
function CardDetailPanel({ card, onClose, onStatusUpdate, updateLoading }) {
  const [newStatus, setNewStatus] = useState(card.cardStatus);

  // Reset when panel switches card
  useEffect(() => { setNewStatus(card.cardStatus); }, [card.cardNumber]);

  const cfg        = CARD_STATUS_CFG[card.cardStatus] || CARD_STATUS_CFG.ACTIVE;
  const agencyName = card.application?.agency?.name;
  const agencyCfg  = AGENCY_CFG[agencyName];
  const canUpdate  = newStatus !== card.cardStatus;

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
                <CreditCard size={16} className="text-[#0f172a]" />
              </div>
              <div>
                <p className="font-mono font-black text-[#f59e0b] text-sm tracking-wide">
                  {card.cardNumber}
                </p>
                <p className="text-[#64748b] text-xs">{card.holderName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                {cfg.label}
              </span>
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

          {/* Card visual */}
          <div className="px-6 pt-5 pb-4">
            <CardVisual card={card} />
          </div>

          {/* Details grid */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center">
                <User size={11} className="text-[#f59e0b]" />
              </div>
              <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
                Card Details
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Holder Name',  value: card.holderName },
                { label: 'Sex',          value: card.sex || '—' },
                { label: 'Date of Birth',value: fmtDate(card.dateOfBirth) },
                { label: 'Issued',       value: fmtDate(card.issuedAt) },
                { label: 'Expires',      value: fmtDate(card.expiryDate) },
                { label: 'Agency',       value: agencyCfg?.label || 'Manual' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3">
                  <p className="text-xs text-[#94a3b8] font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#0f172a]">{value}</p>
                </div>
              ))}
            </div>

            {/* Application link (if card came from application) */}
            {card.application && (
              <div className="mt-3 flex items-center gap-3 bg-[#f8fafc]
                              border border-[#f1f5f9] rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#94a3b8] font-medium mb-0.5">From Application</p>
                  <p className="text-sm font-semibold text-[#0f172a]">
                    {fmtType(card.application.type)}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {card.application.citizen?.fullName} · {card.application.citizen?.email}
                  </p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
                  style={{
                    background: agencyCfg?.bg || '#f1f5f9',
                    color:      agencyCfg?.text || '#64748b',
                  }}
                >
                  {agencyCfg?.label || 'Agency'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: status update */}
        <div className="border-t border-[#f1f5f9] px-6 py-5 bg-white space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center">
              <Shield size={11} className="text-[#f59e0b]" />
            </div>
            <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
              Update Card Status
            </p>
          </div>

          {/* Status selector */}
          <div className="grid grid-cols-2 gap-2">
            {CARD_STATUSES.map(status => {
              const s      = CARD_STATUS_CFG[status];
              const active = newStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2
                             text-xs font-bold transition-all text-left"
                  style={{
                    background:   active ? s.bg         : 'white',
                    borderColor:  active ? s.dot         : '#e2e8f0',
                    color:        active ? s.text        : '#64748b',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: active ? s.dot : '#cbd5e1' }}
                  />
                  {s.label}
                  {status === card.cardStatus && (
                    <span className="ml-auto text-xs opacity-50">(current)</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Update button */}
          <button
            onClick={() => onStatusUpdate(card.cardNumber, newStatus)}
            disabled={!canUpdate || updateLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       text-sm font-bold transition-all disabled:opacity-40
                       bg-[#0f172a] text-white hover:bg-[#1e293b] disabled:cursor-not-allowed"
          >
            {updateLoading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                 rounded-full animate-spin" />
              : <Shield size={15} />}
            {updateLoading
              ? 'Updating…'
              : canUpdate
              ? `Set to ${CARD_STATUS_CFG[newStatus]?.label}`
              : 'Select a different status'}
          </button>
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

// ── Main page ─────────────────────────────────────────────────
export default function AdminCardsPage() {
  const [cards,         setCards]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [selected,      setSelected]      = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllCards();
      setCards(res.data.data);
    } catch {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Status update ─────────────────────────────────────────
  const handleStatusUpdate = async (cardNumber, cardStatus) => {
    setUpdateLoading(true);
    try {
      await adminAPI.updateCardStatus(cardNumber, { cardStatus });
      toast.success(`Card status updated to ${CARD_STATUS_CFG[cardStatus]?.label}`);
      // Update local state immediately — no full reload needed
      setCards(prev =>
        prev.map(c => c.cardNumber === cardNumber ? { ...c, cardStatus } : c)
      );
      setSelected(prev => prev?.cardNumber === cardNumber ? { ...prev, cardStatus } : prev);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update card status');
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── Client-side filtering ─────────────────────────────────
  const filtered = cards.filter(card => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || card.cardNumber?.toLowerCase().includes(q)
      || card.holderName?.toLowerCase().includes(q)
      || card.application?.citizen?.fullName?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || card.cardStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // Counts per status for filter pills
  const statusCounts = CARD_STATUSES.reduce((acc, s) => {
    acc[s] = cards.filter(c => c.cardStatus === s).length;
    return acc;
  }, {});

  // Extra derived stats for the summary strip
  const expiredCount  = cards.filter(c =>
    isExpiredDate(c.expiryDate) && c.cardStatus === 'ACTIVE').length;
  const expiringCount = cards.filter(c =>
    isExpiringSoon(c.expiryDate) && !isExpiredDate(c.expiryDate)).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1.5">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">ID Cards</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {loading ? '…' : `${filtered.length} of ${cards.length}`}
            {statusFilter || search ? ' matching filters' : ' cards total'}
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

      {/* Expiry alerts strip */}
      {!loading && (expiredCount > 0 || expiringCount > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {expiredCount > 0 && (
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className="flex items-center gap-3 bg-red-50 border border-red-200
                         rounded-2xl px-4 py-3 text-left hover:border-red-300 transition-colors"
            >
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">{expiredCount} Expired</p>
                <p className="text-xs text-red-500">Active cards past expiry date</p>
              </div>
            </button>
          )}
          {expiringCount > 0 && (
            <button
              onClick={() => {}}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200
                         rounded-2xl px-4 py-3 text-left"
            >
              <Clock size={16} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-700">{expiringCount} Expiring</p>
                <p className="text-xs text-amber-500">Within the next 90 days</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                     text-[#94a3b8] pointer-events-none" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Card number or holder name…"
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
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {[{ label: 'All cards', value: '' }, ...CARD_STATUSES.map(s => ({
          label: CARD_STATUS_CFG[s].label, value: s,
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

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => <CardRowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] py-20 text-center">
          <CreditCard size={28} className="text-[#cbd5e1] mx-auto mb-3" />
          <p className="font-semibold text-[#64748b]">No cards found</p>
          <p className="text-sm text-[#94a3b8] mt-1">
            {search || statusFilter
              ? 'Try adjusting your search or filter'
              : 'No cards have been issued yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(card => (
            <CardRow key={card.id} card={card} onClick={() => setSelected(card)} />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <CardDetailPanel
          card={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          updateLoading={updateLoading}
        />
      )}
    </div>
  );
}