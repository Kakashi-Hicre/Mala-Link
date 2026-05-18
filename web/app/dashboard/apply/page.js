'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicationsAPI, formsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Globe, Car, CheckCircle, ChevronRight, ChevronLeft,
  User, MapPin, Phone, FileText, AlertCircle, Users, Home,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const SERVICES = [
  {
    value: 'NATIONAL_ID',
    label: 'National ID Card',
    agency: 'NRB',
    icon: CreditCard,
    desc: 'Apply for your Malawi National Registration Bureau ID card. Required for all citizens aged 16 and above.',
    time: '5–10',
    gradStart: '#0b82f6',
    gradEnd: '#4f46e5',
  },
  {
    value: 'PASSPORT',
    label: 'Passport',
    agency: 'IMMIGRATION',
    icon: Globe,
    desc: 'Apply for an international Malawian passport via the Department of Immigration.',
    time: '10–15',
    gradStart: '#007336',
    gradEnd: '#1fb981',
  },
  {
    value: 'DRIVING_LICENCE',
    label: "Driver's Licence",
    agency: 'DRTSS',
    icon: Car,
    desc: 'Apply for a driving licence via the Department of Road Traffic & Safety Services.',
    time: '7–12',
    gradStart: '#a87516',
    gradEnd: '#f59e0b',
  },
];

// Steps per service — index 0 is always "Service" (the selection screen)
const SERVICE_STEPS = {
  NATIONAL_ID:     ['Service', 'Personal Info', 'Birth & Address', 'Parents', 'Review'],
  PASSPORT:        ['Service', 'Personal Info', 'Contact', 'Review'],
  DRIVING_LICENCE: ['Service', 'Personal Info', 'Licence Details', 'Review'],
};

const DISTRICTS = [
  'Balaka','Blantyre','Chikwawa','Chiradzulu','Chitipa','Dedza','Dowa',
  'Karonga','Kasungu','Lilongwe','Machinga','Mangochi','Mchinji','Mulanje',
  'Mwanza','Mzimba','Neno','Nkhata Bay','Nkhotakota','Nsanje','Ntcheu',
  'Ntchisi','Phalombe','Rumphi','Salima','Thyolo','Zomba',
];

const MARITAL_STATUS = [
  { value: 'NEVER_MARRIED', label: 'Never Married' },
  { value: 'MARRIED',       label: 'Married' },
  { value: 'DIVORCED',      label: 'Divorced' },
  { value: 'WIDOWED',       label: 'Widowed' },
  { value: 'SEPARATED',     label: 'Separated' },
  { value: 'ABANDONED',     label: 'Abandoned' },
];

