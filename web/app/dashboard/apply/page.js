'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Globe, Car, CheckCircle,
  ChevronRight, ChevronLeft, User, MapPin,
  Phone, FileText, AlertCircle, Heart,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

// ── Services ──────────────────────────────────────────────
const SERVICES = [
  {
    value:  'NATIONAL_ID',
    label:  'service.national.id',
    agency: 'NRB',
    icon:   CreditCard,
    desc:   'land.service.id.desc',
    time:   '5–10',
    gradStart: '#0b82f6', gradEnd: '#4f46e5',
  },
  {
    value:  'PASSPORT',
    label:  'service.passport',
    agency: 'IMMIGRATION',
    icon:   Globe,
    desc:   'land.service.passport.desc',
    time:   '10–15',
    gradStart: '#007336', gradEnd: '#1fb981',
  },
  {
    value:  'DRIVING_LICENCE',
    label:  'service.licence',
    agency: 'DRTSS',
    icon:   Car,
    desc:   'land.service.licence.desc',
    time:   '7–12',
    gradStart: '#a87516', gradEnd: '#f59e0b',
  },
];

const STEP_KEYS = ['apply.step.service', 'apply.step.personal', 'apply.step.kin', 'apply.step.review'];

const DISTRICTS = [
  'Balaka','Blantyre','Chikwawa','Chiradzulu','Chitipa',
  'Dedza','Dowa','Karonga','Kasungu','Lilongwe',
  'Machinga','Mangochi','Mchinji','Mulanje','Mwanza',
  'Mzimba','Neno','Nkhata Bay','Nkhotakota','Nsanje',
  'Ntcheu','Ntchisi','Phalombe','Rumphi','Salima',
  'Thyolo','Zomba',
];

// ── Field components ──────────────────────────────────────
const inputStyle = {
  width: '100%',
  background: 'white',
  border: '2px solid #76808b',
  borderRadius: 12,
  padding: '13px 14px',
  fontSize: 15,
  color: '#0f172a',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

function FieldLabel({ children, required }) {
  return (
    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#0f172a', marginBottom:6 }}>
      {children}{required && <span style={{ color:'#f59e0b', marginLeft:3 }}>*</span>}
    </label>
  );
}

function TextInput({ label, name, type = 'text', value, onChange, placeholder, required, hint }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required} style={inputStyle}
        onFocus={e => e.target.style.borderColor = '#f59e0b'}
        onBlur={e  => e.target.style.borderColor = '#76808b'}/>
      {hint && <p style={{ fontSize:11, color:'#163151', marginTop:4 }}>{hint}</p>}
    </div>
  );
}

