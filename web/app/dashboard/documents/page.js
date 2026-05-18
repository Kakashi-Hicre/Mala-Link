'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import { applicationsAPI, documentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Upload, Trash2, FileText, Eye, Camera, X,
  RefreshCw, CheckCircle, AlertCircle, ImageIcon,
  Fingerprint, PenLine, CreditCard, Stethoscope, FileCheck,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Document-type config: what's required per service, icon,
// description, and whether webcam capture is available.
// ─────────────────────────────────────────────────────────────
const DOC_CONFIG = {
  PASSPORT_PHOTO: {
    label: 'Passport Photo',
    description: 'Clear face photo against a plain background. Webcam capture recommended.',
    icon: Camera,
    allowWebcam: true,
    required: true,
  },
  BIRTH_CERTIFICATE: {
    label: 'Birth Certificate',
    description: 'Scanned or photographed copy of your official birth certificate.',
    icon: FileCheck,
    allowWebcam: false,
    required: true,
  },
  SUPPORTING_DOC: {
    label: 'Supporting Document',
    description: 'Voter ID, village head letter, or any supporting identity document.',
    icon: FileText,
    allowWebcam: false,
    required: false,
  },
  NATIONAL_ID_SCAN: {
    label: 'National ID (Both Sides)',
    description: 'Clear scan or photo of the front AND back of your Malawi National ID.',
    icon: CreditCard,
    allowWebcam: true,
    required: true,
  },
  FINGERPRINT: {
    label: 'Fingerprint',
    description: 'Scanned fingerprint image. Use a scanner or capture with your device camera.',
    icon: Fingerprint,
    allowWebcam: true,
    required: true,
  },
  DIGITAL_SIGNATURE: {
    label: 'Digital Signature',
    description: 'Sign on paper, then photograph or scan and upload.',
    icon: PenLine,
    allowWebcam: true,
    required: true,
  },
  MEDICAL_CERTIFICATE: {
    label: 'Medical Certificate (DL3)',
    description: 'Form DL3 signed by a registered medical practitioner.',
    icon: Stethoscope,
    allowWebcam: false,
    required: true,
  },
};

// Which document types are shown per application type
const SERVICE_DOCS = {
  NATIONAL_ID:     ['PASSPORT_PHOTO', 'BIRTH_CERTIFICATE', 'SUPPORTING_DOC'],
  PASSPORT:        ['PASSPORT_PHOTO', 'NATIONAL_ID_SCAN', 'FINGERPRINT', 'DIGITAL_SIGNATURE'],
  DRIVING_LICENCE: ['PASSPORT_PHOTO', 'NATIONAL_ID_SCAN', 'MEDICAL_CERTIFICATE'],
};