const SEX_OPTIONS = [
  { value: 'MALE',   label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

const LICENCE_CATEGORIES = [
  { value: 'A',  label: 'A — Motorcycles / Tricycles' },
  { value: 'B',  label: 'B — Light vehicles (≤3,500 kg, max 8 seats)' },
  { value: 'C1', label: 'C1 — Medium goods vehicles' },
  { value: 'C',  label: 'C — Heavy goods vehicles' },
  { value: 'D1', label: 'D1 — Minibuses' },
  { value: 'D',  label: 'D — Full passenger buses' },
];

const INITIAL_FORM = {
  // ── NRB fields ──────────────────────────────────────
  firstName: '', otherNames: '', surname: '',
  maritalStatus: '', secondNationality: '', colourOfEyes: '',
  heightMeters: '', birthCertNo: '', passportNo: '', disability: '',
  birthDistrict: '', birthTA: '', birthVillage: '',
  residentialDistrict: '', residentialTA: '', residentialVillage: '',
  permanentDistrict: '', permanentTA: '', permanentVillage: '',
  motherFullName: '', motherNationality: 'Malawian', motherIdNo: '',
  motherDistrict: '', motherTA: '', motherVillage: '',
  fatherFullName: '', fatherNationality: 'Malawian', fatherIdNo: '',
  fatherDistrict: '', fatherTA: '', fatherVillage: '',
  // ── Immigration fields ──────────────────────────────
  givenNames: '', maidenName: '', placeOfBirth: '',
  occupation: '', nationalIdNo: '', eyeColour: '',
  permanentAddress: '', previousPassportNo: '',
  // ── DRTSS fields ────────────────────────────────────
  fullName: '', residentialAddress: '',
  licenceCategories: [], existingLicenceNo: '',
  // ── Shared ──────────────────────────────────────────
  dateOfBirth: '', sex: '', nationality: 'Malawian', phone: '', email: '',
};

// ═══════════════════════════════════════════════════════════
// Shared Styles & Base Field Components
// ═══════════════════════════════════════════════════════════

const inputBase = {
  width: '100%',
  background: 'white',
  border: '2px solid #cbd5e1',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  color: '#0f172a',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
      {children}
      {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function TextInput({ label, name, type = 'text', value, onChange, placeholder, required, hint }) {
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={inputBase}
        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
        onBlur={e  => (e.target.style.borderColor = '#cbd5e1')}
      />
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function SelectInput({ label, name, value, onChange, options, required, hint }) {
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <select
        name={name} value={value} onChange={onChange}
        style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' }}
        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
        onBlur={e  => (e.target.style.borderColor = '#cbd5e1')}
      >
        <option value="">Select…</option>
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.value;
          const lbl = typeof o === 'string' ? o : o.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function DateInput({ label, name, value, onChange, required }) {
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <input
        type="date" name={name} value={value} onChange={onChange} required={required}
        style={inputBase}
        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
        onBlur={e  => (e.target.style.borderColor = '#cbd5e1')}
      />
    </div>
  );
}

function CheckboxGroup({ label, name, options, value = [], onChange, required }) {
  const toggle = (val) => {
    const next = value.includes(val)
      ? value.filter(v => v !== val)
      : [...value, val];
    onChange({ target: { name, value: next } });
  };
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(o => {
          const val     = typeof o === 'string' ? o : o.value;
          const lbl     = typeof o === 'string' ? o : o.label;
          const checked = value.includes(val);
          return (
            <label key={val} style={{
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              padding: '11px 14px',
              border: `2px solid ${checked ? '#f59e0b' : '#e2e8f0'}`,
              borderRadius: 10,
              background: checked ? '#fffbeb' : 'white',
              transition: 'all 0.15s',
            }}>
              <input
                type="checkbox" checked={checked} onChange={() => toggle(val)}
                style={{ width: 16, height: 16, accentColor: '#f59e0b', flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, fontWeight: checked ? 700 : 500, color: '#0f172a' }}>{lbl}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ── Layout helpers ────────────────────────────────────────

function SectionHead({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 28, height: 28, background: '#0f172a', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={13} color="#f59e0b" />
      </div>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {title}
      </p>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />;
}

function FormCard({ children }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px', marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Grid({ cols = '1fr 1fr', children, gap = 14 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap }}>
      {children}
    </div>
  );
}

function FullCol({ children }) {
  return <div style={{ gridColumn: '1 / -1' }}>{children}</div>;
}

// ── Step Bar ──────────────────────────────────────────────

function StepBar({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32 }}>
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#0f172a' : active ? '#f59e0b' : '#f1f5f9',
                color:      done ? 'white'   : active ? '#0f172a' : '#94a3b8',
                boxShadow:  active ? '0 0 0 4px #fef3c7' : 'none',
                flexShrink: 0,
              }}>
                {done ? '✓' : i + 1}
              </div>
              <p style={{
                fontSize: 10, fontWeight: 600, marginTop: 6, whiteSpace: 'nowrap',
                color: active ? '#0f172a' : done ? '#64748b' : '#94a3b8',
              }}>
                {label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '15px 6px 0',
                background: done ? '#0f172a' : '#e2e8f0',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Nav Buttons ───────────────────────────────────────────

function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, loading = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 12,
        padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#64748b',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
      }}>
        <ChevronLeft size={15} /> Back
      </button>
      <button onClick={onNext} disabled={nextDisabled || loading} style={{
        background: (nextDisabled || loading) ? '#e2e8f0' : '#f59e0b',
        color:      (nextDisabled || loading) ? '#94a3b8' : '#0f172a',
        border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700,
        cursor: (nextDisabled || loading) ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'all 0.2s',
      }}>
        {loading ? 'Loading…' : nextLabel} {!loading && <ChevronRight size={15} />}
      </button>
    </div>
  );
}

// ── Service pill (shown at top of each form step) ─────────

function ServicePill({ service }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: 12, padding: '10px 14px', marginBottom: 18,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${service.gradStart}, ${service.gradEnd})`,
      }}>
        <service.icon size={16} color="white" />
      </div>
      <div>
        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{service.label}</p>
        <p style={{ fontSize: 11, color: '#64748b' }}>via {service.agency} · {service.time} working days</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 0 — Service Selection
// ═══════════════════════════════════════════════════════════

function ServiceStep({ selected, onSelect, onNext }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {SERVICES.map(s => {
          const Icon   = s.icon;
          const active = selected?.value === s.value;
          return (
            <button key={s.value} onClick={() => onSelect(s)} style={{
              textAlign: 'left', borderRadius: 16,
              border: active ? '2px solid #f59e0b' : '2px solid #e2e8f0',
              overflow: 'hidden', cursor: 'pointer', background: 'white', padding: 0,
              transform: active ? 'scale(1.02)' : 'scale(1)',
              boxShadow: active ? '0 6px 24px rgba(245,158,11,0.18)' : '0 1px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}>
              {/* Card gradient header */}
              <div style={{
                padding: '20px 18px 16px',
                background: `linear-gradient(135deg, ${s.gradStart}, ${s.gradEnd})`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', right: -12, top: -12, width: 60, height: 60, background: 'rgba(255,255,255,0.12)', borderRadius: '50%' }} />
                <Icon size={24} color="white" style={{ marginBottom: 10, position: 'relative', zIndex: 1 }} />
                <p style={{ color: 'white', fontWeight: 800, fontSize: 15, position: 'relative', zIndex: 1 }}>{s.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, position: 'relative', zIndex: 1 }}>via {s.agency}</p>
              </div>
              {/* Card body */}
              <div style={{ padding: '14px 18px', position: 'relative' }}>
                {active && <CheckCircle size={16} color="#f59e0b" style={{ position: 'absolute', top: 12, right: 12 }} />}
                <p style={{ color: '#54585d', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{s.desc}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>⏱ {s.time} working days</p>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onNext} disabled={!selected} style={{
          background: selected ? '#f59e0b' : '#e2e8f0',
          color:      selected ? '#0f172a' : '#94a3b8',
          border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700,
          cursor: selected ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'all 0.2s',
        }}>
          Continue <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NRB — National ID Card
// Steps: Personal Info → Birth & Address → Parents → Review
// ═══════════════════════════════════════════════════════════

function NrbStep1Personal({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.firstName?.trim() && form.surname?.trim() &&
    form.dateOfBirth && form.sex && form.maritalStatus &&
    form.colourOfEyes?.trim() && form.heightMeters && form.phone?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        {/* Full Name */}
        <SectionHead icon={User} title="Full Name" />
        <Grid>
          <TextInput label="First Name" name="firstName" value={form.firstName} onChange={set} placeholder="e.g. John" required />
          <TextInput label="Surname" name="surname" value={form.surname} onChange={set} placeholder="e.g. Banda" required />
          <FullCol>
            <TextInput label="Other Names" name="otherNames" value={form.otherNames} onChange={set} placeholder="Middle name(s) — optional" hint="Leave blank if none" />
          </FullCol>
        </Grid>

        <Divider />

        {/* Personal Details */}
        <SectionHead icon={User} title="Personal Details" />
        <Grid>
          <DateInput label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={set} required />
          <SelectInput label="Sex" name="sex" value={form.sex} onChange={set} options={SEX_OPTIONS} required />
          <SelectInput label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={set} options={MARITAL_STATUS} required />
          <TextInput label="Nationality" name="nationality" value={form.nationality} onChange={set} placeholder="Malawian" />
          <TextInput label="Second Nationality" name="secondNationality" value={form.secondNationality} onChange={set} placeholder="If dual national — optional" />
          <TextInput label="Colour of Eyes" name="colourOfEyes" value={form.colourOfEyes} onChange={set} placeholder="e.g. Brown" required />
          <TextInput label="Height (metres)" name="heightMeters" type="number" value={form.heightMeters} onChange={set} placeholder="e.g. 1.75" required />
          <TextInput label="Phone Number" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+265 999 000 111" required />
          <TextInput label="Birth Certificate No." name="birthCertNo" value={form.birthCertNo} onChange={set} placeholder="Optional" hint="If available" />
          <TextInput label="Passport No." name="passportNo" value={form.passportNo} onChange={set} placeholder="Optional" hint="If applicable" />
          <FullCol>
            <TextInput label="Disability / Observation" name="disability" value={form.disability} onChange={set} placeholder="Any disability or special observation — optional" />
          </FullCol>
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function NrbStep2Address({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.birthDistrict && form.birthTA?.trim() && form.birthVillage?.trim() &&
    form.residentialDistrict && form.residentialTA?.trim() && form.residentialVillage?.trim() &&
    form.permanentDistrict && form.permanentTA?.trim() && form.permanentVillage?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        {/* Place of Birth */}
        <SectionHead icon={MapPin} title="Place of Birth" />
        <Grid>
          <SelectInput label="District of Birth" name="birthDistrict" value={form.birthDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label="Traditional Authority (T/A)" name="birthTA" value={form.birthTA} onChange={set} placeholder="e.g. T/A Kalolo" required />
          <FullCol>
            <TextInput label="Village of Birth" name="birthVillage" value={form.birthVillage} onChange={set} placeholder="e.g. Chinthambala Village" required />
          </FullCol>
        </Grid>

        <Divider />

        {/* Residential Address */}
        <SectionHead icon={Home} title="Residential Address" />
        <Grid>
          <SelectInput label="Residential District" name="residentialDistrict" value={form.residentialDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label="Traditional Authority (T/A)" name="residentialTA" value={form.residentialTA} onChange={set} placeholder="e.g. T/A Mwansambo" required />
          <FullCol>
            <TextInput label="Village / Area" name="residentialVillage" value={form.residentialVillage} onChange={set} placeholder="e.g. Area 18, Lilongwe" required />
          </FullCol>
        </Grid>

        <Divider />

        {/* Permanent Home */}
        <SectionHead icon={Home} title="Permanent Original Home" />
        <Grid>
          <SelectInput label="Permanent District" name="permanentDistrict" value={form.permanentDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label="Traditional Authority (T/A)" name="permanentTA" value={form.permanentTA} onChange={set} placeholder="e.g. T/A Kyungu" required />
          <FullCol>
            <TextInput label="Village" name="permanentVillage" value={form.permanentVillage} onChange={set} placeholder="e.g. Mkandawire Village" required />
          </FullCol>
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function NrbStep3Parents({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.motherFullName?.trim() && form.motherDistrict &&
    form.fatherFullName?.trim() && form.fatherDistrict;

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        {/* Mother */}
        <SectionHead icon={Users} title="Mother's Details" />
        <Grid>
          <FullCol>
            <TextInput label="Mother's Full Name" name="motherFullName" value={form.motherFullName} onChange={set} placeholder="e.g. Mary Banda" required />
          </FullCol>
          <TextInput label="Mother's Nationality" name="motherNationality" value={form.motherNationality} onChange={set} placeholder="Malawian" />
          <TextInput label="Mother's National ID No." name="motherIdNo" value={form.motherIdNo} onChange={set} placeholder="Optional" hint="If known" />
          <SelectInput label="Mother's District" name="motherDistrict" value={form.motherDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label="Mother's T/A" name="motherTA" value={form.motherTA} onChange={set} placeholder="Optional" />
          <FullCol>
            <TextInput label="Mother's Village" name="motherVillage" value={form.motherVillage} onChange={set} placeholder="Optional" />
          </FullCol>
        </Grid>

        <Divider />

        {/* Father */}
        <SectionHead icon={Users} title="Father's Details" />
        <Grid>
          <FullCol>
            <TextInput label="Father's Full Name" name="fatherFullName" value={form.fatherFullName} onChange={set} placeholder="e.g. James Banda" required />
          </FullCol>
          <TextInput label="Father's Nationality" name="fatherNationality" value={form.fatherNationality} onChange={set} placeholder="Malawian" />
          <TextInput label="Father's National ID No." name="fatherIdNo" value={form.fatherIdNo} onChange={set} placeholder="Optional" hint="If known" />
          <SelectInput label="Father's District" name="fatherDistrict" value={form.fatherDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label="Father's T/A" name="fatherTA" value={form.fatherTA} onChange={set} placeholder="Optional" />
          <FullCol>
            <TextInput label="Father's Village" name="fatherVillage" value={form.fatherVillage} onChange={set} placeholder="Optional" />
          </FullCol>
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review & Submit" nextDisabled={!isValid} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// IMMIGRATION — Passport
// Steps: Personal Info → Contact → Review
// ═══════════════════════════════════════════════════════════

function ImmStep1Personal({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.surname?.trim() && form.givenNames?.trim() &&
    form.dateOfBirth && form.placeOfBirth?.trim() && form.sex &&
    form.occupation?.trim() && form.nationalIdNo?.trim() &&
    form.heightMeters && form.eyeColour?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        {/* Full Name */}
        <SectionHead icon={User} title="Full Name" />
        <Grid>
          <TextInput label="Surname" name="surname" value={form.surname} onChange={set} placeholder="e.g. Banda" required />
          <TextInput label="Given Names" name="givenNames" value={form.givenNames} onChange={set} placeholder="e.g. John Michael" required />
          <FullCol>
            <TextInput label="Maiden Name" name="maidenName" value={form.maidenName} onChange={set}
              placeholder="Previous surname before marriage — optional"
              hint="For married women who changed their surname only" />
          </FullCol>
        </Grid>

        <Divider />

        {/* Personal Details */}
        <SectionHead icon={User} title="Personal Details" />
        <Grid>
          <DateInput label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={set} required />
          <TextInput label="Place of Birth" name="placeOfBirth" value={form.placeOfBirth} onChange={set} placeholder="e.g. Lilongwe, Malawi" required />
          <SelectInput label="Sex" name="sex" value={form.sex} onChange={set} options={SEX_OPTIONS} required />
          <TextInput label="Nationality" name="nationality" value={form.nationality} onChange={set} placeholder="Malawian" />
          <TextInput label="Occupation" name="occupation" value={form.occupation} onChange={set} placeholder="e.g. Teacher" required />
          <TextInput label="National ID No." name="nationalIdNo" value={form.nationalIdNo} onChange={set}
            placeholder="Your Malawi NID number" required
            hint="Must present original Malawi NID at the agency" />
        </Grid>

        <Divider />

        {/* Physical Features */}
        <SectionHead icon={User} title="Physical Features" />
        <Grid>
          <TextInput label="Height (metres)" name="heightMeters" type="number" value={form.heightMeters} onChange={set} placeholder="e.g. 1.75" required />
          <TextInput label="Eye Colour" name="eyeColour" value={form.eyeColour} onChange={set} placeholder="e.g. Brown" required />
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function ImmStep2Contact({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid = form.permanentAddress?.trim() && form.phone?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        <SectionHead icon={Phone} title="Contact Information" />
        <Grid>
          <FullCol>
            <TextInput label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={set}
              placeholder="e.g. Area 18, House No. 34, Lilongwe" required />
          </FullCol>
          <TextInput label="Phone Number" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+265 999 000 111" required />
          <TextInput label="Email Address" name="email" type="email" value={form.email} onChange={set} placeholder="john@example.com" hint="Optional" />
        </Grid>

        <Divider />

        {/* Renewal */}
        <SectionHead icon={FileText} title="Renewal Information" />
        <TextInput label="Previous Passport Number" name="previousPassportNo" value={form.previousPassportNo} onChange={set}
          placeholder="e.g. MW123456"
          hint="Only for renewals — leave blank for first-time applications" />
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review & Submit" nextDisabled={!isValid} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DRTSS — Driver's Licence
// Steps: Personal Info → Licence Details → Review
// ═══════════════════════════════════════════════════════════

function DrtssStep1Personal({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.fullName?.trim() && form.dateOfBirth && form.sex &&
    form.nationalIdNo?.trim() && form.residentialAddress?.trim() && form.phone?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        <SectionHead icon={User} title="Personal Details" />
        <Grid>
          <FullCol>
            <TextInput label="Full Name" name="fullName" value={form.fullName} onChange={set} placeholder="e.g. John Michael Banda" required />
          </FullCol>
          <DateInput label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={set} required />
          <SelectInput label="Sex" name="sex" value={form.sex} onChange={set} options={SEX_OPTIONS} required />
          <TextInput label="Nationality" name="nationality" value={form.nationality} onChange={set} placeholder="Malawian" />
          <FullCol>
            <TextInput label="National ID No." name="nationalIdNo" value={form.nationalIdNo} onChange={set}
              placeholder="Your Malawi NID number" required
              hint="Required — must present original Malawi NID at the DRTSS office" />
          </FullCol>
        </Grid>

        <Divider />

        <SectionHead icon={MapPin} title="Contact & Address" />
        <Grid>
          <FullCol>
            <TextInput label="Residential Address" name="residentialAddress" value={form.residentialAddress} onChange={set}
              placeholder="e.g. Area 25, House No. 12, Lilongwe" required />
          </FullCol>
          <TextInput label="Phone Number" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+265 999 000 111" required />
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function DrtssStep2Licence({ service, form, onChange, onNext, onBack }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });
  const isValid = form.licenceCategories?.length > 0;

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        <SectionHead icon={Car} title="Licence Categories" />
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 18 }}>
          Select all categories you are applying for. A separate test is required for each category.
        </p>
        <CheckboxGroup
          label="Select Category / Categories"
          name="licenceCategories"
          options={LICENCE_CATEGORIES}
          value={form.licenceCategories || []}
          onChange={e => onChange({ ...form, licenceCategories: e.target.value })}
          required
        />

        <Divider />

        <SectionHead icon={FileText} title="Renewal Information" />
        <TextInput label="Existing Licence Number" name="existingLicenceNo" value={form.existingLicenceNo} onChange={set}
          placeholder="e.g. ML-DRTSS-2020-123456"
          hint="Only for renewals — leave blank for first-time applications" />
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review & Submit" nextDisabled={!isValid} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Review Step — service-specific summary
// ═══════════════════════════════════════════════════════════

function ReviewRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  const display = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '9px 12px' }}>
      <p style={{ fontSize: 10, color: '#3b5579', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{display}</p>
    </div>
  );
}

function ReviewSection({ title, icon: Icon, rows }) {
  const visible = rows.filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0));
  if (!visible.length) return null;
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #cbd5e1', padding: '20px 22px', marginBottom: 10 }}>
      <SectionHead icon={Icon} title={title} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {visible.map(([label, value]) => <ReviewRow key={label} label={label} value={value} />)}
      </div>
    </div>
  );
}

function ReviewStep({ service, form, onBack, onSubmit, loading }) {
  // Build sections based on service
  const sections = service.value === 'NATIONAL_ID' ? [
    { title: 'Full Name', icon: User, rows: [
      ['First Name', form.firstName], ['Other Names', form.otherNames], ['Surname', form.surname],
    ]},
    { title: 'Personal Details', icon: User, rows: [
      ['Date of Birth', form.dateOfBirth], ['Sex', form.sex], ['Marital Status', form.maritalStatus],
      ['Nationality', form.nationality], ['Second Nationality', form.secondNationality],
      ['Colour of Eyes', form.colourOfEyes], ['Height (m)', form.heightMeters],
      ['Phone', form.phone], ['Birth Certificate No.', form.birthCertNo],
      ['Passport No.', form.passportNo], ['Disability/Observation', form.disability],
    ]},
    { title: 'Place of Birth', icon: MapPin, rows: [
      ['District', form.birthDistrict], ['T/A', form.birthTA], ['Village', form.birthVillage],
    ]},
    { title: 'Residential Address', icon: Home, rows: [
      ['District', form.residentialDistrict], ['T/A', form.residentialTA], ['Village/Area', form.residentialVillage],
    ]},
    { title: 'Permanent Original Home', icon: Home, rows: [
      ['District', form.permanentDistrict], ['T/A', form.permanentTA], ['Village', form.permanentVillage],
    ]},
    { title: "Mother's Details", icon: Users, rows: [
      ['Full Name', form.motherFullName], ['Nationality', form.motherNationality],
      ['ID No.', form.motherIdNo], ['District', form.motherDistrict],
      ['T/A', form.motherTA], ['Village', form.motherVillage],
    ]},
    { title: "Father's Details", icon: Users, rows: [
      ['Full Name', form.fatherFullName], ['Nationality', form.fatherNationality],
      ['ID No.', form.fatherIdNo], ['District', form.fatherDistrict],
      ['T/A', form.fatherTA], ['Village', form.fatherVillage],
    ]},
  ] : service.value === 'PASSPORT' ? [
    { title: 'Full Name', icon: User, rows: [
      ['Surname', form.surname], ['Given Names', form.givenNames], ['Maiden Name', form.maidenName],
    ]},
    { title: 'Personal Details', icon: User, rows: [
      ['Date of Birth', form.dateOfBirth], ['Place of Birth', form.placeOfBirth],
      ['Sex', form.sex], ['Nationality', form.nationality],
      ['Occupation', form.occupation], ['National ID No.', form.nationalIdNo],
      ['Height (m)', form.heightMeters], ['Eye Colour', form.eyeColour],
    ]},
    { title: 'Contact', icon: Phone, rows: [
      ['Permanent Address', form.permanentAddress], ['Phone', form.phone],
      ['Email', form.email], ['Previous Passport No.', form.previousPassportNo],
    ]},
  ] : [
    { title: 'Personal Details', icon: User, rows: [
      ['Full Name', form.fullName], ['Date of Birth', form.dateOfBirth],
      ['Sex', form.sex], ['Nationality', form.nationality],
      ['National ID No.', form.nationalIdNo],
    ]},
    { title: 'Contact & Address', icon: MapPin, rows: [
      ['Residential Address', form.residentialAddress], ['Phone', form.phone],
    ]},
    { title: 'Licence Details', icon: Car, rows: [
      ['Categories Applied', form.licenceCategories],
      ['Existing Licence No.', form.existingLicenceNo],
    ]},
  ];

  return (
    <div>
      {/* Service banner */}
      <div style={{
        background: `linear-gradient(135deg, ${service.gradStart}, ${service.gradEnd})`,
        borderRadius: 16, padding: '18px 22px', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 42, height: 42, background: 'rgba(255,255,255,0.2)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <service.icon size={20} color="white" />
        </div>
        <div>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{service.label}</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{service.agency} · {service.time} working days</p>
        </div>
      </div>

      {sections.map(s => <ReviewSection key={s.title} {...s} />)}

      {/* Warning */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 10, padding: '12px 14px', marginBottom: 18, marginTop: 4,
      }}>
        <AlertCircle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.7 }}>
          Please review all details carefully before submitting. Once submitted your application will be forwarded to the agency.
          You will receive notifications on any status updates.
        </p>
      </div>

      {/* Submit row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 12,
          padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#64748b',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
        }}>
          <ChevronLeft size={15} /> Edit
        </button>
        <button onClick={onSubmit} disabled={loading} style={{
          background: loading ? '#94a3b8' : '#0f172a',
          color: 'white', border: 'none', borderRadius: 12, padding: '12px 26px',
          fontSize: 14, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.2s',
        }}>
          <CheckCircle size={15} />
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════

export default function ApplyPage() {
  const router  = useRouter();
  const [step, setStep]       = useState(0);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(INITIAL_FORM);

  // Dynamic step labels for the progress bar
  const steps = service ? SERVICE_STEPS[service.value] : ['Service'];

  // Reset form when service changes
  const handleSelectService = (s) => {
    setService(s);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create the application record
      const appRes      = await applicationsAPI.create({ type: service.value, agencyName: service.agency });
      const applicationId = appRes.data.data.id;

      // 2. Submit the correct agency form with schema-accurate payload
      if (service.value === 'NATIONAL_ID') {
        await formsAPI.submitNrb(applicationId, {
          firstName:        form.firstName,
          otherNames:       form.otherNames       || undefined,
          surname:          form.surname,
          dateOfBirth:      form.dateOfBirth,
          sex:              form.sex,
          maritalStatus:    form.maritalStatus,
          nationality:      form.nationality      || 'Malawian',
          secondNationality: form.secondNationality || undefined,
          colourOfEyes:     form.colourOfEyes,
          heightMeters:     parseFloat(form.heightMeters),
          phone:            form.phone,
          birthCertNo:      form.birthCertNo      || undefined,
          passportNo:       form.passportNo       || undefined,
          disability:       form.disability       || undefined,
          birthDistrict:    form.birthDistrict,
          birthTA:          form.birthTA,
          birthVillage:     form.birthVillage,
          residentialDistrict: form.residentialDistrict,
          residentialTA:    form.residentialTA,
          residentialVillage: form.residentialVillage,
          permanentDistrict: form.permanentDistrict,
          permanentTA:      form.permanentTA,
          permanentVillage: form.permanentVillage,
          motherFullName:   form.motherFullName,
          motherNationality: form.motherNationality || 'Malawian',
          motherIdNo:       form.motherIdNo       || undefined,
          motherDistrict:   form.motherDistrict,
          motherTA:         form.motherTA         || undefined,
          motherVillage:    form.motherVillage    || undefined,
          fatherFullName:   form.fatherFullName,
          fatherNationality: form.fatherNationality || 'Malawian',
          fatherIdNo:       form.fatherIdNo       || undefined,
          fatherDistrict:   form.fatherDistrict,
          fatherTA:         form.fatherTA         || undefined,
          fatherVillage:    form.fatherVillage    || undefined,
        });

      } else if (service.value === 'PASSPORT') {
        await formsAPI.submitImmigration(applicationId, {
          surname:           form.surname,
          givenNames:        form.givenNames,
          maidenName:        form.maidenName        || undefined,
          dateOfBirth:       form.dateOfBirth,
          placeOfBirth:      form.placeOfBirth,
          sex:               form.sex,
          nationality:       form.nationality       || 'Malawian',
          occupation:        form.occupation,
          nationalIdNo:      form.nationalIdNo,
          heightMeters:      parseFloat(form.heightMeters),
          eyeColour:         form.eyeColour,
          permanentAddress:  form.permanentAddress,
          phone:             form.phone,
          email:             form.email             || undefined,
          previousPassportNo: form.previousPassportNo || undefined,
        });

      } else {
        // DRIVING_LICENCE
        await formsAPI.submitDrtss(applicationId, {
          fullName:          form.fullName,
          dateOfBirth:       form.dateOfBirth,
          sex:               form.sex,
          nationality:       form.nationality       || 'Malawian',
          nationalIdNo:      form.nationalIdNo,
          residentialAddress: form.residentialAddress,
          phone:             form.phone,
          licenceCategories: form.licenceCategories,
          existingLicenceNo: form.existingLicenceNo || undefined,
        });
      }

      toast.success('Application submitted successfully!');
      router.push('/dashboard/track');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render current step based on service & step index ──
  const renderStep = () => {
    // Step 0 is always service selection
    if (step === 0) {
      return (
        <ServiceStep
          selected={service}
          onSelect={handleSelectService}
          onNext={() => setStep(1)}
        />
      );
    }

    // ── NRB ─────────────────────────────────────────────
    if (service.value === 'NATIONAL_ID') {
      if (step === 1) return <NrbStep1Personal  service={service} form={form} onChange={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />;
      if (step === 2) return <NrbStep2Address   service={service} form={form} onChange={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />;
      if (step === 3) return <NrbStep3Parents   service={service} form={form} onChange={setForm} onNext={() => setStep(4)} onBack={() => setStep(2)} />;
      if (step === 4) return <ReviewStep service={service} form={form} onBack={() => setStep(3)} onSubmit={handleSubmit} loading={loading} />;
    }

    // ── Immigration ──────────────────────────────────────
    if (service.value === 'PASSPORT') {
      if (step === 1) return <ImmStep1Personal  service={service} form={form} onChange={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />;
      if (step === 2) return <ImmStep2Contact   service={service} form={form} onChange={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />;
      if (step === 3) return <ReviewStep service={service} form={form} onBack={() => setStep(2)} onSubmit={handleSubmit} loading={loading} />;
    }

    // ── DRTSS ────────────────────────────────────────────
    if (service.value === 'DRIVING_LICENCE') {
      if (step === 1) return <DrtssStep1Personal service={service} form={form} onChange={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />;
      if (step === 2) return <DrtssStep2Licence  service={service} form={form} onChange={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />;
      if (step === 3) return <ReviewStep service={service} form={form} onBack={() => setStep(2)} onSubmit={handleSubmit} loading={loading} />;
    }
  };

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2d8a63', fontWeight: 700, marginBottom: 5 }}>
            Citizen Services
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0d3b2e', marginBottom: 4 }}>
            New Application
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>
            Select a service below and complete the required form. All fields marked <span style={{ color: '#ef4444' }}>*</span> are required.
          </p>
        </div>

        {/* Step progress bar */}
        <StepBar steps={steps} current={step} />

        {/* Active step content */}
        {renderStep()}
      </div>
    </DashboardLayout>
  );
}