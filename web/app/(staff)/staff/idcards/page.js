'use client';
import { useState, useEffect } from 'react';
import { idcardsAPI } from '@/lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Shield, CreditCard, ChevronLeft, CheckCircle,
  AlertCircle, User, CalendarDays, Hash,
} from 'lucide-react';

// ── Field helpers ─────────────────────────────────────────
const inputBase = {
  width: '100%',
  background: 'white',
  border: '2px solid #e2e8f0',
  borderRadius: 12,
  padding: '13px 14px',
  fontSize: 15,
  color: '#0f172a',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: '#f59e0b', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function TextInput({ label, name, type = 'text', value, onChange, placeholder, required, hint }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={inputBase}
        onFocus={e  => (e.target.style.borderColor = '#f59e0b')}
        onBlur={e   => (e.target.style.borderColor = '#e2e8f0')}
      />
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function SelectInput({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        name={name} value={value} onChange={onChange}
        style={{ ...inputBase, cursor: 'pointer' }}
        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
        onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
      >
        <option value="">Select...</option>
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.value;
          const lbl = typeof o === 'string' ? o : o.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}

function SectionHead({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 28, height: 28, background: '#0f172a', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={13} color="#f59e0b"/>
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </p>
    </div>
  );
}

// ── Preview card ──────────────────────────────────────────
function CardPreview({ form }) {
  const isEmpty = !form.cardNumber && !form.holderName;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
      borderRadius: 20, padding: '28px 28px 24px', color: 'white',
      boxShadow: '0 24px 48px rgba(15,23,42,0.35)',
      border: '1px solid rgba(255,255,255,0.08)',
      position: 'relative', overflow: 'hidden',
      minHeight: 200,
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(245,158,11,0.08)' }}/>
      <div style={{ position: 'absolute', right: 20, bottom: -40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(245,158,11,0.05)' }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#f59e0b', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color="#0f172a"/>
          </div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>MALA-LINK</p>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em' }}>
          {form.cardStatus || 'ACTIVE'}
        </p>
      </div>

      {/* Card number */}
      <p style={{
        fontFamily: 'monospace', fontSize: 18, fontWeight: 900,
        letterSpacing: '0.12em', color: '#f59e0b', marginBottom: 18,
        opacity: isEmpty ? 0.3 : 1,
      }}>
        {form.cardNumber || 'XXXXXXXXXX'}
      </p>

      {/* Bottom info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Holder', value: form.holderName || '—' },
          { label: 'Sex',    value: form.sex || '—' },
          { label: 'Expiry', value: form.expiryDate || '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.07em', marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────
const INITIAL_FORM = {
  cardNumber:  '',
  holderName:  '',
  sex:         '',
  dateOfBirth: '',
  expiryDate:  '',
  cardStatus:  'ACTIVE',
};

export default function CreateManualCardPage() {
  const router          = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // holds the created card

  useEffect(() => {
    const stored = Cookies.get('user');
    if (!stored) { router.push('/staff/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  const set = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const isValid =
    form.cardNumber.trim() &&
    form.holderName.trim() &&
    form.sex &&
    form.dateOfBirth &&
    form.expiryDate &&
    form.cardStatus;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await idcardsAPI.createManual({
        cardNumber:  form.cardNumber.trim(),
        holderName:  form.holderName.trim(),
        sex:         form.sex,
        dateOfBirth: form.dateOfBirth,
        expiryDate:  form.expiryDate,
        cardStatus:  form.cardStatus,
      });
      setSuccess(res.data.data);
      toast.success('Card created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setSuccess(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Topbar */}
      <header style={{
        background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/staff/applications')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              padding: '6px 12px', color: '#94a3b8', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <ChevronLeft size={13}/> Applications
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#f59e0b', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={13} color="#0f172a"/>
            </div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Create Manual Card</p>
          </div>
        </div>
        <p style={{ color: '#475569', fontSize: 12 }}>{user?.fullName} · {user?.agency}</p>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700, marginBottom: 5 }}>
            Staff Portal
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            Register a Physical Card
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Manually register a card so citizens can search for their status without logging in.
          </p>
        </div>

        {/* ── Success state ── */}
        {success ? (
          <div>
            <div style={{
              background: 'white', border: '1px solid #d1fae5', borderRadius: 20,
              padding: '32px', textAlign: 'center', marginBottom: 20,
            }}>
              <div style={{ width: 56, height: 56, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={26} color="#059669"/>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Card Created!</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                The card has been registered and is now searchable by citizens.
              </p>

              <div style={{ maxWidth: 360, margin: '0 auto 24px' }}>
                <CardPreview form={success}/>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 400, margin: '0 auto', marginBottom: 24 }}>
                {[
                  { label: 'Card Number', value: success.cardNumber },
                  { label: 'Holder',      value: success.holderName },
                  { label: 'Sex',         value: success.sex },
                  { label: 'DOB',         value: success.dateOfBirth },
                  { label: 'Expiry',      value: success.expiryDate },
                  { label: 'Status',      value: success.cardStatus },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', textAlign: 'left' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={handleReset}
                  style={{
                    background: '#f59e0b', color: '#0f172a', border: 'none',
                    borderRadius: 12, padding: '11px 22px', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Create Another Card
                </button>
                <button
                  onClick={() => router.push('/staff/applications')}
                  style={{
                    background: 'transparent', color: '#64748b',
                    border: '1.5px solid #e2e8f0', borderRadius: 12,
                    padding: '11px 22px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Back to Applications
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Form + Preview layout ── */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* Form column */}
            <div>
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 28px 24px' }}>

                {/* Card Identification */}
                <SectionHead icon={Hash} title="Card Identification" />
                <div style={{ marginBottom: 24 }}>
                  <TextInput
                    label="Card Number" name="cardNumber" value={form.cardNumber} onChange={set}
                    placeholder="e.g. NRB-2024-001234" required
                    hint="Must be unique — this is what citizens will search for"
                  />
                </div>

                {/* Holder Info */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 22, marginBottom: 24 }}>
                  <SectionHead icon={User} title="Cardholder Information" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <TextInput
                        label="Full Name" name="holderName" value={form.holderName} onChange={set}
                        placeholder="e.g. John Phiri" required
                        hint="Exactly as it will appear on the card"
                      />
                    </div>
                    <SelectInput
                      label="Sex" name="sex" value={form.sex} onChange={set} required
                      options={[
                        { value: 'MALE',   label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                      ]}
                    />
                    <div>
                      <FieldLabel required>Date of Birth</FieldLabel>
                      <input
                        type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set}
                        style={inputBase}
                        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
                        onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                      />
                    </div>
                  </div>
                </div>

                {/* Card validity */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 22 }}>
                  <SectionHead icon={CalendarDays} title="Card Validity & Status" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <FieldLabel required>Expiry Date</FieldLabel>
                      <input
                        type="date" name="expiryDate" value={form.expiryDate} onChange={set}
                        style={inputBase}
                        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
                        onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                      />
                    </div>
                    <SelectInput
                      label="Card Status" name="cardStatus" value={form.cardStatus} onChange={set} required
                      options={[
                        { value: 'ACTIVE',    label: 'Active' },
                        { value: 'SUSPENDED', label: 'Suspended' },
                        { value: 'EXPIRED',   label: 'Expired' },
                        { value: 'LOST',      label: 'Lost' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Warning note */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 12, padding: '12px 16px', marginTop: 14,
              }}>
                <AlertCircle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }}/>
                <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                  This card will be immediately searchable by anyone using the citizen portal.
                  Ensure the card number is accurate — it cannot be changed after creation.
                </p>
              </div>

              {/* Submit */}
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                  style={{
                    background: (!isValid || loading) ? '#e2e8f0' : '#0f172a',
                    color:      (!isValid || loading) ? '#94a3b8' : 'white',
                    border: 'none', borderRadius: 12, padding: '13px 28px',
                    fontSize: 14, fontWeight: 700, cursor: (!isValid || loading) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  <CreditCard size={15}/>
                  {loading ? 'Creating...' : 'Create Card'}
                </button>
              </div>
            </div>

            {/* Preview column */}
            <div style={{ position: 'sticky', top: 100 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Live Preview
              </p>
              <CardPreview form={form}/>
              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
                Updates as you fill in the form
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}