// ─────────────────────────────────────────────────────────────
// Webcam Modal
// ─────────────────────────────────────────────────────────────
function WebcamModal({ docType, onCapture, onClose }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [camError, setCamError] = useState(null);
  const [camReady, setCamReady] = useState(false);

  const cfg = DOC_CONFIG[docType];

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCamReady(true);
        }
      })
      .catch(() => {
        if (active) setCamError('Camera access denied. Please allow camera permissions and try again.');
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setSnapshot(canvas.toDataURL('image/jpeg', 0.92));
    streamRef.current?.getTracks().forEach(t => (t.enabled = false));
  }, []);

  const retake = useCallback(() => {
    setSnapshot(null);
    streamRef.current?.getTracks().forEach(t => (t.enabled = true));
  }, []);

  const confirm = useCallback(() => {
    if (!snapshot) return;
    const arr  = snapshot.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    const file = new File([new Blob([u8], { type: mime })], `${docType.toLowerCase()}_capture.jpg`, { type: mime });
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture(file);
  }, [snapshot, docType, onCapture]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#0f172a', borderRadius: 24, overflow: 'hidden', width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#f59e0b', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={15} color="#0f172a" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Webcam Capture</p>
              <p style={{ color: '#64748b', fontSize: 11 }}>{cfg.label}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} color="#94a3b8" />
          </button>
        </div>

        {/* Camera viewport */}
        <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: snapshot ? 'none' : 'block', transform: 'scaleX(-1)' }} />

          {snapshot && (
            <img src={snapshot} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          )}

          {camError && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#ef4444', fontSize: 13, lineHeight: 1.6 }}>{camError}</p>
            </div>
          )}

          {!camReady && !camError && !snapshot && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#64748b', fontSize: 12 }}>Starting camera…</p>
            </div>
          )}

          {/* Oval guide for passport photo */}
          {docType === 'PASSPORT_PHOTO' && !snapshot && camReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{
                width: 150, height: 195,
                border: '2px dashed rgba(245,158,11,0.7)',
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.32)',
              }} />
              <p style={{ position: 'absolute', bottom: '12%', color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
                CENTRE YOUR FACE
              </p>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Tip strip */}
        <div style={{ padding: '9px 20px', background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 11, color: '#d97706', lineHeight: 1.5 }}>{cfg.description}</p>
        </div>

        {/* Action row */}
        <div style={{ padding: '16px 22px', display: 'flex', gap: 10 }}>
          {!snapshot ? (
            <>
              <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={capture} disabled={!camReady || !!camError} style={{
                flex: 2, padding: '12px 0', border: 'none', borderRadius: 12,
                background: (camReady && !camError) ? '#f59e0b' : '#1e293b',
                color: (camReady && !camError) ? '#0f172a' : '#475569',
                fontWeight: 700, fontSize: 13,
                cursor: (camReady && !camError) ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
                <Camera size={15} /> Capture Photo
              </button>
            </>
          ) : (
            <>
              <button onClick={retake} style={{ flex: 1, padding: '12px 0', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, background: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <RefreshCw size={13} /> Retake
              </button>
              <button onClick={confirm} style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 12, background: '#22c55e', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <CheckCircle size={15} /> Use This Photo
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Individual document-type card
// ─────────────────────────────────────────────────────────────
function DocTypeCard({ docType, uploaded, uploading, onUpload, onWebcam, onDelete }) {
  const cfg       = DOC_CONFIG[docType];
  const Icon      = cfg.icon;
  const fileInput = useRef(null);
  const hasDoc    = !!uploaded;

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f) onUpload(f, docType, 'UPLOAD');
    e.target.value = '';
  };

  return (
    <div style={{
      position: 'relative',
      background: 'white', borderRadius: 16,
      border: `2px solid ${hasDoc ? '#22c55e' : cfg.required ? '#e2e8f0' : '#f1f5f9'}`,
      overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: hasDoc ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
    }}>

      {/* Uploading overlay */}
      {uploading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14 }}>
          <div style={{ width: 20, height: 20, border: '2.5px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Uploading…</p>
        </div>
      )}

      {/* Card top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 16px 12px' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: hasDoc ? '#f0fdf4' : '#f8fafc',
          border: `1.5px solid ${hasDoc ? '#bbf7d0' : '#e2e8f0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={19} color={hasDoc ? '#22c55e' : '#94a3b8'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{cfg.label}</p>
            {cfg.required
              ? <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>REQUIRED</span>
              : <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>OPTIONAL</span>
            }
          </div>
          <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55 }}>{cfg.description}</p>
        </div>
        {hasDoc && (
          <div style={{ width: 22, height: 22, background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <CheckCircle size={12} color="white" />
          </div>
        )}
      </div>

      {/* Uploaded file strip */}
      {hasDoc && (
        <div style={{ margin: '0 16px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={13} color="#22c55e" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#166534', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {uploaded.fileName}
          </p>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <a href={`http://localhost:3000${uploaded.fileUrl}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '4px 9px', border: '1px solid #bbf7d0', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#166534', fontWeight: 600, fontFamily: 'inherit' }}>
                <Eye size={11} /> View
              </button>
            </a>
            <button onClick={() => onDelete(uploaded.id)} style={{ padding: '4px 9px', border: '1px solid #fecaca', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#ef4444', fontWeight: 600, fontFamily: 'inherit' }}>
              <Trash2 size={11} /> Remove
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
        {cfg.allowWebcam && (
          <button onClick={() => onWebcam(docType)} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
            border: '1.5px solid #0f172a', background: '#0f172a', color: 'white',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <Camera size={13} /> Webcam
          </button>
        )}
        <button onClick={() => fileInput.current?.click()} style={{
          flex: cfg.allowWebcam ? 1 : 2, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
          border: '1.5px solid #f59e0b', background: '#f59e0b', color: '#0f172a',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}>
          <Upload size={13} /> {hasDoc ? 'Replace' : 'Upload File'}
        </button>
        <input ref={fileInput} type="file" accept=".jpg,.jpeg,.png,.pdf,.webp" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Upload progress bar
// ─────────────────────────────────────────────────────────────
function UploadProgress({ total, done }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = pct === 100;
  return (
    <div style={{ background: allDone ? '#f0fdf4' : '#fffbeb', border: `1px solid ${allDone ? '#bbf7d0' : '#fde68a'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {allDone ? <CheckCircle size={13} color="#22c55e" /> : <AlertCircle size={13} color="#d97706" />}
          <p style={{ fontSize: 12, fontWeight: 700, color: allDone ? '#166534' : '#92400e' }}>
            {allDone ? 'All required documents uploaded!' : 'Required documents'}
          </p>
        </div>
        <p style={{ fontSize: 12, fontWeight: 800, color: allDone ? '#22c55e' : '#f59e0b' }}>
          {done} / {total}
        </p>
      </div>
      <div style={{ height: 5, background: allDone ? '#bbf7d0' : '#fde68a', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: allDone ? '#22c55e' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApp,  setSelectedApp]  = useState(null);
  const [documents,    setDocuments]    = useState([]);
  const [uploading,    setUploading]    = useState(null); // active docType key
  const [webcamDoc,    setWebcamDoc]    = useState(null); // open modal for this docType

  useEffect(() => {
    applicationsAPI.getMy()
      .then(res => {
        const active = res.data.data.filter(a =>
          ['PENDING', 'PROCESSING', 'PRINTING', 'READY'].includes(a.status)
        );
        setApplications(active);
      })
      .catch(() => toast.error('Failed to load applications'));
  }, []);

  const loadDocs = async (app) => {
    setSelectedApp(app);
    setDocuments([]);
    try {
      const res = await documentsAPI.getByApplication(app.id);
      setDocuments(res.data.data);
    } catch {
      toast.error('Failed to load documents');
    }
  };

  const handleUpload = async (file, docType, captureMethod = 'UPLOAD') => {
    if (!selectedApp) return;
    setUploading(docType);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('documentType', docType);
      fd.append('captureMethod', captureMethod);
      await documentsAPI.upload(selectedApp.id, fd);
      toast.success(`${DOC_CONFIG[docType]?.label ?? docType} uploaded`);
      const res = await documentsAPI.getByApplication(selectedApp.id);
      setDocuments(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleWebcamCapture = async (file) => {
    const docType = webcamDoc;
    setWebcamDoc(null);
    await handleUpload(file, docType, 'WEBCAM');
  };

  const handleDelete = async (docId) => {
    if (!confirm('Remove this document?')) return;
    try {
      await documentsAPI.delete(docId);
      toast.success('Document removed');
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch {
      toast.error('Failed to remove document');
    }
  };

  // Latest upload per documentType
  const uploadedMap = documents.reduce((acc, doc) => {
    if (!acc[doc.documentType]) acc[doc.documentType] = doc;
    return acc;
  }, {});

  const docTypes      = selectedApp ? (SERVICE_DOCS[selectedApp.type] ?? []) : [];
  const requiredTypes = docTypes.filter(t => DOC_CONFIG[t]?.required);
  const doneCount     = requiredTypes.filter(t => uploadedMap[t]).length;

  const STATUS_LABEL = {
    PENDING: 'Pending Review', PROCESSING: 'Processing',
    PRINTING: 'Printing', READY: 'Ready for Collection',
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Documents"
        subtitle="Upload the required supporting documents for your applications."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left: Application selector ── */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Active Applications
          </p>

          {applications.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '28px 16px', textAlign: 'center' }}>
              <ImageIcon size={26} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>No active applications</p>
              <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 3, lineHeight: 1.5 }}>Submit an application first.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {applications.map(app => {
                const isActive  = selectedApp?.id === app.id;
                const appTypes  = SERVICE_DOCS[app.type] ?? [];
                const appReq    = appTypes.filter(t => DOC_CONFIG[t]?.required);
                const appDone   = isActive
                  ? requiredTypes.filter(t => uploadedMap[t]).length
                  : 0; // only track for active
                return (
                  <button key={app.id} onClick={() => loadDocs(app)} style={{
                    textAlign: 'left', padding: '13px 14px', borderRadius: 14,
                    border: `2px solid ${isActive ? '#f59e0b' : '#e2e8f0'}`,
                    background: isActive ? '#fffbeb' : 'white',
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    boxShadow: isActive ? '0 4px 16px rgba(245,158,11,0.12)' : 'none',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 2 }}>
                      {app.type.replace(/_/g, ' ')}
                    </p>
                    <p style={{ fontSize: 10, color: '#64748b' }}>
                      {app.agency?.name} · {STATUS_LABEL[app.status] ?? app.status}
                    </p>
                    {isActive && appReq.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                        <div style={{ flex: 1, height: 3, background: '#fde68a', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', background: doneCount === appReq.length ? '#22c55e' : '#f59e0b',
                            borderRadius: 99, width: `${Math.round((doneCount / appReq.length) * 100)}%`,
                            transition: 'width 0.4s',
                          }} />
                        </div>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#d97706', whiteSpace: 'nowrap' }}>
                          {doneCount}/{appReq.length}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Document upload area ── */}
        <div>
          {!selectedApp ? (
            <div style={{ background: 'white', borderRadius: 20, border: '2px dashed #e2e8f0', padding: '72px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 54, height: 54, background: '#f8fafc', borderRadius: 16, border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <FileText size={22} color="#cbd5e1" />
              </div>
              <p style={{ fontWeight: 700, color: '#64748b', fontSize: 15, marginBottom: 4 }}>Select an application</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Choose an application on the left to manage its documents.</p>
            </div>
          ) : (
            <div>
              {/* Section header */}
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>
                  {selectedApp.type.replace(/_/g, ' ')} — Documents
                </h2>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  Upload all required documents before visiting the {selectedApp.agency?.name} office.
                </p>
              </div>

              {/* Progress */}
              <UploadProgress total={requiredTypes.length} done={doneCount} />

              {/* Webcam availability tip */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 13px', marginBottom: 18 }}>
                <Camera size={13} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: '#1d4ed8', lineHeight: 1.6 }}>
                  Documents with a <strong>Webcam</strong> button can be captured live with your device camera — no scanner required. You can also upload a file from your device for any document.
                </p>
              </div>

              {/* Document cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docTypes.map(docType => (
                  <DocTypeCard
                    key={docType}
                    docType={docType}
                    uploaded={uploadedMap[docType] ?? null}
                    uploading={uploading === docType}
                    onUpload={handleUpload}
                    onWebcam={setWebcamDoc}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Any extra docs not in the required list */}
              {documents.filter(d => !docTypes.includes(d.documentType)).length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Other Uploads
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {documents.filter(d => !docTypes.includes(d.documentType)).map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #f1f5f9', borderRadius: 12, padding: '10px 14px' }}>
                        <FileText size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</p>
                          <p style={{ fontSize: 10, color: '#94a3b8' }}>{doc.documentType?.replace(/_/g, ' ')} · {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}</p>
                        </div>
                        <a href={`http://localhost:3000${doc.fileUrl}`} target="_blank" rel="noreferrer">
                          <button style={{ padding: '5px 9px', border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Eye size={11} /> View
                          </button>
                        </a>
                        <button onClick={() => handleDelete(doc.id)} style={{ padding: '5px 9px', border: '1px solid #fecaca', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 11, color: '#ef4444', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Webcam modal */}
      {webcamDoc && (
        <WebcamModal
          docType={webcamDoc}
          onCapture={handleWebcamCapture}
          onClose={() => setWebcamDoc(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}