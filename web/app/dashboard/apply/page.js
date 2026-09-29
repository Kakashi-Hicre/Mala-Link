'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicationsAPI, formsAPI } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Globe, Car, CheckCircle, ChevronRight, ChevronLeft,
  User, MapPin, Phone, FileText, AlertCircle, Users, Home,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════
// NOTE: `value` fields below are data/option codes sent to the backend and
// must stay in English. Only `labelKey`/`descKey` (resolved with t() at
// render time) carry translated display text.

const SERVICES = [
  {
    value: 'NATIONAL_ID',
    labelKey: 'applyForm.service.nationalId.label',
    agency: 'NRB',
    icon: CreditCard,
    descKey: 'applyForm.service.nationalId.desc',
    time: '5–10',
    gradStart: '#0b82f6',
    gradEnd: '#4f46e5',
  },
  {
    value: 'PASSPORT',
    labelKey: 'service.passport',
    agency: 'IMMIGRATION',
    icon: Globe,
    descKey: 'applyForm.service.passport.desc',
    time: '10–15',
    gradStart: '#007336',
    gradEnd: '#1fb981',
  },
  {
    value: 'DRIVING_LICENCE',
    labelKey: 'service.licence',
    agency: 'DRTSS',
    icon: Car,
    descKey: 'applyForm.service.licence.desc',
    time: '7–12',
    gradStart: '#a87516',
    gradEnd: '#f59e0b',
  },
];

// Steps per service — index 0 is always "Service" (the selection screen)
const SERVICE_STEPS = {
  NATIONAL_ID:     ['applyForm.step.service', 'applyForm.step.personalInfo', 'applyForm.step.birthAddress', 'applyForm.step.parents', 'applyForm.step.reviewShort'],
  PASSPORT:        ['applyForm.step.service', 'applyForm.step.personalInfo', 'applyForm.step.contact', 'applyForm.step.reviewShort'],
  DRIVING_LICENCE: ['applyForm.step.service', 'applyForm.step.personalInfo', 'applyForm.step.licenceDetails', 'applyForm.step.reviewShort'],
};

const DISTRICTS = [
  'Balaka','Blantyre','Chikwawa','Chiradzulu','Chitipa','Dedza','Dowa',
  'Karonga','Kasungu','Lilongwe','Machinga','Mangochi','Mchinji','Mulanje',
  'Mwanza','Mzimba','Neno','Nkhata Bay','Nkhotakota','Nsanje','Ntcheu',
  'Ntchisi','Phalombe','Rumphi','Salima','Thyolo','Zomba',
];

const MARITAL_STATUS = [
  { value: 'NEVER_MARRIED', labelKey: 'applyForm.marital.neverMarried' },
  { value: 'MARRIED',       labelKey: 'applyForm.marital.married' },
  { value: 'DIVORCED',      labelKey: 'applyForm.marital.divorced' },
  { value: 'WIDOWED',       labelKey: 'applyForm.marital.widowed' },
  { value: 'SEPARATED',     labelKey: 'applyForm.marital.separated' },
  { value: 'ABANDONED',     labelKey: 'applyForm.marital.abandoned' },
];

const SEX_OPTIONS = [
  { value: 'MALE',   labelKey: 'form.sex.male' },
  { value: 'FEMALE', labelKey: 'form.sex.female' },
];

