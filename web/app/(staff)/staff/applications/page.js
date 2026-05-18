'use client';
import { useEffect, useState } from 'react';
import { applicationsAPI, formsAPI, idcardsAPI } from '@/lib/api';
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
  Clock, Printer, Package, Users, Home, Car, Globe,
  Camera, Upload, Eye, Fingerprint, PenLine,
  Stethoscope, FileCheck, ImageIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Document config — mirrors exactly what documents/page.js sends
// ─────────────────────────────────────────────────────────────
const DOC_CONFIG = {
  PASSPORT_PHOTO: {
    label:       'Passport Photo',
    description: 'Clear face photo against a plain background.',
    icon:        Camera,
    required:    true,
    isImage:     true,
  },
  BIRTH_CERTIFICATE: {
    label:       'Birth Certificate',
    description: 'Scanned or photographed birth certificate.',
    icon:        FileCheck,
    required:    true,
    isImage:     false,
  },
  SUPPORTING_DOC: {
    label:       'Supporting Document',
    description: 'Voter ID, village head letter, or other supporting doc.',
    icon:        FileText,
    required:    false,
    isImage:     false,
  },
  NATIONAL_ID_SCAN: {
    label:       'National ID (Both Sides)',
    description: 'Front and back of Malawi National ID.',
    icon:        CreditCard,
    required:    true,
    isImage:     true,
  },
  FINGERPRINT: {
    label:       'Fingerprint',
    description: 'Scanned fingerprint image.',
    icon:        Fingerprint,
    required:    true,
    isImage:     true,
  },
  DIGITAL_SIGNATURE: {
    label:       'Digital Signature',
    description: 'Photographed or scanned signature.',
    icon:        PenLine,
    required:    true,
    isImage:     true,
  },
  MEDICAL_CERTIFICATE: {
    label:       'Medical Certificate (DL3)',
    description: 'Form DL3 signed by a registered doctor.',
    icon:        Stethoscope,
    required:    true,
    isImage:     false,
  },
};

// Which types are required per service — mirrors documents/page.js SERVICE_DOCS
const SERVICE_DOCS = {
  NATIONAL_ID:     ['PASSPORT_PHOTO', 'BIRTH_CERTIFICATE', 'SUPPORTING_DOC'],
  PASSPORT:        ['PASSPORT_PHOTO', 'NATIONAL_ID_SCAN', 'FINGERPRINT', 'DIGITAL_SIGNATURE'],
  DRIVING_LICENCE: ['PASSPORT_PHOTO', 'NATIONAL_ID_SCAN', 'MEDICAL_CERTIFICATE'],
};

const STATUSES = ['', 'PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED'];

const statusIcon = {
  PENDING:    Clock,
  PROCESSING: FileText,
  PRINTING:   Printer,
  READY:      Package,
  COLLECTED:  CheckCircle,
  REJECTED:   AlertTriangle,
};

// ── Helpers ───────────────────────────────────────────────
async function fetchFormByType(appId, type) {
  if (type === 'NATIONAL_ID')     return formsAPI.getNrb(appId);
  if (type === 'PASSPORT')        return formsAPI.getImmigration(appId);
  if (type === 'DRIVING_LICENCE') return formsAPI.getDrtss(appId);
  throw new Error(`Unknown type: ${type}`);
}

async function verifyFormByType(appId, type, data) {
  if (type === 'NATIONAL_ID')     return formsAPI.verifyNrb(appId, data);
  if (type === 'PASSPORT')        return formsAPI.verifyImmigration(appId, data);
  if (type === 'DRIVING_LICENCE') return formsAPI.verifyDrtss(appId, data);
  throw new Error(`Unknown type: ${type}`);
}

