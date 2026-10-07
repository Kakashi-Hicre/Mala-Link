'use client';
// Place at: app/admin/citizens/page.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import {
  Search, X, ChevronRight, User, Mail, Phone,
  Shield, ShieldCheck, Calendar, CreditCard,
  FolderOpen, AlertTriangle,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────
const timeAgo = iso => {
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000);
  if (days === 0)  return 'today';
  if (days === 1)  return 'yesterday';
  if (days < 30)   return `${days}d ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12)     return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
};

const fmtDate = iso =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const fmtType = t =>
  (t || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

// ── Skeleton row ──────────────────────────────────────────────
function CitizenRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#f1f5f9] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-[#f1f5f9] rounded" />
        <div className="h-3 w-1/2 bg-[#f1f5f9] rounded" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-5 w-16 bg-[#f1f5f9] rounded-full ml-auto" />
        <div className="h-3 w-20 bg-[#f1f5f9] rounded ml-auto" />
      </div>
    </div>
  );
}

// ── Citizen row card ──────────────────────────────────────────
function CitizenRow({ citizen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[#e2e8f0]
                 shadow-sm p-5 hover:shadow-md hover:border-[#cbd5e1]
                 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#f59e0b] flex items-center
                        justify-center text-[#0f172a] font-bold text-sm shrink-0">
          {citizen.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-[#0f172a] text-sm truncate">
              {citizen.fullName}
            </p>
            <Badge label={citizen.role} variant={citizen.role} />
          </div>
          <p className="text-xs text-[#64748b] truncate">{citizen.email}</p>
          {citizen.phone && (
            <p className="text-xs text-[#94a3b8]">{citizen.phone}</p>
          )}
        </div>

        {/* Right */}
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-xs font-bold text-[#0f172a]">
            {citizen._count?.applications || 0} app
            {citizen._count?.applications !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-[#94a3b8]">Joined {timeAgo(citizen.createdAt)}</p>
        </div>

        <ChevronRight
          size={16}
          className="text-[#94a3b8] group-hover:text-[#0f172a]
                     group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
        />
      </div>
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────
function CitizenPanel({ citizen, detail, detailLoading, onClose, onRoleChange, roleLoading }) {
  const [confirmRole, setConfirmRole] = useState(false);

  // Reset confirm when panel switches citizen
  useEffect(() => { setConfirmRole(false); }, [citizen?.id]);

  if (!citizen) return null;

  // Use detail.role when available (it's fresher after a role update)
  const currentRole = detail?.role ?? citizen.role;
  const isAdmin     = currentRole === 'ADMIN';
  const targetRole  = isAdmin ? 'CITIZEN' : 'ADMIN';

  const handleRoleClick = () => {
    if (!confirmRole) { setConfirmRole(true); return; }
    setConfirmRole(false);
    onRoleChange(citizen.id, targetRole);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white z-50
                   shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease both' }}
      >
        {/* ── Panel header ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5
                        bg-[#0f172a] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center
                            justify-center text-[#0f172a] font-bold shrink-0">
              {citizen.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{citizen.fullName}</p>
              <p className="text-[#64748b] text-xs">{citizen.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge label={currentRole} variant={currentRole} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center
                         text-[#94a3b8] hover:text-white hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {detailLoading ? (
            <div className="p-6 space-y-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-[#f1f5f9] rounded-2xl animate-pulse" />
              ))}
            </div>

          ) : !detail ? (
            <div className="flex items-center gap-3 m-6 bg-amber-50
                            border border-amber-200 rounded-xl p-4">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">Could not load citizen details.</p>
            </div>

          ) : (
            <>
              {/* Contact / meta strip */}
              <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#f1f5f9]
                              grid grid-cols-2 gap-3">
                {[
                  { icon: Mail,       value: detail.email },
                  { icon: Phone,      value: detail.phone    || '—' },
                  { icon: Calendar,   value: `Joined ${fmtDate(detail.createdAt)}` },
                  { icon: CreditCard, value: detail.nationalIdNo
                      ? `NID: ${detail.nationalIdNo}`
                      : 'No NID issued yet' },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-center gap-2">
                    <Icon size={13} className="text-[#94a3b8] shrink-0" />
                    <p className="text-xs text-[#64748b] truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Applications */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center
                                  justify-center shrink-0">
                    <FolderOpen size={11} className="text-[#f59e0b]" />
                  </div>
                  <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
                    Applications ({detail.applications?.length || 0})
                  </p>
                </div>

                {!detail.applications?.length ? (
                  <div className="bg-[#f8fafc] rounded-xl py-10 text-center">
                    <FolderOpen size={22} className="text-[#cbd5e1] mx-auto mb-2" />
                    <p className="text-sm text-[#94a3b8]">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.applications.map(app => (
                      <div
                        key={app.id}
                        className="flex items-center gap-3 bg-[#f8fafc]
                                   border border-[#f1f5f9] rounded-xl p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0f172a]">
                            {fmtType(app.type)}
                          </p>
                          <p className="text-xs text-[#94a3b8]">
                            {app.agency?.name} · {fmtDate(app.createdAt)}
                          </p>
                        </div>
                        <Badge label={app.status} variant={app.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer: role action ──────────────────────────── */}
        <div className="border-t border-[#f1f5f9] px-6 py-5 bg-white space-y-2">

          {/* Confirmation warning */}
          {confirmRole && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200
                            rounded-xl px-4 py-3">
              <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                {isAdmin
                  ? 'This will remove admin access and set the account back to a regular citizen. Click again to confirm.'
                  : 'This will grant full admin access to this account. Click again to confirm.'}
              </p>
            </div>
          )}

          <button
            onClick={handleRoleClick}
            disabled={roleLoading || detailLoading}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl
              text-sm font-bold transition-all disabled:opacity-50
              ${confirmRole
                ? isAdmin
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0]'}
            `}
          >
            {isAdmin
              ? <ShieldCheck size={15} />
              : <Shield size={15} />}
            {roleLoading
              ? 'Updating…'
              : confirmRole
                ? `Confirm: ${isAdmin ? 'Demote to Citizen' : 'Promote to Admin'}`
                : isAdmin ? 'Demote to Citizen' : 'Promote to Admin'}
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
export default function CitizensPage() {
  const [citizens,      setCitizens]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [roleFilter,    setRoleFilter]    = useState('');
  const [selected,      setSelected]      = useState(null);
  const [detail,        setDetail]        = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [roleLoading,   setRoleLoading]   = useState(false);

  const searchRef = useRef(null);

  // ── Load list ─────────────────────────────────────────────
  const load = useCallback(async (q, r) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.search = q;
      if (r) params.role   = r;
      const res = await adminAPI.getCitizens(params);
      setCitizens(res.data.data);
    } catch {
      toast.error('Failed to load citizens');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: re-load 350 ms after search or role filter changes
  useEffect(() => {
    const t = setTimeout(() => load(search, roleFilter), 350);
    return () => clearTimeout(t);
  }, [search, roleFilter, load]);

  // ── Open detail panel ─────────────────────────────────────
  const openPanel = async (citizen) => {
    setSelected(citizen);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await adminAPI.getCitizenById(citizen.id);
      setDetail(res.data.data);
    } catch {
      toast.error('Failed to load citizen details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closePanel = () => { setSelected(null); setDetail(null); };

  // ── Role update ───────────────────────────────────────────
  const handleRoleChange = async (citizenId, role) => {
    setRoleLoading(true);
    try {
      await adminAPI.updateCitizenRole(citizenId, { role });
      toast.success(`Role updated to ${role}`);
      // Refresh both the list and the open panel
      await load(search, roleFilter);
      const res = await adminAPI.getCitizenById(citizenId);
      setDetail(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setRoleLoading(false);
    }
  };

  // ── Counts for filter pills ───────────────────────────────
  const counts = {
    CITIZEN: citizens.filter(c => c.role === 'CITIZEN').length,
    ADMIN:   citizens.filter(c => c.role === 'ADMIN').length,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1.5">
          Admin Portal
        </p>
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Citizens</h1>
        <p className="text-sm text-[#64748b] mt-1">
          {loading ? '…' : `${citizens.length} result${citizens.length !== 1 ? 's' : ''}`}
          {search || roleFilter ? ' matching filters' : ' total'}
        </p>
      </div>

      {/* ── Search + role filter row ──────────────────────────── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
          />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#e2e8f0]
                       rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8]
                       focus:outline-none focus:border-[#f59e0b] transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-[#94a3b8] hover:text-[#0f172a] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role filter pills */}
        <div className="flex gap-1.5">
          {[
            { label: 'All',     value: '',         count: citizens.length },
            { label: 'Citizen', value: 'CITIZEN',  count: counts.CITIZEN },
            { label: 'Admin',   value: 'ADMIN',    count: counts.ADMIN },
          ].map(({ label, value, count }) => (
            <button
              key={value}
              onClick={() => setRoleFilter(value)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all border
                ${roleFilter === value
                  ? 'bg-[#0f172a] text-white border-[#0f172a]'
                  : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0f172a] hover:text-[#0f172a]'}
              `}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${roleFilter === value ? 'bg-white/20' : 'bg-[#f1f5f9]'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => <CitizenRowSkeleton key={i} />)}
        </div>

      ) : citizens.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] py-20 text-center">
          <User size={28} className="text-[#cbd5e1] mx-auto mb-3" />
          <p className="font-semibold text-[#64748b]">No citizens found</p>
          <p className="text-sm text-[#94a3b8] mt-1">
            {search || roleFilter
              ? 'Try adjusting your search or filter'
              : 'No citizens registered yet'}
          </p>
        </div>

      ) : (
        <div className="space-y-3">
          {citizens.map(c => (
            <CitizenRow key={c.id} citizen={c} onClick={() => openPanel(c)} />
          ))}
        </div>
      )}

      {/* ── Detail panel ─────────────────────────────────────── */}
      {selected && (
        <CitizenPanel
          citizen={selected}
          detail={detail}
          detailLoading={detailLoading}
          onClose={closePanel}
          onRoleChange={handleRoleChange}
          roleLoading={roleLoading}
        />
      )}
    </div>
  );
}