const LICENCE_CATEGORIES = [
  { value: 'A',  labelKey: 'applyForm.licence.a' },
  { value: 'B',  labelKey: 'applyForm.licence.b' },
  { value: 'C1', labelKey: 'applyForm.licence.c1' },
  { value: 'C',  labelKey: 'applyForm.licence.c' },
  { value: 'D1', labelKey: 'applyForm.licence.d1' },
  { value: 'D',  labelKey: 'applyForm.licence.d' },
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
  const { t } = useTranslation();
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <select
        name={name} value={value} onChange={onChange}
        style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' }}
        onFocus={e => (e.target.style.borderColor = '#f59e0b')}
        onBlur={e  => (e.target.style.borderColor = '#cbd5e1')}
      >
        <option value="">{t('applyForm.select.placeholder')}</option>
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.value;
          const lbl = typeof o === 'string' ? o : t(o.labelKey);
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
  const { t } = useTranslation();
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
          const lbl     = typeof o === 'string' ? o : t(o.labelKey);
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
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32 }}>
      {steps.map((labelKey, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={labelKey} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? 1 : 'none' }}>
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
                {t(labelKey)}
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

function NavButtons({ onBack, onNext, nextLabelKey = 'apply.continue', nextDisabled = false, loading = false }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 12,
        padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#64748b',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
      }}>
        <ChevronLeft size={15} /> {t('apply.back')}
      </button>
      <button onClick={onNext} disabled={nextDisabled || loading} style={{
        background: (nextDisabled || loading) ? '#e2e8f0' : '#f59e0b',
        color:      (nextDisabled || loading) ? '#94a3b8' : '#0f172a',
        border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700,
        cursor: (nextDisabled || loading) ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'all 0.2s',
      }}>
        {loading ? t('common.loading') : t(nextLabelKey)} {!loading && <ChevronRight size={15} />}
      </button>
    </div>
  );
}

// ── Service pill (shown at top of each form step) ─────────