function buildSections(type, formData) {
  if (!formData) return [];

  if (type === 'NATIONAL_ID') {
    return [
      { title: 'Full Name', icon: User, fields: [
        { label: 'First Name',  value: formData.firstName },
        { label: 'Other Names', value: formData.otherNames },
        { label: 'Surname',     value: formData.surname },
      ]},
      { title: 'Personal Details', icon: User, fields: [
        { label: 'Date of Birth',            value: formData.dateOfBirth },
        { label: 'Sex',                      value: formData.sex },
        { label: 'Marital Status',           value: formData.maritalStatus },
        { label: 'Nationality',              value: formData.nationality },
        { label: 'Second Nationality',       value: formData.secondNationality },
        { label: 'Colour of Eyes',           value: formData.colourOfEyes },
        { label: 'Height (m)',               value: formData.heightMeters },
        { label: 'Phone',                    value: formData.phone },
        { label: 'Birth Certificate No.',    value: formData.birthCertNo },
        { label: 'Passport No.',             value: formData.passportNo },
        { label: 'Disability / Observation', value: formData.disability },
      ]},
      { title: 'Place of Birth', icon: MapPin, fields: [
        { label: 'District', value: formData.birthDistrict },
        { label: 'T/A',      value: formData.birthTA },
        { label: 'Village',  value: formData.birthVillage },
      ]},
      { title: 'Residential Address', icon: Home, fields: [
        { label: 'District',       value: formData.residentialDistrict },
        { label: 'T/A',           value: formData.residentialTA },
        { label: 'Village / Area', value: formData.residentialVillage },
      ]},
      { title: 'Permanent Original Home', icon: Home, fields: [
        { label: 'District', value: formData.permanentDistrict },
        { label: 'T/A',      value: formData.permanentTA },
        { label: 'Village',  value: formData.permanentVillage },
      ]},
      { title: "Mother's Details", icon: Users, fields: [
        { label: 'Full Name',       value: formData.motherFullName },
        { label: 'Nationality',     value: formData.motherNationality },
        { label: 'National ID No.', value: formData.motherIdNo },
        { label: 'District',        value: formData.motherDistrict },
        { label: 'T/A',            value: formData.motherTA },
        { label: 'Village',         value: formData.motherVillage },
      ]},
      { title: "Father's Details", icon: Users, fields: [
        { label: 'Full Name',       value: formData.fatherFullName },
        { label: 'Nationality',     value: formData.fatherNationality },
        { label: 'National ID No.', value: formData.fatherIdNo },
        { label: 'District',        value: formData.fatherDistrict },
        { label: 'T/A',            value: formData.fatherTA },
        { label: 'Village',         value: formData.fatherVillage },
      ]},
    ];
  }

  if (type === 'PASSPORT') {
    return [
      { title: 'Full Name', icon: User, fields: [
        { label: 'Surname',     value: formData.surname },
        { label: 'Given Names', value: formData.givenNames },
        { label: 'Maiden Name', value: formData.maidenName },
      ]},
      { title: 'Personal Details', icon: Globe, fields: [
        { label: 'Date of Birth',   value: formData.dateOfBirth },
        { label: 'Place of Birth',  value: formData.placeOfBirth },
        { label: 'Sex',             value: formData.sex },
        { label: 'Nationality',     value: formData.nationality },
        { label: 'Occupation',      value: formData.occupation },
        { label: 'National ID No.', value: formData.nationalIdNo },
        { label: 'Height (m)',      value: formData.heightMeters },
        { label: 'Eye Colour',      value: formData.eyeColour },
      ]},
      { title: 'Contact & Renewal', icon: Phone, fields: [
        { label: 'Permanent Address',     value: formData.permanentAddress },
        { label: 'Phone',                 value: formData.phone },
        { label: 'Email',                 value: formData.email },
        { label: 'Previous Passport No.', value: formData.previousPassportNo },
      ]},
    ];
  }

  if (type === 'DRIVING_LICENCE') {
    return [
      { title: 'Personal Details', icon: User, fields: [
        { label: 'Full Name',       value: formData.fullName },
        { label: 'Date of Birth',   value: formData.dateOfBirth },
        { label: 'Sex',             value: formData.sex },
        { label: 'Nationality',     value: formData.nationality },
        { label: 'National ID No.', value: formData.nationalIdNo },
      ]},
      { title: 'Contact & Address', icon: MapPin, fields: [
        { label: 'Residential Address', value: formData.residentialAddress },
        { label: 'Phone',               value: formData.phone },
      ]},
      { title: 'Licence Details', icon: Car, fields: [
        {
          label: 'Categories Applied',
          value: Array.isArray(formData.licenceCategories)
            ? formData.licenceCategories.join(', ')
            : formData.licenceCategories,
        },
        { label: 'Existing Licence No.', value: formData.existingLicenceNo },
      ]},
    ];
  }

  return [];
}

