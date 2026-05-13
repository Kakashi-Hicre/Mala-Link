'use client';
import { useEffect, useState } from 'react';
import { applicationsAPI, idcardsAPI } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  LogOut, Shield, X, ChevronRight,
  User, MapPin, Phone, Mail, FileText,
  CreditCard, CheckCircle, AlertTriangle,
  Clock, Printer, Package, Heart,
} from 'lucide-react';

const STATUSES = ['', 'PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED'];

const statusIcon = {
  PENDING:    Clock,
  PROCESSING: FileText,
  PRINTING:   Printer,
  READY:      Package,
  COLLECTED:  CheckCircle,
  REJECTED:   AlertTriangle,
};

// ── Detail panel ──────────────────────────────────────────
function DetailPanel({ app, onClose, onAction, actionLoading }) {
  const [formData, setFormData]     = useState(null);
  const [formLoading, setFormLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    if (!app) return;
    setFormLoading(true);
    applicationsAPI.getForm(app.id)
      .then(res => setFormData(res.data.data))
      .catch(() => setFormData(null))
      .finally(() => setFormLoading(false));
  }, [app?.id]);

  if (!app) return null;

  // ── Field mapping matches the citizen ApplyPage form exactly ──
  const personalFields = formData ? [
    { label: 'Full Name',        value: formData.fullName },
    { label: 'Date of Birth',    value: formData.dateOfBirth },
    { label: 'Sex',              value: formData.sex },
    { label: 'Place of Birth',   value: formData.placeOfBirth },
    { label: 'Nationality',      value: formData.nationality || 'Malawian' },
  ] : [];

  const contactFields = formData ? [
    { label: 'Phone',            value: formData.phone },
    { label: 'Email',            value: formData.email || '—' },
    { label: 'District',         value: formData.district },
    { label: 'Physical Address', value: formData.physicalAddress },
  ] : [];

  const kinFields = formData ? [
    { label: 'Full Name',        value: formData.nextOfKinName },
    { label: 'Phone',            value: formData.nextOfKinPhone },
    { label: 'Relationship',     value: formData.nextOfKinRelation },
  ] : [];

  // Conditional fields based on service type
  const conditionalFields = formData ? [
    ...(formData.existingLicenceNo  ? [{ label: 'Existing Licence No.',   value: formData.existingLicenceNo }]  : []),
    ...(formData.previousPassportNo ? [{ label: 'Previous Passport No.',  value: formData.previousPassportNo }] : []),
  ] : [];

  const sections = [
    { title: 'Personal Information', icon: User,    fields: personalFields },
    { title: 'Contact & Address',    icon: Phone,   fields: contactFields },
    { title: 'Next of Kin',          icon: Heart,   fields: kinFields },
    ...(conditionalFields.length > 0
      ? [{ title: 'Additional Details', icon: FileText, fields: conditionalFields }]
      : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}/>

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease both' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9] bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center justify-center">
              <FileText size={16} className="text-[#0f172a]"/>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{app.type.replace(/_/g, ' ')}</p>
              <p className="text-[#94a3b8] text-xs">{app.citizen?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge label={app.status} variant={app.status}/>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/20 transition-colors"
            >
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* Citizen contact strip */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#f1f5f9] grid grid-cols-3 gap-3">
          {[
            { icon: User,  value: app.citizen?.fullName },
            { icon: Mail,  value: app.citizen?.email },
            { icon: Phone, value: app.citizen?.phone },
          ].map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-2">
              <Icon size={13} className="text-[#94a3b8] shrink-0"/>
              <p className="text-xs text-[#64748b] truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Applied date */}
          <div className="px-6 pt-5 pb-2">
            <p className="text-xs text-[#94a3b8]">
              Applied:{' '}
              <strong className="text-[#64748b]">
                {new Date(app.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </strong>
            </p>
          </div>

          {/* Form details */}
          <div className="px-6 pb-4">
            {formLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-[#f1f5f9] rounded-xl h-14 animate-pulse"/>
                ))}
              </div>
            ) : !formData ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={16} className="text-amber-500 shrink-0"/>
                <p className="text-sm text-amber-700">No application form submitted yet by the citizen.</p>
              </div>
            ) : (
              <>
                {sections.map(({ title, icon: Icon, fields }) => (
                  <div key={title} className="mb-5">
                    {/* Section heading */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center">
                        <Icon size={11} className="text-[#f59e0b]"/>
                      </div>
                      <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">{title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {fields.map(({ label, value }) => (
                        <div key={label} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3">
                          <p className="text-xs text-[#006aff] font-medium mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-[#0f172a] wrap-break-word">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Verification status */}
                {formData.verifiedAt ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <CheckCircle size={14} className="text-emerald-600"/>
                    <p className="text-xs text-emerald-700 font-medium">
                      Form verified on {new Date(formData.verifiedAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertTriangle size={14} className="text-amber-600"/>
                    <p className="text-xs text-amber-700 font-medium">Form not yet verified by staff</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Documents */}
          {app.documents?.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center">
                  <FileText size={11} className="text-[#f59e0b]"/>
                </div>
                <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
                  Uploaded Documents ({app.documents.length})
                </p>
              </div>
              <div className="space-y-2">
                {app.documents.map(doc => (
                  <a
                    key={doc.id}
                    href={`http://localhost:3000${doc.fileUrl}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3 hover:border-[#f59e0b] transition-colors group"
                  >
                    <FileText size={14} className="text-[#64748b] shrink-0"/>
                    <p className="text-sm text-[#0f172a] flex-1 truncate">{doc.fileName}</p>
                    <ChevronRight size={14} className="text-[#94a3b8] group-hover:text-[#f59e0b] transition-colors"/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ID Card info */}
          {app.idCard && (
            <div className="px-6 pb-4">
              <div className="bg-[#0f172a] rounded-2xl p-5 flex items-center gap-4">
                <CreditCard size={24} className="text-[#f59e0b] shrink-0"/>
                <div>
                  <p className="text-[#94a3b8] text-xs mb-1">Card Number</p>
                  <p className="text-[#f59e0b] font-black text-lg tracking-wider font-mono">
                    {app.idCard.cardNumber}
                  </p>
                  <p className="text-[#475569] text-xs mt-0.5">
                    Issued: {new Date(app.idCard.issuedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="border-t border-[#f1f5f9] px-6 py-5 bg-white space-y-3">
          {/* Verify form button */}
          {formData && !formData.verifiedAt && (
            <Button
              variant="outline" size="md" fullWidth
              onClick={() => onAction('verify', app.id)}
              loading={actionLoading === `verify-${app.id}`}
            >
              <CheckCircle size={15}/> Verify Application Form
            </Button>
          )}

          {/* Status progression buttons */}
          <div className="flex gap-2 flex-wrap">
            {app.status === 'PENDING' && (
              <Button variant="primary" size="md" className="flex-1"
                loading={actionLoading === `status-${app.id}`}
                onClick={() => onAction('status', app.id, 'PROCESSING')}>
                Start Processing
              </Button>
            )}
            {app.status === 'PROCESSING' && (
              <Button variant="primary" size="md" className="flex-1"
                loading={actionLoading === `status-${app.id}`}
                onClick={() => onAction('status', app.id, 'PRINTING')}>
                <Printer size={15}/> Send to Print
              </Button>
            )}
            {app.status === 'PRINTING' && (
              <Button variant="success" size="md" className="flex-1"
                loading={actionLoading === `status-${app.id}`}
                onClick={() => onAction('status', app.id, 'READY')}>
                <Package size={15}/> Mark Ready
              </Button>
            )}
            {app.status === 'READY' && !app.idCard && (
              <Button variant="gold" size="md" className="flex-1"
                loading={actionLoading === `issue-${app.id}`}
                onClick={() => onAction('issue', app.id)}>
                <CreditCard size={15}/> Issue Card
              </Button>
            )}
            {app.status === 'READY' && app.idCard && (
              <Button variant="primary" size="md" className="flex-1"
                loading={actionLoading === `collect-${app.id}`}
                onClick={() => onAction('collect', app.id)}>
                <CheckCircle size={15}/> Mark Collected
              </Button>
            )}

            {/* Reject — available except terminal states */}
            {!['COLLECTED', 'REJECTED'].includes(app.status) && (
              <Button variant="danger" size="md" onClick={() => setShowReject(r => !r)}>
                Reject
              </Button>
            )}
          </div>

          {/* Reject note input */}
          {showReject && (
            <div className="space-y-2 pt-1">
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Reason for rejection (shown to citizen)..."
                rows={2}
                className="w-full border border-red-200 bg-red-50 rounded-xl px-4 py-3 text-sm text-[#0f172a] resize-none focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-red-300"
              />
              <Button
                variant="danger" size="md" fullWidth
                loading={actionLoading === `status-${app.id}`}
                onClick={() => onAction('status', app.id, 'REJECTED', rejectNote)}
              >
                Confirm Rejection
              </Button>
            </div>
          )}
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

// ── Application row ───────────────────────────────────────
function AppRow({ app, onClick }) {
  const StatusIcon = statusIcon[app.status] || Clock;
  const statusColors = {
    PENDING:    'bg-amber-50   border-amber-200',
    PROCESSING: 'bg-blue-50    border-blue-200',
    PRINTING:   'bg-purple-50  border-purple-200',
    READY:      'bg-emerald-50 border-emerald-200',
    COLLECTED:  'bg-slate-50   border-slate-200',
    REJECTED:   'bg-red-50     border-red-200',
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 hover:shadow-md hover:border-[#cbd5e1] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${statusColors[app.status]}`}>
            <StatusIcon size={18} className={
              app.status === 'READY'      ? 'text-emerald-600' :
              app.status === 'REJECTED'   ? 'text-red-500' :
              app.status === 'COLLECTED'  ? 'text-slate-500' :
              app.status === 'PRINTING'   ? 'text-purple-600' :
              app.status === 'PROCESSING' ? 'text-blue-600' : 'text-amber-600'
            }/>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-[#0f172a] text-sm">{app.type.replace(/_/g, ' ')}</p>
              <Badge label={app.status} variant={app.status}/>
            </div>
            <p className="text-sm text-[#64748b] font-medium">{app.citizen?.fullName}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{app.citizen?.phone} · {app.citizen?.email}</p>
            <p className="text-xs text-[#94a3b8] mt-1">
              {new Date(app.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
            {app.idCard && (
              <p className="text-xs font-mono font-bold text-[#f59e0b] mt-1 tracking-wide">
                🪪 {app.idCard.cardNumber}
              </p>
            )}
          </div>
        </div>

        <ChevronRight size={16} className="text-[#94a3b8] group-hover:text-[#0f172a] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"/>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function StaffApplicationsPage() {
  const router                            = useRouter();
  const [applications, setApplications]   = useState([]);
  const [filterStatus, setFilterStatus]   = useState('');
  const [loading, setLoading]             = useState(true);
  const [user, setUser]                   = useState(null);
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (!stored) { router.push('/staff/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  useEffect(() => { load(); }, [filterStatus]);

  const load = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res    = await applicationsAPI.getAgencyAll(params);
      setApplications(res.data.data);
      if (selected) {
        const refreshed = res.data.data.find(a => a.id === selected.id);
        if (refreshed) setSelected(refreshed);
      }
    } catch { toast.error('Failed to load applications'); }
    finally  { setLoading(false); }
  };

  const handleAction = async (type, appId, status, notes) => {
    const key = `${type}-${appId}`;
    setActionLoading(key);
    try {
      if (type === 'status') {
        await applicationsAPI.updateStatus(appId, { status, notes });
        toast.success(`Status updated to ${status}`);
      } else if (type === 'issue') {
        await idcardsAPI.issue(appId);
        toast.success('ID Card issued!');
      } else if (type === 'collect') {
        await idcardsAPI.markAsCollected(appId);
        toast.success('Marked as collected');
      } else if (type === 'verify') {
        await applicationsAPI.verifyForm(appId, { isVerified: true });
        toast.success('Form verified');
      }
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    Cookies.remove('token'); Cookies.remove('user');
    router.push('/staff/login');
  };

  const counts = STATUSES.filter(Boolean).reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Topbar */}
      <header className="bg-[#0f172a] border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f59e0b] rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-[#0f172a]"/>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Mala-Link Staff</p>
            <p className="text-[#64748b] text-xs">{user?.fullName} · {user?.agency}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/staff/idcards')}
            className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] text-[#0f172a] rounded-lg text-xs font-bold hover:bg-[#fbbf24] transition-colors"
          >
            <CreditCard size={13}/> Create Manual Card
          </button>
          <Button variant="ghost" size="sm" onClick={logout}
            className="text-[#64748b] hover:text-white hover:bg-white/10">
            <LogOut size={14}/> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'All', value: '' },
            ...STATUSES.filter(Boolean).map(s => ({ label: s, value: s })),
          ].map(({ label, value }) => (
            <button key={value} onClick={() => setFilterStatus(value)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                ${filterStatus === value
                  ? 'bg-[#0f172a] text-white border-[#0f172a]'
                  : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0f172a] hover:text-[#0f172a]'}
              `}>
              {label}
              {value && counts[value] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  filterStatus === value ? 'bg-white/20' : 'bg-[#f1f5f9]'
                }`}>
                  {counts[value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a]">Applications</h1>
            <p className="text-sm text-[#64748b]">{applications.length} total</p>
          </div>
          <button onClick={load}
            className="text-xs text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">
            ↻ Refresh
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] h-24 animate-pulse"/>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="text-center py-20">
            <p className="text-[#64748b] font-medium">No applications found</p>
            <p className="text-sm text-[#94a3b8] mt-1">
              {filterStatus ? `No ${filterStatus} applications` : 'All clear!'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <AppRow key={app.id} app={app} onClick={() => setSelected(app)}/>
            ))}
          </div>
        )}
      </main>

      {/* Slide-out detail panel */}
      {selected && (
        <DetailPanel
          app={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}