'use client';
// Place at: app/admin/staff/page.js

import { useState, useEffect, useCallback } from 'react';
import { adminAPI, agenciesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Plus, X, Mail, Lock, Building2, Trash2,
  Eye, EyeOff, AlertTriangle, UserCog, Search,
  Shield, CheckCircle,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────
const timeAgo = iso => {
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000);
  if (days === 0)  return 'today';
  if (days === 1)  return 'yesterday';
  if (days < 30)   return `${days}d ago`;
  const mo = Math.floor(days / 30);
  if (mo  < 12)   return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
};

// Display label for each agency enum value
const AGENCY_LABELS = {
  NRB:         'NRB',
  IMMIGRATION: 'Immigration',
  DRTSS:       'DRTSS',
};

// Accent colour per agency (matches Phase 2 overview cards)
const AGENCY_COLORS = {
  NRB:         { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  IMMIGRATION: { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  DRTSS:       { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
};

// ── Input helper ──────────────────────────────────────────────
const inputCls = `
  w-full px-4 py-3 bg-white border-2 border-[#e2e8f0] rounded-xl text-sm
  text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none
  focus:border-[#f59e0b] transition-colors font-[inherit]
`;

// ── Skeleton ──────────────────────────────────────────────────
function StaffRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5
                    flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#f1f5f9] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-[#f1f5f9] rounded" />
        <div className="h-3 w-1/2 bg-[#f1f5f9] rounded" />
      </div>
      <div className="h-6 w-24 bg-[#f1f5f9] rounded-full" />
      <div className="w-8 h-8 rounded-xl bg-[#f1f5f9]" />
    </div>
  );
}

// ── Staff row ─────────────────────────────────────────────────
function StaffRow({ staff, onDelete, deleteLoading }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const agencyName = staff.agency?.name;
  const clr        = AGENCY_COLORS[agencyName] || AGENCY_COLORS.NRB;
  const isDeleting = deleteLoading === staff.id;

  // Auto-reset confirm after 5 s
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 5000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const handleDeleteClick = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(staff.id);
  };

  return (
    <div className={`
      bg-white rounded-2xl border transition-all duration-200
      ${confirmDelete
        ? 'border-red-200 shadow-sm shadow-red-100'
        : 'border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#cbd5e1]'}
    `}>
      <div className="flex items-center gap-4 p-5">

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center
                     font-bold text-sm shrink-0"
          style={{ background: clr.dot + '22', color: clr.dot }}
        >
          {staff.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0f172a] text-sm truncate">
            {staff.fullName}
          </p>
          <p className="text-xs text-[#64748b] truncate">{staff.email}</p>
        </div>

        {/* Agency badge */}
        <div
          className="px-3 py-1 rounded-full text-xs font-bold shrink-0"
          style={{ background: clr.bg, color: clr.text }}
        >
          {AGENCY_LABELS[agencyName] || agencyName}
        </div>

        {/* Date */}
        <p className="text-xs text-[#94a3b8] shrink-0 hidden sm:block">
          Added {timeAgo(staff.createdAt)}
        </p>

        {/* Delete */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={`
            w-8 h-8 rounded-xl flex items-center justify-center shrink-0
            transition-all disabled:opacity-40
            ${confirmDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-[#f1f5f9] text-[#94a3b8] hover:bg-red-50 hover:text-red-500'}
          `}
          title={confirmDelete ? 'Click again to confirm deletion' : 'Remove staff member'}
        >
          {isDeleting
            ? <span className="w-3 h-3 border-2 border-white/40 border-t-white
                               rounded-full animate-spin" />
            : <Trash2 size={14} />}
        </button>
      </div>

      {/* Inline confirm banner */}
      {confirmDelete && (
        <div className="mx-5 mb-5 flex items-center justify-between gap-3
                        bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700 font-medium">
              Remove <strong>{staff.fullName}</strong> from{' '}
              {AGENCY_LABELS[agencyName]}? This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-red-400 hover:text-red-600 font-medium shrink-0"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ── Add staff panel ───────────────────────────────────────────
function AddStaffPanel({ agencies, onClose, onCreated }) {
  const [form, setForm]       = useState({
    fullName: '', email: '', password: '', agencyId: '',
  });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  // Lightweight client-side validation
  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName = 'Full name is required';
    if (!form.email.trim())     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)         e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.agencyId)         e.agencyId = 'Select an agency';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await adminAPI.createStaff({
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        password: form.password,
        agencyId: form.agencyId,
      });
      toast.success('Staff member created successfully!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff member');
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.fullName.trim() && form.email.trim() &&
    form.password.length >= 6 && form.agencyId;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-screen w-full max-w-md bg-white z-50
                   shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5
                        bg-[#0f172a] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center
                            justify-center shrink-0">
              <UserCog size={16} className="text-[#0f172a]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Add Staff Member</p>
              <p className="text-[#64748b] text-xs">
                Grant agency portal access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center
                       text-[#94a3b8] hover:text-white hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Full name */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-2">
              Full Name <span className="text-[#f59e0b]">*</span>
            </label>
            <input
              name="fullName" value={form.fullName} onChange={set}
              placeholder="e.g. James Phiri"
              className={inputCls}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1.5">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-2">
              Email Address <span className="text-[#f59e0b]">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                         text-[#94a3b8] pointer-events-none" />
              <input
                name="email" type="email" value={form.email} onChange={set}
                placeholder="staff@agency.mw"
                className={inputCls + ' pl-9'}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-2">
              Password <span className="text-[#f59e0b]">*</span>
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                         text-[#94a3b8] pointer-events-none" />
              <input
                name="password" type={showPw ? 'text' : 'password'}
                value={form.password} onChange={set}
                placeholder="Min. 6 characters"
                className={inputCls + ' pl-9 pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-[#94a3b8] hover:text-[#0f172a] transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>
            )}
            {form.password.length >= 6 && !errors.password && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                <CheckCircle size={11} /> Looks good
              </p>
            )}
          </div>

          {/* Agency */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-2">
              Agency <span className="text-[#f59e0b]">*</span>
            </label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                              text-[#94a3b8] pointer-events-none" />
              <select
                name="agencyId" value={form.agencyId} onChange={set}
                className={inputCls + ' pl-9 cursor-pointer'}
              >
                <option value="">Select agency…</option>
                {agencies.map(a => (
                  <option key={a.id} value={a.id}>
                    {AGENCY_LABELS[a.name] || a.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.agencyId && (
              <p className="text-xs text-red-500 mt-1.5">{errors.agencyId}</p>
            )}
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-[#f8fafc] border border-[#e2e8f0]
                          rounded-xl p-4">
            <Shield size={14} className="text-[#94a3b8] shrink-0 mt-0.5" />
            <p className="text-xs text-[#64748b] leading-relaxed">
              The staff member will be able to log in at{' '}
              <span className="font-semibold text-[#0f172a]">/staff/login</span>{' '}
              using these credentials and manage applications for their assigned agency.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#f1f5f9] px-6 py-5 bg-white">
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       text-sm font-bold transition-all disabled:opacity-40
                       bg-[#0f172a] text-white hover:bg-[#1e293b] disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                 rounded-full animate-spin" />
              : <UserCog size={15} />}
            {loading ? 'Creating…' : 'Create Staff Member'}
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
export default function StaffPage() {
  const [staff,         setStaff]         = useState([]);
  const [agencies,      setAgencies]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [agencyFilter,  setAgencyFilter]  = useState('');
  const [search,        setSearch]        = useState('');
  const [showAdd,       setShowAdd]       = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // ── Fetch staff list ──────────────────────────────────────
  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllStaff();
      setStaff(res.data.data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch agencies for filter pills + create form ─────────
  const loadAgencies = useCallback(async () => {
    try {
      const res = await agenciesAPI.getAll();
      setAgencies(res.data.data);
    } catch {
      // Fail silently — filter pills use staff data as fallback
    }
  }, []);

  useEffect(() => {
    loadStaff();
    loadAgencies();
  }, [loadStaff, loadAgencies]);

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (staffId) => {
    setDeleteLoading(staffId);
    try {
      await adminAPI.deleteStaff(staffId);
      toast.success('Staff member removed');
      // Remove from local state immediately (no reload needed)
      setStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove staff');
    } finally {
      setDeleteLoading(null);
    }
  };

  // ── Client-side filter (instant, no API call) ─────────────
  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || s.fullName.toLowerCase().includes(q)
      || s.email.toLowerCase().includes(q);
    const matchAgency = !agencyFilter || s.agency?.name === agencyFilter;
    return matchSearch && matchAgency;
  });

  // Unique agencies present in the loaded staff list
  const presentAgencies = [...new Set(staff.map(s => s.agency?.name).filter(Boolean))];

  // Per-agency counts for filter pills
  const agencyCounts = staff.reduce((acc, s) => {
    const n = s.agency?.name;
    if (n) acc[n] = (acc[n] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1.5">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Agency Staff
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            {loading ? '…' : `${filtered.length} staff member${filtered.length !== 1 ? 's' : ''}`}
            {agencyFilter || search ? ' matching filters' : ' total'}
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#f59e0b] text-[#0f172a]
                     rounded-xl text-sm font-bold hover:bg-[#fbbf24] transition-colors"
        >
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* ── Search + agency filter ────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                       text-[#94a3b8] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#e2e8f0]
                       rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8]
                       focus:outline-none focus:border-[#f59e0b] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-[#94a3b8] hover:text-[#0f172a] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Agency filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: 'All agencies', value: '', count: staff.length },
            ...presentAgencies.map(name => ({
              label: AGENCY_LABELS[name] || name,
              value: name,
              count: agencyCounts[name] || 0,
            })),
          ].map(({ label, value, count }) => (
            <button
              key={value}
              onClick={() => setAgencyFilter(value)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all border
                ${agencyFilter === value
                  ? 'bg-[#0f172a] text-white border-[#0f172a]'
                  : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0f172a] hover:text-[#0f172a]'}
              `}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${agencyFilter === value ? 'bg-white/20' : 'bg-[#f1f5f9]'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Staff list ────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <StaffRowSkeleton key={i} />)}
        </div>

      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] py-20 text-center">
          <UserCog size={28} className="text-[#cbd5e1] mx-auto mb-3" />
          <p className="font-semibold text-[#64748b]">No staff members found</p>
          <p className="text-sm text-[#94a3b8] mt-1">
            {search || agencyFilter
              ? 'Try adjusting your filters'
              : 'Add your first staff member to get started'}
          </p>
          {!search && !agencyFilter && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5
                         bg-[#f59e0b] text-[#0f172a] rounded-xl text-sm font-bold
                         hover:bg-[#fbbf24] transition-colors"
            >
              <Plus size={14} /> Add First Staff Member
            </button>
          )}
        </div>

      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <StaffRow
              key={s.id}
              staff={s}
              onDelete={handleDelete}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      )}

      {/* ── Add staff panel ───────────────────────────────────── */}
      {showAdd && (
        <AddStaffPanel
          agencies={agencies}
          onClose={() => setShowAdd(false)}
          onCreated={loadStaff}
        />
      )}
    </div>
  );
}