// ── Image thumbnail preview modal ─────────────────────────
function ImagePreviewModal({ url, label, onClose }) {
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
      onClick={onClose}
    >
      <div
        style={{ background:'#0f172a', borderRadius:20, overflow:'hidden', maxWidth:680, width:'100%', boxShadow:'0 40px 100px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color:'white', fontWeight:700, fontSize:14 }}>{label}</p>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} color="#94a3b8"/>
          </button>
        </div>
        <div style={{ padding:16 }}>
          <img
            src={url} alt={label}
            style={{ width:'100%', maxHeight:520, objectFit:'contain', borderRadius:12, background:'#1e293b' }}
          />
        </div>
        <div style={{ padding:'0 16px 16px', display:'flex', justifyContent:'flex-end' }}>
          <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'#f59e0b', border:'none', color:'#0f172a', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              <Eye size={12}/> Open Full Size
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Documents section (the upgraded one) ─────────────────
function DocumentsSection({ app, documents }) {
  const [preview, setPreview] = useState(null); // { url, label }

  const docTypes    = SERVICE_DOCS[app.type] ?? [];
  const requiredTypes = docTypes.filter(t => DOC_CONFIG[t]?.required);

  // Latest upload keyed by documentType
  const uploadedMap = documents.reduce((acc, doc) => {
    if (!acc[doc.documentType]) acc[doc.documentType] = doc;
    return acc;
  }, {});

  const doneCount = requiredTypes.filter(t => uploadedMap[t]).length;
  const allDone   = doneCount === requiredTypes.length;

  // Any extra docs the citizen uploaded outside the expected list
  const extraDocs = documents.filter(d => !docTypes.includes(d.documentType));

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

  return (
    <>
      {/* Progress bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        background: allDone ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${allDone ? '#bbf7d0' : '#fde68a'}`,
        borderRadius:10, padding:'10px 14px', marginBottom:14,
      }}>
        {allDone
          ? <CheckCircle size={13} color="#22c55e"/>
          : <AlertTriangle size={13} color="#d97706"/>
        }
        <div style={{ flex:1 }}>
          <p style={{ fontSize:11, fontWeight:700, color: allDone ? '#166534' : '#92400e', marginBottom:4 }}>
            {allDone ? 'All required documents uploaded' : `${requiredTypes.length - doneCount} required document(s) still missing`}
          </p>
          <div style={{ height:4, background: allDone ? '#bbf7d0' : '#fde68a', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:99,
              width:`${requiredTypes.length ? Math.round((doneCount/requiredTypes.length)*100) : 0}%`,
              background: allDone ? '#22c55e' : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
              transition:'width 0.4s',
            }}/>
          </div>
        </div>
        <p style={{ fontSize:12, fontWeight:800, color: allDone ? '#22c55e' : '#d97706', whiteSpace:'nowrap' }}>
          {doneCount} / {requiredTypes.length}
        </p>
      </div>

      {/* Checklist — always visible even when nothing uploaded */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: extraDocs.length ? 18 : 0 }}>
        {docTypes.map(docType => {
          const cfg      = DOC_CONFIG[docType];
          const Icon     = cfg?.icon ?? FileText;
          const uploaded = uploadedMap[docType];
          const isImage  = cfg?.isImage;
          const fileUrl  = uploaded ? `${BASE_URL}${uploaded.fileUrl}` : null;
          const isMissing = !uploaded && cfg?.required;

          return (
            <div
              key={docType}
              style={{
                background:'white', borderRadius:14,
                border:`1.5px solid ${uploaded ? '#bbf7d0' : isMissing ? '#fecaca' : '#e2e8f0'}`,
                overflow:'hidden',
              }}
            >
              {/* Row */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' }}>

                {/* Icon / thumbnail */}
                {uploaded && isImage && fileUrl ? (
                  <button
                    onClick={() => setPreview({ url: fileUrl, label: cfg.label })}
                    style={{
                      width:44, height:44, borderRadius:10, overflow:'hidden',
                      border:'2px solid #bbf7d0', flexShrink:0,
                      cursor:'pointer', padding:0, background:'#f0fdf4',
                      position:'relative',
                    }}
                    title="Click to preview"
                  >
                    <img
                      src={fileUrl} alt={cfg.label}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { e.target.style.display='none'; }}
                    />
                    <div style={{ position:'absolute', bottom:2, right:2, background:'rgba(0,0,0,0.55)', borderRadius:4, padding:'1px 4px' }}>
                      <Eye size={8} color="white"/>
                    </div>
                  </button>
                ) : (
                  <div style={{
                    width:44, height:44, borderRadius:10, flexShrink:0,
                    background: uploaded ? '#f0fdf4' : isMissing ? '#fef2f2' : '#f8fafc',
                    border: `1.5px solid ${uploaded ? '#bbf7d0' : isMissing ? '#fecaca' : '#e2e8f0'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon size={18} color={uploaded ? '#22c55e' : isMissing ? '#ef4444' : '#94a3b8'}/>
                  </div>
                )}

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:2 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{cfg?.label ?? docType.replace(/_/g,' ')}</p>

                    {/* Required / Optional badge */}
                    {cfg?.required
                      ? <span style={{ fontSize:9, fontWeight:800, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:4, padding:'1px 5px', letterSpacing:'0.05em' }}>REQUIRED</span>
                      : <span style={{ fontSize:9, fontWeight:800, color:'#64748b', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:4, padding:'1px 5px', letterSpacing:'0.05em' }}>OPTIONAL</span>
                    }

                    {/* Capture method badge — only when uploaded */}
                    {uploaded && (
                      <span style={{
                        fontSize:9, fontWeight:800, letterSpacing:'0.05em',
                        padding:'1px 6px', borderRadius:4,
                        background: uploaded.captureMethod === 'WEBCAM' ? '#eff6ff' : '#f0fdf4',
                        border:     uploaded.captureMethod === 'WEBCAM' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                        color:      uploaded.captureMethod === 'WEBCAM' ? '#2563eb' : '#166534',
                        display:'flex', alignItems:'center', gap:3,
                      }}>
                        {uploaded.captureMethod === 'WEBCAM'
                          ? <><Camera size={8}/> WEBCAM</>
                          : <><Upload size={8}/> UPLOAD</>
                        }
                      </span>
                    )}
                  </div>

                  {/* File name or missing message */}
                  {uploaded ? (
                    <p style={{ fontSize:11, color:'#166534', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {uploaded.fileName}
                    </p>
                  ) : (
                    <p style={{ fontSize:11, color: isMissing ? '#ef4444' : '#94a3b8' }}>
                      {isMissing ? 'Not yet uploaded by citizen' : 'Not uploaded (optional)'}
                    </p>
                  )}
                </div>

                {/* Right side: status icon + view link */}
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  {uploaded ? (
                    <>
                      <CheckCircle size={16} color="#22c55e"/>
                      <a href={fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                        <button style={{
                          padding:'5px 10px', borderRadius:8, border:'1px solid #bbf7d0',
                          background:'white', cursor:'pointer', fontFamily:'inherit',
                          display:'flex', alignItems:'center', gap:4,
                          fontSize:11, fontWeight:700, color:'#166534',
                        }}>
                          <Eye size={11}/> View
                        </button>
                      </a>
                    </>
                  ) : (
                    <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${isMissing ? '#fecaca' : '#e2e8f0'}`, background: isMissing ? '#fef2f2' : '#f8fafc' }}/>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra / unexpected documents */}
      {extraDocs.length > 0 && (
        <div>
          <p style={{ fontSize:10, fontWeight:800, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
            Other Uploads ({extraDocs.length})
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {extraDocs.map(doc => {
              const fileUrl = `${BASE_URL}${doc.fileUrl}`;
              return (
                <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:10, background:'#f8fafc', border:'1px solid #f1f5f9', borderRadius:12, padding:'10px 13px' }}>
                  <FileText size={13} color="#64748b" style={{ flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {doc.fileName}
                    </p>
                    <p style={{ fontSize:10, color:'#94a3b8' }}>
                      {DOC_CONFIG[doc.documentType]?.label ?? doc.documentType?.replace(/_/g,' ')} ·{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  {/* Capture method */}
                  <span style={{
                    fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, letterSpacing:'0.05em',
                    background: doc.captureMethod === 'WEBCAM' ? '#eff6ff' : '#f0fdf4',
                    border:     doc.captureMethod === 'WEBCAM' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                    color:      doc.captureMethod === 'WEBCAM' ? '#2563eb' : '#166534',
                    display:'flex', alignItems:'center', gap:3, flexShrink:0,
                  }}>
                    {doc.captureMethod === 'WEBCAM' ? <><Camera size={8}/> WEBCAM</> : <><Upload size={8}/> UPLOAD</>}
                  </span>
                  <a href={fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                    <button style={{ padding:'5px 9px', border:'1px solid #e2e8f0', borderRadius:7, background:'white', cursor:'pointer', fontSize:11, color:'#64748b', fontWeight:600, fontFamily:'inherit', display:'flex', alignItems:'center', gap:3 }}>
                      <Eye size={11}/> View
                    </button>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {preview && (
        <ImagePreviewModal url={preview.url} label={preview.label} onClose={() => setPreview(null)}/>
      )}
    </>
  );
}

// ── Detail panel ──────────────────────────────────────────
function DetailPanel({ app, onClose, onAction, actionLoading }) {
  const [formData,    setFormData]    = useState(null);
  const [formLoading, setFormLoading] = useState(true);
  const [documents,   setDocuments]   = useState([]);
  const [rejectNote,  setRejectNote]  = useState('');
  const [showReject,  setShowReject]  = useState(false);

  useEffect(() => {
    if (!app) return;
    setFormData(null);
    setFormLoading(true);
    setDocuments([]);

    // Fetch form data
    fetchFormByType(app.id, app.type)
      .then(res => setFormData(res.data.data))
      .catch(() => setFormData(null))
      .finally(() => setFormLoading(false));

    // Documents come from the application include — use those directly
    // (the parent already loads them via getAgencyAll with include)
    if (app.documents) setDocuments(app.documents);
  }, [app?.id]);

  if (!app) return null;

  const sections = buildSections(app.type, formData);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}/>

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
        style={{ animation:'slideIn 0.25s ease both' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9] bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center justify-center">
              <FileText size={16} className="text-[#0f172a]"/>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{app.type.replace(/_/g,' ')}</p>
              <p className="text-[#94a3b8] text-xs">#{app.id.slice(0,8).toUpperCase()}</p>
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
              <p className="text-xs text-[#64748b] truncate">{value || '—'}</p>
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
                  day:'numeric', month:'long', year:'numeric',
                })}
              </strong>
            </p>
          </div>

          {/* ── Application Form data ── */}
          <div className="px-6 pb-4">
            {formLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array(8).fill(0).map((_,i) => (
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
                {sections.map(({ title, icon: Icon, fields }) => {
                  const visible = fields.filter(f => f.value !== undefined && f.value !== null && f.value !== '');
                  if (!visible.length) return null;
                  return (
                    <div key={title} className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center">
                          <Icon size={11} className="text-[#f59e0b]"/>
                        </div>
                        <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">{title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {visible.map(({ label, value }) => (
                          <div key={label} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3">
                            <p className="text-xs text-[#006aff] font-medium mb-0.5">{label}</p>
                            <p className="text-sm font-semibold text-[#0f172a] break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Verification status */}
                {formData.verifiedAt ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-2">
                    <CheckCircle size={14} className="text-emerald-600"/>
                    <p className="text-xs text-emerald-700 font-medium">
                      Form verified on {new Date(formData.verifiedAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
                    <AlertTriangle size={14} className="text-amber-600"/>
                    <p className="text-xs text-amber-700 font-medium">Form not yet verified by staff</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Documents section — always shown ── */}
          <div className="px-6 pb-5">
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#0f172a] rounded-lg flex items-center justify-center">
                <FileText size={11} className="text-[#f59e0b]"/>
              </div>
              <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
                Supporting Documents
              </p>
            </div>

            <DocumentsSection app={app} documents={documents}/>
          </div>

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
              onClick={() => onAction('verify', app.id, null, null, app.type)}
              loading={actionLoading === `verify-${app.id}`}
            >
              <CheckCircle size={15}/> Verify Application Form
            </Button>
          )}

          {/* Status progression */}
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

            {!['COLLECTED','REJECTED'].includes(app.status) && (
              <Button variant="danger" size="md" onClick={() => setShowReject(r => !r)}>
                Reject
              </Button>
            )}
          </div>

          {/* Reject note */}
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

  // Quick doc completeness indicator for the row
  const docTypes      = SERVICE_DOCS[app.type] ?? [];
  const requiredTypes = docTypes.filter(t => DOC_CONFIG[t]?.required);
  const uploadedTypes = (app.documents ?? []).map(d => d.documentType);
  const doneCount     = requiredTypes.filter(t => uploadedTypes.includes(t)).length;
  const allDone       = doneCount === requiredTypes.length && requiredTypes.length > 0;

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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-bold text-[#0f172a] text-sm">{app.type.replace(/_/g,' ')}</p>
              <Badge label={app.status} variant={app.status}/>
              {/* Doc status pill */}
              {requiredTypes.length > 0 && (
                <span style={{
                  fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4,
                  letterSpacing:'0.05em',
                  background: allDone ? '#f0fdf4' : '#fef2f2',
                  border:     allDone ? '1px solid #bbf7d0' : '1px solid #fecaca',
                  color:      allDone ? '#166534' : '#ef4444',
                }}>
                  {allDone ? `✓ Docs ${doneCount}/${requiredTypes.length}` : `Docs ${doneCount}/${requiredTypes.length}`}
                </span>
              )}
            </div>
            <p className="text-sm text-[#64748b] font-medium">{app.citizen?.fullName}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{app.citizen?.phone} · {app.citizen?.email}</p>
            <p className="text-xs text-[#94a3b8] mt-1">
              {new Date(app.createdAt).toLocaleDateString('en-GB', {
                day:'numeric', month:'short', year:'numeric',
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
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, appId, status, notes, appType) => {
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
        await verifyFormByType(appId, appType, { isVerified: true });
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
    Cookies.remove('token');
    Cookies.remove('user');
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
            {Array(5).fill(0).map((_,i) => (
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