function ServicePill({ service }) {
  const { t } = useTranslation();
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
        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{t(service.labelKey)}</p>
        <p style={{ fontSize: 11, color: '#64748b' }}>{t('service.via')} {service.agency} · {service.time} {t('service.days')}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 0 — Service Selection
// ═══════════════════════════════════════════════════════════

function ServiceStep({ selected, onSelect, onNext }) {
  const { t } = useTranslation();
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
                <p style={{ color: 'white', fontWeight: 800, fontSize: 15, position: 'relative', zIndex: 1 }}>{t(s.labelKey)}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, position: 'relative', zIndex: 1 }}>{t('service.via')} {s.agency}</p>
              </div>
              {/* Card body */}
              <div style={{ padding: '14px 18px', position: 'relative' }}>
                {active && <CheckCircle size={16} color="#f59e0b" style={{ position: 'absolute', top: 12, right: 12 }} />}
                <p style={{ color: '#54585d', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{t(s.descKey)}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>⏱ {s.time} {t('service.days')}</p>
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
          {t('apply.continue')} <ChevronRight size={15} />
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
  const { t } = useTranslation();
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
        <SectionHead icon={User} title={t('form.fullname')} />
        <Grid>
          <TextInput label={t('applyForm.field.firstName')} name="firstName" value={form.firstName} onChange={set} placeholder={t('applyForm.ph.firstName')} required />
          <TextInput label={t('applyForm.field.surname')} name="surname" value={form.surname} onChange={set} placeholder={t('applyForm.ph.surname')} required />
          <FullCol>
            <TextInput label={t('applyForm.field.otherNames')} name="otherNames" value={form.otherNames} onChange={set} placeholder={t('applyForm.ph.otherNames')} hint={t('applyForm.hint.leaveBlank')} />
          </FullCol>
        </Grid>

        <Divider />

        {/* Personal Details */}
        <SectionHead icon={User} title={t('applyForm.section.personalDetails')} />
        <Grid>
          <DateInput label={t('form.dob')} name="dateOfBirth" value={form.dateOfBirth} onChange={set} required />
          <SelectInput label={t('form.sex')} name="sex" value={form.sex} onChange={set} options={SEX_OPTIONS} required />
          <SelectInput label={t('applyForm.field.maritalStatus')} name="maritalStatus" value={form.maritalStatus} onChange={set} options={MARITAL_STATUS} required />
          <TextInput label={t('applyForm.field.nationality')} name="nationality" value={form.nationality} onChange={set} placeholder={t('applyForm.ph.malawian')} />
          <TextInput label={t('applyForm.field.secondNationality')} name="secondNationality" value={form.secondNationality} onChange={set} placeholder={t('applyForm.ph.secondNationality')} />
          <TextInput label={t('applyForm.field.colourOfEyes')} name="colourOfEyes" value={form.colourOfEyes} onChange={set} placeholder={t('applyForm.ph.eyeColourExample')} required />
          <TextInput label={t('applyForm.field.heightMeters')} name="heightMeters" type="number" value={form.heightMeters} onChange={set} placeholder={t('applyForm.ph.heightExample')} required />
          <TextInput label={t('form.phone')} name="phone" type="tel" value={form.phone} onChange={set} placeholder={t('auth.phone.placeholder')} required />
          <TextInput label={t('applyForm.field.birthCertNo')} name="birthCertNo" value={form.birthCertNo} onChange={set} placeholder={t('applyForm.ph.optional')} hint={t('applyForm.hint.ifAvailable')} />
          <TextInput label={t('applyForm.field.passportNo')} name="passportNo" value={form.passportNo} onChange={set} placeholder={t('applyForm.ph.optional')} hint={t('applyForm.hint.ifApplicable')} />
          <FullCol>
            <TextInput label={t('applyForm.field.disability')} name="disability" value={form.disability} onChange={set} placeholder={t('applyForm.ph.disability')} />
          </FullCol>
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function NrbStep2Address({ service, form, onChange, onNext, onBack }) {
  const { t } = useTranslation();
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
        <SectionHead icon={MapPin} title={t('form.pob')} />
        <Grid>
          <SelectInput label={t('applyForm.field.birthDistrict')} name="birthDistrict" value={form.birthDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label={t('applyForm.field.ta')} name="birthTA" value={form.birthTA} onChange={set} placeholder={t('applyForm.ph.taKalolo')} required />
          <FullCol>
            <TextInput label={t('applyForm.field.birthVillage')} name="birthVillage" value={form.birthVillage} onChange={set} placeholder={t('applyForm.ph.villageBirthExample')} required />
          </FullCol>
        </Grid>

        <Divider />

        {/* Residential Address */}
        <SectionHead icon={Home} title={t('applyForm.section.residentialAddr')} />
        <Grid>
          <SelectInput label={t('applyForm.field.residentialDistrict')} name="residentialDistrict" value={form.residentialDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label={t('applyForm.field.ta')} name="residentialTA" value={form.residentialTA} onChange={set} placeholder={t('applyForm.ph.taMwansambo')} required />
          <FullCol>
            <TextInput label={t('applyForm.field.villageArea')} name="residentialVillage" value={form.residentialVillage} onChange={set} placeholder={t('applyForm.ph.villageAreaExample')} required />
          </FullCol>
        </Grid>

        <Divider />

        {/* Permanent Home */}
        <SectionHead icon={Home} title={t('applyForm.section.permanentHome')} />
        <Grid>
          <SelectInput label={t('applyForm.field.permanentDistrict')} name="permanentDistrict" value={form.permanentDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label={t('applyForm.field.ta')} name="permanentTA" value={form.permanentTA} onChange={set} placeholder={t('applyForm.ph.taKyungu')} required />
          <FullCol>
            <TextInput label={t('applyForm.field.village')} name="permanentVillage" value={form.permanentVillage} onChange={set} placeholder={t('applyForm.ph.villageExample')} required />
          </FullCol>
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function NrbStep3Parents({ service, form, onChange, onNext, onBack }) {
  const { t } = useTranslation();
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.motherFullName?.trim() && form.motherDistrict &&
    form.fatherFullName?.trim() && form.fatherDistrict;

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        {/* Mother */}
        <SectionHead icon={Users} title={t('applyForm.section.motherDetails')} />
        <Grid>
          <FullCol>
            <TextInput label={t('applyForm.field.motherFullName')} name="motherFullName" value={form.motherFullName} onChange={set} placeholder={t('applyForm.ph.motherNameExample')} required />
          </FullCol>
          <TextInput label={t('applyForm.field.motherNationality')} name="motherNationality" value={form.motherNationality} onChange={set} placeholder={t('applyForm.ph.malawian')} />
          <TextInput label={t('applyForm.field.motherIdNo')} name="motherIdNo" value={form.motherIdNo} onChange={set} placeholder={t('applyForm.ph.optional')} hint={t('applyForm.hint.ifKnown')} />
          <SelectInput label={t('applyForm.field.motherDistrict')} name="motherDistrict" value={form.motherDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label={t('applyForm.field.motherTA')} name="motherTA" value={form.motherTA} onChange={set} placeholder={t('applyForm.ph.optional')} />
          <FullCol>
            <TextInput label={t('applyForm.field.motherVillage')} name="motherVillage" value={form.motherVillage} onChange={set} placeholder={t('applyForm.ph.optional')} />
          </FullCol>
        </Grid>

        <Divider />

        {/* Father */}
        <SectionHead icon={Users} title={t('applyForm.section.fatherDetails')} />
        <Grid>
          <FullCol>
            <TextInput label={t('applyForm.field.fatherFullName')} name="fatherFullName" value={form.fatherFullName} onChange={set} placeholder={t('applyForm.ph.fatherNameExample')} required />
          </FullCol>
          <TextInput label={t('applyForm.field.fatherNationality')} name="fatherNationality" value={form.fatherNationality} onChange={set} placeholder={t('applyForm.ph.malawian')} />
          <TextInput label={t('applyForm.field.fatherIdNo')} name="fatherIdNo" value={form.fatherIdNo} onChange={set} placeholder={t('applyForm.ph.optional')} hint={t('applyForm.hint.ifKnown')} />
          <SelectInput label={t('applyForm.field.fatherDistrict')} name="fatherDistrict" value={form.fatherDistrict} onChange={set} options={DISTRICTS} required />
          <TextInput label={t('applyForm.field.fatherTA')} name="fatherTA" value={form.fatherTA} onChange={set} placeholder={t('applyForm.ph.optional')} />
          <FullCol>
            <TextInput label={t('applyForm.field.fatherVillage')} name="fatherVillage" value={form.fatherVillage} onChange={set} placeholder={t('applyForm.ph.optional')} />
          </FullCol>
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextLabelKey="apply.step.review" nextDisabled={!isValid} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// IMMIGRATION — Passport
// Steps: Personal Info → Contact → Review
// ═══════════════════════════════════════════════════════════

function ImmStep1Personal({ service, form, onChange, onNext, onBack }) {
  const { t } = useTranslation();
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
        <SectionHead icon={User} title={t('form.fullname')} />
        <Grid>
          <TextInput label={t('applyForm.field.surname')} name="surname" value={form.surname} onChange={set} placeholder={t('applyForm.ph.surname')} required />
          <TextInput label={t('applyForm.field.givenNames')} name="givenNames" value={form.givenNames} onChange={set} placeholder={t('applyForm.ph.givenNamesExample')} required />
          <FullCol>
            <TextInput label={t('applyForm.field.maidenName')} name="maidenName" value={form.maidenName} onChange={set}
              placeholder={t('applyForm.ph.maidenNameHint')}
              hint={t('applyForm.hint.marriedWomenNote')} />
          </FullCol>
        </Grid>

        <Divider />

        {/* Personal Details */}
        <SectionHead icon={User} title={t('applyForm.section.personalDetails')} />
        <Grid>
          <DateInput label={t('form.dob')} name="dateOfBirth" value={form.dateOfBirth} onChange={set} required />
          <TextInput label={t('form.pob')} name="placeOfBirth" value={form.placeOfBirth} onChange={set} placeholder={t('applyForm.ph.placeOfBirthExample')} required />
          <SelectInput label={t('form.sex')} name="sex" value={form.sex} onChange={set} options={SEX_OPTIONS} required />
          <TextInput label={t('applyForm.field.nationality')} name="nationality" value={form.nationality} onChange={set} placeholder={t('applyForm.ph.malawian')} />
          <TextInput label={t('applyForm.field.occupation')} name="occupation" value={form.occupation} onChange={set} placeholder={t('applyForm.ph.occupationExample')} required />
          <TextInput label={t('applyForm.field.nationalIdNo')} name="nationalIdNo" value={form.nationalIdNo} onChange={set}
            placeholder={t('applyForm.ph.nidHint')} required
            hint={t('applyForm.hint.mustPresentAgency')} />
        </Grid>

        <Divider />

        {/* Physical Features */}
        <SectionHead icon={User} title={t('applyForm.section.physicalFeatures')} />
        <Grid>
          <TextInput label={t('applyForm.field.heightMeters')} name="heightMeters" type="number" value={form.heightMeters} onChange={set} placeholder={t('applyForm.ph.heightExample')} required />
          <TextInput label={t('applyForm.field.eyeColour')} name="eyeColour" value={form.eyeColour} onChange={set} placeholder={t('applyForm.ph.eyeColourExample')} required />
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function ImmStep2Contact({ service, form, onChange, onNext, onBack }) {
  const { t } = useTranslation();
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid = form.permanentAddress?.trim() && form.phone?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        <SectionHead icon={Phone} title={t('applyForm.section.contactInfo')} />
        <Grid>
          <FullCol>
            <TextInput label={t('applyForm.field.permanentAddress')} name="permanentAddress" value={form.permanentAddress} onChange={set}
              placeholder={t('applyForm.ph.permanentAddrExample')} required />
          </FullCol>
          <TextInput label={t('form.phone')} name="phone" type="tel" value={form.phone} onChange={set} placeholder={t('auth.phone.placeholder')} required />
          <TextInput label={t('applyForm.field.emailAddress')} name="email" type="email" value={form.email} onChange={set} placeholder={t('applyForm.ph.emailExample')} hint={t('applyForm.ph.optional')} />
        </Grid>

        <Divider />

        {/* Renewal */}
        <SectionHead icon={FileText} title={t('applyForm.section.renewalInfo')} />
        <TextInput label={t('applyForm.field.previousPassportNo')} name="previousPassportNo" value={form.previousPassportNo} onChange={set}
          placeholder={t('applyForm.ph.previousPassportExample')}
          hint={t('applyForm.hint.renewalOnly')} />
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextLabelKey="apply.step.review" nextDisabled={!isValid} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DRTSS — Driver's Licence
// Steps: Personal Info → Licence Details → Review
// ═══════════════════════════════════════════════════════════

function DrtssStep1Personal({ service, form, onChange, onNext, onBack }) {
  const { t } = useTranslation();
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.fullName?.trim() && form.dateOfBirth && form.sex &&
    form.nationalIdNo?.trim() && form.residentialAddress?.trim() && form.phone?.trim();

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        <SectionHead icon={User} title={t('applyForm.section.personalDetails')} />
        <Grid>
          <FullCol>
            <TextInput label={t('form.fullname')} name="fullName" value={form.fullName} onChange={set} placeholder={t('applyForm.ph.fullNameExample')} required />
          </FullCol>
          <DateInput label={t('form.dob')} name="dateOfBirth" value={form.dateOfBirth} onChange={set} required />
          <SelectInput label={t('form.sex')} name="sex" value={form.sex} onChange={set} options={SEX_OPTIONS} required />
          <TextInput label={t('applyForm.field.nationality')} name="nationality" value={form.nationality} onChange={set} placeholder={t('applyForm.ph.malawian')} />
          <FullCol>
            <TextInput label={t('applyForm.field.nationalIdNo')} name="nationalIdNo" value={form.nationalIdNo} onChange={set}
              placeholder={t('applyForm.ph.nidHint')} required
              hint={t('applyForm.hint.mustPresentDrtss')} />
          </FullCol>
        </Grid>

        <Divider />

        <SectionHead icon={MapPin} title={t('applyForm.section.contactAddress')} />
        <Grid>
          <FullCol>
            <TextInput label={t('applyForm.field.residentialAddress')} name="residentialAddress" value={form.residentialAddress} onChange={set}
              placeholder={t('applyForm.ph.residentialAddrExample')} required />
          </FullCol>
          <TextInput label={t('form.phone')} name="phone" type="tel" value={form.phone} onChange={set} placeholder={t('auth.phone.placeholder')} required />
        </Grid>
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
    </div>
  );
}

function DrtssStep2Licence({ service, form, onChange, onNext, onBack }) {
  const { t } = useTranslation();
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });
  const isValid = form.licenceCategories?.length > 0;

  return (
    <div>
      <ServicePill service={service} />
      <FormCard>
        <SectionHead icon={Car} title={t('applyForm.section.licenceCategories')} />
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 18 }}>
          {t('applyForm.licence.instructions')}
        </p>
        <CheckboxGroup
          label={t('applyForm.field.selectCategories')}
          name="licenceCategories"
          options={LICENCE_CATEGORIES}
          value={form.licenceCategories || []}
          onChange={e => onChange({ ...form, licenceCategories: e.target.value })}
          required
        />

        <Divider />

        <SectionHead icon={FileText} title={t('applyForm.section.renewalInfo')} />
        <TextInput label={t('applyForm.field.existingLicenceNo')} name="existingLicenceNo" value={form.existingLicenceNo} onChange={set}
          placeholder={t('applyForm.ph.existingLicenceExample')}
          hint={t('applyForm.hint.renewalOnly')} />
      </FormCard>
      <NavButtons onBack={onBack} onNext={onNext} nextLabelKey="apply.step.review" nextDisabled={!isValid} />
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
  const { t } = useTranslation();

  // Build sections based on service — row labels are resolved with t()
  // right here, since ReviewRow/ReviewSection just render plain strings.
  const sections = service.value === 'NATIONAL_ID' ? [
    { title: t('form.fullname'), icon: User, rows: [
      [t('applyForm.field.firstName'), form.firstName], [t('applyForm.field.otherNames'), form.otherNames], [t('applyForm.field.surname'), form.surname],
    ]},
    { title: t('applyForm.section.personalDetails'), icon: User, rows: [
      [t('form.dob'), form.dateOfBirth], [t('form.sex'), form.sex], [t('applyForm.field.maritalStatus'), form.maritalStatus],
      [t('applyForm.field.nationality'), form.nationality], [t('applyForm.field.secondNationality'), form.secondNationality],
      [t('applyForm.field.colourOfEyes'), form.colourOfEyes], [t('applyForm.review.heightShort'), form.heightMeters],
      [t('applyForm.review.phone'), form.phone], [t('applyForm.field.birthCertNo'), form.birthCertNo],
      [t('applyForm.field.passportNo'), form.passportNo], [t('applyForm.field.disability'), form.disability],
    ]},
    { title: t('form.pob'), icon: MapPin, rows: [
      [t('form.district'), form.birthDistrict], [t('applyForm.review.ta'), form.birthTA], [t('applyForm.field.village'), form.birthVillage],
    ]},
    { title: t('applyForm.section.residentialAddr'), icon: Home, rows: [
      [t('form.district'), form.residentialDistrict], [t('applyForm.review.ta'), form.residentialTA], [t('applyForm.field.villageArea'), form.residentialVillage],
    ]},
    { title: t('applyForm.section.permanentHome'), icon: Home, rows: [
      [t('form.district'), form.permanentDistrict], [t('applyForm.review.ta'), form.permanentTA], [t('applyForm.field.village'), form.permanentVillage],
    ]},
    { title: t('applyForm.section.motherDetails'), icon: Users, rows: [
      [t('form.fullname'), form.motherFullName], [t('applyForm.field.motherNationality'), form.motherNationality],
      [t('applyForm.review.idNo'), form.motherIdNo], [t('form.district'), form.motherDistrict],
      [t('applyForm.review.ta'), form.motherTA], [t('applyForm.field.village'), form.motherVillage],
    ]},
    { title: t('applyForm.section.fatherDetails'), icon: Users, rows: [
      [t('form.fullname'), form.fatherFullName], [t('applyForm.field.fatherNationality'), form.fatherNationality],
      [t('applyForm.review.idNo'), form.fatherIdNo], [t('form.district'), form.fatherDistrict],
      [t('applyForm.review.ta'), form.fatherTA], [t('applyForm.field.village'), form.fatherVillage],
    ]},
  ] : service.value === 'PASSPORT' ? [
    { title: t('form.fullname'), icon: User, rows: [
      [t('applyForm.field.surname'), form.surname], [t('applyForm.field.givenNames'), form.givenNames], [t('applyForm.field.maidenName'), form.maidenName],
    ]},
    { title: t('applyForm.section.personalDetails'), icon: User, rows: [
      [t('form.dob'), form.dateOfBirth], [t('form.pob'), form.placeOfBirth],
      [t('form.sex'), form.sex], [t('applyForm.field.nationality'), form.nationality],
      [t('applyForm.field.occupation'), form.occupation], [t('applyForm.field.nationalIdNo'), form.nationalIdNo],
      [t('applyForm.review.heightShort'), form.heightMeters], [t('applyForm.field.eyeColour'), form.eyeColour],
    ]},
    { title: t('applyForm.step.contact'), icon: Phone, rows: [
      [t('applyForm.field.permanentAddress'), form.permanentAddress], [t('applyForm.review.phone'), form.phone],
      [t('applyForm.review.email'), form.email], [t('applyForm.review.prevPassportNo'), form.previousPassportNo],
    ]},
  ] : [
    { title: t('applyForm.section.personalDetails'), icon: User, rows: [
      [t('form.fullname'), form.fullName], [t('form.dob'), form.dateOfBirth],
      [t('form.sex'), form.sex], [t('applyForm.field.nationality'), form.nationality],
      [t('applyForm.field.nationalIdNo'), form.nationalIdNo],
    ]},
    { title: t('applyForm.section.contactAddress'), icon: MapPin, rows: [
      [t('applyForm.field.residentialAddress'), form.residentialAddress], [t('applyForm.review.phone'), form.phone],
    ]},
    { title: t('applyForm.step.licenceDetails'), icon: Car, rows: [
      [t('applyForm.review.categoriesApplied'), form.licenceCategories],
      [t('applyForm.review.existingLicenceNo'), form.existingLicenceNo],
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
          <p style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{t(service.labelKey)}</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{service.agency} · {service.time} {t('service.days')}</p>
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
          {t('applyForm.review.warning')}
        </p>
      </div>

      {/* Submit row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 12,
          padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#64748b',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
        }}>
          <ChevronLeft size={15} /> {t('applyForm.editBtn')}
        </button>
        <button onClick={onSubmit} disabled={loading} style={{
          background: loading ? '#94a3b8' : '#0f172a',
          color: 'white', border: 'none', borderRadius: 12, padding: '12px 26px',
          fontSize: 14, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.2s',
        }}>
          <CheckCircle size={15} />
          {loading ? t('applyForm.submitting') : t('apply.submit.btn')}
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
  const { t }   = useTranslation();
  const [step, setStep]       = useState(0);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(INITIAL_FORM);

  // Dynamic step labels for the progress bar
  const steps = service ? SERVICE_STEPS[service.value] : ['applyForm.step.service'];

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

      toast.success(t('applyForm.toast.success'));
      router.push('/dashboard/track');
    } catch (err) {
      toast.error(err.response?.data?.message || t('applyForm.toast.failure'));
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
            {t('applyForm.header.eyebrow')}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0d3b2e', marginBottom: 4 }}>
            {t('dash.newApplication')}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>
            {t('applyForm.header.helper1')} <span style={{ color: '#ef4444' }}>*</span> {t('applyForm.header.helper2')}
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