function SelectInput({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select name={name} value={value} onChange={onChange} style={{ ...inputStyle, cursor:'pointer' }}
        onFocus={e => e.target.style.borderColor = '#f59e0b'}
        onBlur={e  => e.target.style.borderColor = '#e2e8f0'}>
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

// ── Step bar ──────────────────────────────────────────────
function StepBar({ current, t }) {
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
      {STEP_KEYS.map((key, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={key} style={{ display:'flex', alignItems:'center', flex: i < STEP_KEYS.length - 1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', fontSize:13, fontWeight:800,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: done ? '#0f172a' : active ? '#f59e0b' : '#f1f5f9',
                color:      done ? 'white'   : active ? '#0f172a' : '#94a3b8',
                boxShadow:  active ? '0 0 0 4px #fef3c7' : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <p style={{
                fontSize:11, fontWeight:600, marginTop:5, whiteSpace:'nowrap',
                color: active ? '#0f172a' : done ? '#64748b' : '#94a3b8',
              }}>{t(key)}</p>
            </div>
            {i < STEP_KEYS.length - 1 && (
              <div style={{
                flex:1, height:2, margin:'0 6px', marginBottom:18,
                background: i < current ? '#0f172a' : '#e2e8f0',
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionHead({ icon: Icon, title }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:28, height:28, background:'#0f172a', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={13} color="#f59e0b"/>
      </div>
      <p style={{ fontSize:11, fontWeight:700, color:'#0f172a', letterSpacing:'0.08em', textTransform:'uppercase' }}>
        {title}
      </p>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel, nextDisabled = false, loading = false, t }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
      <button onClick={onBack} style={{
        background:'transparent', border:'1.5px solid #e2e8f0', borderRadius:12,
        padding:'12px 20px', fontSize:14, fontWeight:600, color:'#64748b',
        cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
      }}>
        <ChevronLeft size={15}/> {t('apply.back')}
      </button>
      <button onClick={onNext} disabled={nextDisabled || loading} style={{
        background: (nextDisabled || loading) ? '#e2e8f0' : '#f59e0b',
        color:      (nextDisabled || loading) ? '#94a3b8' : '#0f172a',
        border:'none', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:700,
        cursor: (nextDisabled || loading) ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', gap:6, fontFamily:'inherit', transition:'all 0.2s',
      }}>
        {loading ? t('common.loading') : nextLabel} {!loading && <ChevronRight size={15}/>}
      </button>
    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────
function Step1({ selected, onSelect, onNext, t }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14, marginBottom:24 }}>
        {SERVICES.map(s => {
          const Icon   = s.icon;
          const active = selected?.value === s.value;
          return (
            <button key={s.value} onClick={() => onSelect(s)} style={{
              textAlign:'left', borderRadius:16,
              border: active ? '2px solid #f59e0b' : '2px solid #e2e8f0',
              overflow:'hidden', cursor:'pointer', background:'white', padding:0,
              transform: active ? 'scale(1.02)' : 'scale(1)',
              boxShadow: active ? '0 6px 24px rgba(245,158,11,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition:'all 0.2s',
            }}>
              <div style={{
                padding:'20px 18px 16px',
                background:`linear-gradient(135deg, ${s.gradStart}, ${s.gradEnd})`,
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', right:-12, top:-12, width:56, height:56, background:'rgba(255,255,255,0.12)', borderRadius:'50%' }}/>
                <Icon size={24} color="white" style={{ marginBottom:8, position:'relative', zIndex:1 }}/>
                <p style={{ color:'white', fontWeight:800, fontSize:15, position:'relative', zIndex:1 }}>{t(s.label)}</p>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:11, position:'relative', zIndex:1 }}>{t('service.via')} {s.agency}</p>
              </div>
              <div style={{ padding:'14px 18px', position:'relative' }}>
                {active && <CheckCircle size={16} color="#f59e0b" style={{ position:'absolute', top:12, right:12 }}/>}
                <p style={{ color:'#54585d', fontSize:13, lineHeight:1.55, marginBottom:6 }}>{t(s.desc)}</p>
                <p style={{ fontSize:11, fontWeight:700, color:'#64748b' }}>⏱ {s.time} {t('service.days')}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button onClick={onNext} disabled={!selected} style={{
          background: selected ? '#f59e0b' : '#e2e8f0', color: selected ? '#0f172a' : '#94a3b8',
          border:'none', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:700,
          cursor: selected ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:6,
          fontFamily:'inherit', transition:'all 0.2s',
        }}>
          {t('apply.continue')} <ChevronRight size={15}/>
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Personal Details ──────────────────────────────
function Step2({ service, form, onChange, onNext, onBack, t }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.fullName?.trim() &&
    form.dateOfBirth &&
    form.sex &&
    form.placeOfBirth?.trim() &&
    form.district &&
    form.physicalAddress?.trim() &&
    form.phone?.trim();

  return (
    <div>
      {/* Service pill */}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', marginBottom:20 }}>
        <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg, ${service.gradStart}, ${service.gradEnd})` }}>
          <service.icon size={16} color="white"/>
        </div>
        <div>
          <p style={{ fontWeight:700, color:'#0f172a', fontSize:13 }}>{t(service.label)}</p>
          <p style={{ fontSize:11, color:'#64748b' }}>{t('service.via')} {service.agency} · {service.time} {t('service.days')}</p>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:'24px 24px 20px' }}>

        {/* Personal info */}
        <SectionHead icon={User} title={t('form.personal')} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <TextInput
              label={t('form.fullname')} name="fullName" value={form.fullName} onChange={set}
              placeholder="e.g. John Banda" required
              hint={t('form.fullname')}/>
          </div>
          <div>
            <FieldLabel required>{t('form.dob')}</FieldLabel>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#f59e0b'}
              onBlur={e  => e.target.style.borderColor = '#e2e8f0'}/>
          </div>
          <SelectInput
            label={t('form.sex')} name="sex" value={form.sex} onChange={set} required
            options={[
              { value:'MALE',   label: t('form.sex.male') },
              { value:'FEMALE', label: t('form.sex.female') },
            ]}/>
          <TextInput
            label={t('form.pob')} name="placeOfBirth" value={form.placeOfBirth}
            onChange={set} placeholder="e.g. Lilongwe" required/>
          <TextInput
            label="Nationality" name="nationality" value={form.nationality}
            onChange={set} placeholder="Malawian"/>
        </div>

        {/* Contact */}
        <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:20, marginBottom:24 }}>
          <SectionHead icon={Phone} title={t('form.contact')} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <TextInput
              label={t('form.phone')} name="phone" type="tel" value={form.phone}
              onChange={set} placeholder="+265 999 000 111" required/>
            <TextInput
              label={`${t('auth.email')} (${t('apply.continue') === 'Continue' ? 'optional' : 'osasintha'})`}
              name="email" type="email" value={form.email}
              onChange={set} placeholder="john@example.com"/>
          </div>
        </div>

        {/* Address */}
        <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:20 }}>
          <SectionHead icon={MapPin} title={t('form.address')} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <SelectInput
              label={t('form.district')} name="district" value={form.district} onChange={set} required
              options={DISTRICTS}/>
            <TextInput
              label={t('form.address.field')} name="physicalAddress" value={form.physicalAddress}
              onChange={set} placeholder="e.g. Area 18, Lilongwe" required
              hint="House number, street, area or village"/>
          </div>
        </div>

        {/* Conditional optional fields */}
        {service.value === 'DRIVING_LICENCE' && (
          <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:20, marginTop:20 }}>
            <SectionHead icon={FileText} title={t('service.licence')} />
            <TextInput
              label="Existing Licence Number" name="existingLicenceNo"
              value={form.existingLicenceNo} onChange={set}
              placeholder="e.g. ML-DRTSS-2020-123456"
              hint="Only for renewals — leave blank for first-time applications"/>
          </div>
        )}
        {service.value === 'PASSPORT' && (
          <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:20, marginTop:20 }}>
            <SectionHead icon={FileText} title={t('service.passport')} />
            <TextInput
              label="Previous Passport Number" name="previousPassportNo"
              value={form.previousPassportNo} onChange={set}
              placeholder="e.g. ML-IMMIGRATION-2018-123456"
              hint="Only for renewals — leave blank for first-time applications"/>
          </div>
        )}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel={t('apply.review.btn')} nextDisabled={!isValid} t={t}/>
    </div>
  );
}

// ── Step 3: Next of Kin ───────────────────────────────────
function Step3({ form, onChange, onNext, onBack, t }) {
  const set = e => onChange({ ...form, [e.target.name]: e.target.value });

  const isValid =
    form.nextOfKinName?.trim() &&
    form.nextOfKinPhone?.trim() &&
    form.nextOfKinRelation?.trim();

  return (
    <div>
      <div style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:'24px 24px 20px' }}>
        <SectionHead icon={Heart} title={t('form.kin')} />
        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, marginBottom:20 }}>
          {t('form.declaration').split('.')[0]}.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <TextInput
              label={t('form.kin.name')} name="nextOfKinName"
              value={form.nextOfKinName} onChange={set} placeholder="e.g. Mary Banda" required/>
          </div>
          <TextInput
            label={t('form.kin.phone')} name="nextOfKinPhone" type="tel"
            value={form.nextOfKinPhone} onChange={set} placeholder="+265 888 000 111" required/>
          <SelectInput
            label={t('form.kin.relation')} name="nextOfKinRelation"
            value={form.nextOfKinRelation} onChange={set} required
            options={['Spouse','Parent','Sibling','Child','Guardian','Friend','Other']}/>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel={t('apply.review.btn')} nextDisabled={!isValid} t={t}/>
    </div>
  );
}

// ── Step 4: Review & Submit ───────────────────────────────
function Step4({ service, form, onBack, onSubmit, loading, t }) {
  const sections = [
    {
      title: t('form.personal'), icon: User,
      rows: [
        [t('form.fullname'),    form.fullName],
        [t('form.dob'),         form.dateOfBirth],
        [t('form.sex'),         form.sex === 'MALE' ? t('form.sex.male') : t('form.sex.female')],
        [t('form.pob'),         form.placeOfBirth],
        ['Nationality',         form.nationality || 'Malawian'],
        ...(form.existingLicenceNo  ? [['Existing Licence No',  form.existingLicenceNo]]  : []),
        ...(form.previousPassportNo ? [['Previous Passport No', form.previousPassportNo]] : []),
      ],
    },
    {
      title: `${t('form.contact')} & ${t('form.address')}`, icon: Phone,
      rows: [
        [t('form.phone'),           form.phone],
        [t('auth.email'),           form.email || '—'],
        [t('form.district'),        form.district],
        [t('form.address.field'),   form.physicalAddress],
      ],
    },
    {
      title: t('form.kin'), icon: Heart,
      rows: [
        [t('form.kin.name'),      form.nextOfKinName],
        [t('form.kin.phone'),     form.nextOfKinPhone],
        [t('form.kin.relation'),  form.nextOfKinRelation],
      ],
    },
  ];

  return (
    <div>
      {/* Service header */}
      <div style={{
        background:`linear-gradient(135deg, ${service.gradStart}, ${service.gradEnd})`,
        borderRadius:16, padding:'18px 22px', marginBottom:14,
        display:'flex', alignItems:'center', gap:12,
      }}>
        <div style={{ width:40, height:40, background:'rgba(255,255,255,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <service.icon size={20} color="white"/>
        </div>
        <div>
          <p style={{ color:'white', fontWeight:800, fontSize:15 }}>{t(service.label)}</p>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>{service.agency} · {service.time} {t('service.days')}</p>
        </div>
      </div>

      {sections.map(({ title, icon: Icon, rows }) => (
        <div key={title} style={{ background:'white', borderRadius:16, border:'2px solid #a9b8ca', padding:'20px 22px', marginBottom:10 }}>
          <SectionHead icon={Icon} title={title} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {rows.map(([label, value]) => (
              <div key={label} style={{ background:'#dcedff', borderRadius:8, padding:'9px 12px' }}>
                <p style={{ fontSize:11, color:'#3b5579', fontWeight:600, marginBottom:1 }}>{label}</p>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'11px 14px', marginBottom:18 }}>
        <AlertCircle size={14} color="#d97706" style={{ flexShrink:0, marginTop:1 }}/>
        <p style={{ fontSize:12, color:'#92400e', lineHeight:1.6 }}>
          {t('review.warning')}
        </p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <button onClick={onBack} style={{
          background:'transparent', border:'1.5px solid #e2e8f0', borderRadius:12,
          padding:'12px 20px', fontSize:14, fontWeight:600, color:'#64748b',
          cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
        }}>
          <ChevronLeft size={15}/> {t('apply.edit.btn')}
        </button>
        <button onClick={onSubmit} disabled={loading} style={{
          background: loading ? '#94a3b8' : '#0f172a', color:'white',
          border:'none', borderRadius:12, padding:'12px 26px', fontSize:14, fontWeight:700,
          cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:6,
          fontFamily:'inherit', transition:'all 0.2s',
        }}>
          <CheckCircle size={15}/>
          {loading ? t('common.loading') : t('apply.submit.btn')}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function ApplyPage() {
  const router                = useRouter();
  const { t }                 = useTranslation();          // ← single hook call at the top
  const [step, setStep]       = useState(0);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName:          '',
    dateOfBirth:       '',
    sex:               '',
    placeOfBirth:      '',
    district:          '',
    nationality:       'Malawian',
    physicalAddress:   '',
    phone:             '',
    email:             '',
    nextOfKinName:     '',
    nextOfKinPhone:    '',
    nextOfKinRelation: '',
    existingLicenceNo:  '',
    previousPassportNo: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const appRes = await applicationsAPI.create({
        type:       service.value,
        agencyName: service.agency,
      });
      const applicationId = appRes.data.data.id;

      const payload = {
        fullName:          form.fullName,
        dateOfBirth:       form.dateOfBirth,
        sex:               form.sex,
        placeOfBirth:      form.placeOfBirth,
        district:          form.district,
        nationality:       form.nationality || 'Malawian',
        physicalAddress:   form.physicalAddress,
        phone:             form.phone,
        nextOfKinName:     form.nextOfKinName,
        nextOfKinPhone:    form.nextOfKinPhone,
        nextOfKinRelation: form.nextOfKinRelation,
        ...(form.email              && { email:              form.email }),
        ...(form.existingLicenceNo  && { existingLicenceNo:  form.existingLicenceNo }),
        ...(form.previousPassportNo && { previousPassportNo: form.previousPassportNo }),
      };

      await applicationsAPI.submitForm(applicationId, payload);
      toast.success('Application submitted successfully!');
      router.push('/dashboard/track');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#2d8a63', fontWeight:700, marginBottom:5 }}>
            {t('apply.service.citizen')}
          </p>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#0d3b2e', marginBottom:3 }}>
            {t('apply.title')}
          </h1>
          <p style={{ fontSize:14, color:'#64748b', fontWeight:300 }}>
            {t('apply.subtitle')}
          </p>
        </div>

        <StepBar current={step} t={t} />

        {step === 0 && <Step1 selected={service} onSelect={setService} onNext={() => setStep(1)} t={t} />}
        {step === 1 && <Step2 service={service} form={form} onChange={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} t={t} />}
        {step === 2 && <Step3 form={form} onChange={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} t={t} />}
        {step === 3 && <Step4 service={service} form={form} onBack={() => setStep(2)} onSubmit={handleSubmit} loading={loading} t={t} />}
      </div>
    </DashboardLayout>
  );
}