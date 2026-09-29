// All UI copy for /apply — service selection, the three agency-specific
// multi-step forms (NRB, Immigration, DRTSS), and the review step.
//
// NOTE on scope: only display text is translated here. Data values that get
// submitted to the backend or stored as option codes — SERVICES[].value,
// MARITAL_STATUS[].value, SEX_OPTIONS[].value, LICENCE_CATEGORIES[].value,
// DISTRICTS entries, and INITIAL_FORM defaults like nationality: 'Malawian' —
// must NOT be swapped for translated text, since that would change the data
// itself, not just how it's displayed.
//
// A note on translation quality: these Chichewa strings (and some of the
// ones already in auth.js/form.js) are a solid best-effort pass, not a
// professional legal/administrative translation. Given this is a government
// ID/passport/licence form, it's worth having a native speaker — ideally
// someone familiar with NRB/Immigration/DRTSS paperwork — sanity-check the
// wording before this goes to real citizens.

const applyForm = {
  // ── Page header ────────────────────────────────────────
  'applyForm.header.eyebrow': { en: 'Citizen Services', ny: 'Ntchito za Nzika' },
  'applyForm.header.helper1': { en: 'Select a service below and complete the required form. All fields marked', ny: 'Sankhani ntchito pansipa ndikumaliza fomu yofunikira. Minda yonse yolembedwa' },
  'applyForm.header.helper2': { en: 'are required.', ny: 'ndi yofunikira.' },

  // ── Services ─────────────────────────────────────────────
  'applyForm.service.nationalId.label': { en: 'National ID Card', ny: 'Kadi ya Chiphatso' },
  'applyForm.service.nationalId.desc':  { en: 'Apply for your Malawi National Registration Bureau ID card. Required for all citizens aged 16 and above.', ny: 'Pemphanichito kadi yanu ya Chiphatso ya Bungwe la Kulembetsa Nzika. Ndi yofunikira kwa nzika zonse za zaka 16 kapena kupitilira.' },
  'applyForm.service.passport.desc':    { en: 'Apply for an international Malawian passport via the Department of Immigration.', ny: 'Pemphanichito pasipoti yapadziko lonse ya Malawi kudzera ku Dipatimenti ya Ulendo wa Kunja.' },
  'applyForm.service.licence.desc':     { en: 'Apply for a driving licence via the Department of Road Traffic & Safety Services.', ny: 'Pemphanichito layisensi yoyendetsa kudzera ku Dipatimenti ya Chitetezo pa Misewu.' },

  // ── Step-bar labels ──────────────────────────────────────
  'applyForm.step.service':        { en: 'Service',          ny: 'Ntchito' },
  'applyForm.step.personalInfo':   { en: 'Personal Info',    ny: 'Zambiri Zaumwini' },
  'applyForm.step.birthAddress':   { en: 'Birth & Address',  ny: 'Kubadwa & Malo' },
  'applyForm.step.parents':        { en: 'Parents',          ny: 'Makolo' },
  'applyForm.step.contact':        { en: 'Contact',          ny: 'Kulumikizana' },
  'applyForm.step.licenceDetails': { en: 'Licence Details',  ny: 'Zambiri za Layisensi' },
  'applyForm.step.reviewShort':    { en: 'Review',           ny: 'Onani' },

  // ── Option lists ─────────────────────────────────────────
  'applyForm.marital.neverMarried': { en: 'Never Married', ny: 'Sanakwatirepo' },
  'applyForm.marital.married':      { en: 'Married',       ny: 'Wokwatira' },
  'applyForm.marital.divorced':     { en: 'Divorced',      ny: 'Wosudzulana' },
  'applyForm.marital.widowed':      { en: 'Widowed',       ny: 'Wamasiye' },
  'applyForm.marital.separated':    { en: 'Separated',     ny: 'Wolekana' },
  'applyForm.marital.abandoned':    { en: 'Abandoned',     ny: 'Wosiyidwa' },

  'applyForm.licence.a':  { en: 'A — Motorcycles / Tricycles',                        ny: 'A — Njinga Zamoto / Magalimoto a Mawilo Atatu' },
  'applyForm.licence.b':  { en: 'B — Light vehicles (≤3,500 kg, max 8 seats)',        ny: 'B — Magalimoto Opepuka (osapitirira 3,500 kg, mipando 8)' },
  'applyForm.licence.c1': { en: 'C1 — Medium goods vehicles',                         ny: 'C1 — Magalimoto Onyamula Katundu Apakati' },
  'applyForm.licence.c':  { en: 'C — Heavy goods vehicles',                           ny: 'C — Magalimoto Onyamula Katundu Olemera' },
  'applyForm.licence.d1': { en: 'D1 — Minibuses',                                     ny: 'D1 — Ma Minibus' },
  'applyForm.licence.d':  { en: 'D — Full passenger buses',                           ny: 'D — Mabasi Onyamula Anthu' },
  'applyForm.licence.instructions': { en: 'Select all categories you are applying for. A separate test is required for each category.', ny: 'Sankhani magulu onse omwe mukupempha. Mayeso osiyana amafunika pa gulu lililonse.' },

  // ── Section headers ──────────────────────────────────────
  'applyForm.section.personalDetails':  { en: 'Personal Details',          ny: 'Zambiri Zaumwini' },
  'applyForm.section.residentialAddr':  { en: 'Residential Address',       ny: 'Malo Okhalamo' },
  'applyForm.section.permanentHome':    { en: 'Permanent Original Home',  ny: 'Kwawo Kwenikweni' },
  'applyForm.section.motherDetails':    { en: "Mother's Details",         ny: 'Zambiri za Amayi' },
  'applyForm.section.fatherDetails':    { en: "Father's Details",         ny: 'Zambiri za Abambo' },
  'applyForm.section.contactInfo':      { en: 'Contact Information',       ny: 'Zambiri Zolumikizira' },
  'applyForm.section.renewalInfo':      { en: 'Renewal Information',       ny: 'Zambiri za Kukonzanso' },
  'applyForm.section.physicalFeatures': { en: 'Physical Features',         ny: 'Maonekedwe a Thupi' },
  'applyForm.section.licenceCategories':{ en: 'Licence Categories',        ny: 'Magulu a Layisensi' },
  'applyForm.section.contactAddress':   { en: 'Contact & Address',         ny: 'Kulumikizana & Malo' },

  // ── Field labels ─────────────────────────────────────────
  'applyForm.field.firstName':         { en: 'First Name',                        ny: 'Dzina Loyamba' },
  'applyForm.field.surname':           { en: 'Surname',                           ny: 'Dzina la Banja' },
  'applyForm.field.otherNames':        { en: 'Other Names',                       ny: 'Mayina Ena' },
  'applyForm.field.maritalStatus':     { en: 'Marital Status',                    ny: 'Mkhalidwe wa Ukwati' },
  'applyForm.field.nationality':       { en: 'Nationality',                       ny: 'Dziko' },
  'applyForm.field.secondNationality': { en: 'Second Nationality',                ny: 'Dziko Lachiwiri' },
  'applyForm.field.colourOfEyes':      { en: 'Colour of Eyes',                    ny: 'Mtundu wa Maso' },
  'applyForm.field.heightMeters':      { en: 'Height (metres)',                   ny: 'Kutalika (mamita)' },
  'applyForm.field.birthCertNo':       { en: 'Birth Certificate No.',             ny: 'Nambala ya Satifiketi ya Kubadwa' },
  'applyForm.field.passportNo':        { en: 'Passport No.',                      ny: 'Nambala ya Pasipoti' },
  'applyForm.field.disability':        { en: 'Disability / Observation',          ny: 'Chilema / Chizindikiro Chapadera' },
  'applyForm.field.birthDistrict':     { en: 'District of Birth',                 ny: 'Distriki Lobadwira' },
  'applyForm.field.ta':                { en: 'Traditional Authority (T/A)',       ny: 'Ulamuliro Wachikhalidwe (T/A)' },
  'applyForm.field.birthVillage':      { en: 'Village of Birth',                  ny: 'Mudzi Wobadwira' },
  'applyForm.field.residentialDistrict':{ en: 'Residential District',             ny: 'Distriki Wokhalamo' },
  'applyForm.field.villageArea':       { en: 'Village / Area',                    ny: 'Mudzi / Dera' },
  'applyForm.field.permanentDistrict': { en: 'Permanent District',                ny: 'Distriki Lenileni' },
  'applyForm.field.village':           { en: 'Village',                           ny: 'Mudzi' },
  'applyForm.field.motherFullName':    { en: "Mother's Full Name",                ny: 'Dzina Lonse la Amayi' },
  'applyForm.field.motherNationality': { en: "Mother's Nationality",              ny: 'Dziko la Amayi' },
  'applyForm.field.motherIdNo':        { en: "Mother's National ID No.",          ny: 'Nambala ya Chiphatso cha Amayi' },
  'applyForm.field.motherDistrict':    { en: "Mother's District",                 ny: 'Distriki la Amayi' },
  'applyForm.field.motherTA':          { en: "Mother's T/A",                      ny: 'T/A ya Amayi' },
  'applyForm.field.motherVillage':     { en: "Mother's Village",                  ny: 'Mudzi wa Amayi' },
  'applyForm.field.fatherFullName':    { en: "Father's Full Name",                ny: 'Dzina Lonse la Abambo' },
  'applyForm.field.fatherNationality': { en: "Father's Nationality",              ny: 'Dziko la Abambo' },
  'applyForm.field.fatherIdNo':        { en: "Father's National ID No.",          ny: 'Nambala ya Chiphatso cha Abambo' },
  'applyForm.field.fatherDistrict':    { en: "Father's District",                 ny: 'Distriki la Abambo' },
  'applyForm.field.fatherTA':          { en: "Father's T/A",                      ny: 'T/A ya Abambo' },
  'applyForm.field.fatherVillage':     { en: "Father's Village",                  ny: 'Mudzi wa Abambo' },
  'applyForm.field.givenNames':        { en: 'Given Names',                       ny: 'Mayina Operekedwa' },
  'applyForm.field.maidenName':        { en: 'Maiden Name',                       ny: 'Dzina Lachisungwana' },
  'applyForm.field.occupation':        { en: 'Occupation',                        ny: 'Ntchito Yanu' },
  'applyForm.field.nationalIdNo':      { en: 'National ID No.',                   ny: 'Nambala ya Chiphatso' },
  'applyForm.field.eyeColour':         { en: 'Eye Colour',                        ny: 'Mtundu wa Maso' },
  'applyForm.field.permanentAddress':  { en: 'Permanent Address',                 ny: 'Adilesi Yeniyeni' },
  'applyForm.field.emailAddress':      { en: 'Email Address',                     ny: 'Adilesi ya Imelo' },
  'applyForm.field.previousPassportNo':{ en: 'Previous Passport Number',          ny: 'Nambala ya Pasipoti Yakale' },
  'applyForm.field.residentialAddress':{ en: 'Residential Address',               ny: 'Malo Okhalamo' },
  'applyForm.field.existingLicenceNo': { en: 'Existing Licence Number',           ny: 'Nambala ya Layisensi Yomwe Muli Nayo' },
  'applyForm.field.selectCategories':  { en: 'Select Category / Categories',      ny: 'Sankhani Gulu / Magulu' },

  // ── Placeholders ─────────────────────────────────────────
  'applyForm.ph.firstName':            { en: 'e.g. John',                                ny: 'mwachitsanzo John' },
  'applyForm.ph.surname':              { en: 'e.g. Banda',                               ny: 'mwachitsanzo Banda' },
  'applyForm.ph.otherNames':           { en: 'Middle name(s) — optional',                ny: 'Dzina lapakati — si lofunikira' },
  'applyForm.ph.optional':             { en: 'Optional',                                 ny: 'Si lofunikira' },
  'applyForm.ph.secondNationality':    { en: 'If dual national — optional',              ny: 'Ngati muli ndi maufulu awiri — si lofunikira' },
  'applyForm.ph.eyeColourExample':     { en: 'e.g. Brown',                               ny: 'mwachitsanzo Bulauni' },
  'applyForm.ph.heightExample':        { en: 'e.g. 1.75',                                ny: 'mwachitsanzo 1.75' },
  'applyForm.ph.disability':           { en: 'Any disability or special observation — optional', ny: 'Chilema chilichonse kapena chizindikiro chapadera — si lofunikira' },
  'applyForm.ph.taKalolo':             { en: 'e.g. T/A Kalolo',                          ny: 'mwachitsanzo T/A Kalolo' },
  'applyForm.ph.villageBirthExample':  { en: 'e.g. Chinthambala Village',                ny: 'mwachitsanzo Mudzi wa Chinthambala' },
  'applyForm.ph.taMwansambo':          { en: 'e.g. T/A Mwansambo',                       ny: 'mwachitsanzo T/A Mwansambo' },
  'applyForm.ph.villageAreaExample':   { en: 'e.g. Area 18, Lilongwe',                   ny: 'mwachitsanzo Eriya 18, Lilongwe' },
  'applyForm.ph.taKyungu':             { en: 'e.g. T/A Kyungu',                          ny: 'mwachitsanzo T/A Kyungu' },
  'applyForm.ph.villageExample':       { en: 'e.g. Mkandawire Village',                  ny: 'mwachitsanzo Mudzi wa Mkandawire' },
  'applyForm.ph.motherNameExample':    { en: 'e.g. Mary Banda',                          ny: 'mwachitsanzo Mary Banda' },
  'applyForm.ph.fatherNameExample':    { en: 'e.g. James Banda',                         ny: 'mwachitsanzo James Banda' },
  'applyForm.ph.givenNamesExample':    { en: 'e.g. John Michael',                        ny: 'mwachitsanzo John Michael' },
  'applyForm.ph.maidenNameHint':       { en: 'Previous surname before marriage — optional', ny: 'Dzina lomwe munali nalo musanakwatiwe — si lofunikira' },
  'applyForm.ph.placeOfBirthExample':  { en: 'e.g. Lilongwe, Malawi',                    ny: 'mwachitsanzo Lilongwe, Malawi' },
  'applyForm.ph.occupationExample':    { en: 'e.g. Teacher',                             ny: 'mwachitsanzo Mphunzitsi' },
  'applyForm.ph.nidHint':              { en: 'Your Malawi NID number',                   ny: 'Nambala yanu ya Chiphatso cha Malawi' },
  'applyForm.ph.permanentAddrExample': { en: 'e.g. Area 18, House No. 34, Lilongwe',     ny: 'mwachitsanzo Eriya 18, Nyumba No. 34, Lilongwe' },
  'applyForm.ph.emailExample':         { en: 'john@example.com',                         ny: 'john@example.com' },
  'applyForm.ph.previousPassportExample': { en: 'e.g. MW123456',                         ny: 'mwachitsanzo MW123456' },
  'applyForm.ph.fullNameExample':      { en: 'e.g. John Michael Banda',                  ny: 'mwachitsanzo John Michael Banda' },
  'applyForm.ph.residentialAddrExample': { en: 'e.g. Area 25, House No. 12, Lilongwe',   ny: 'mwachitsanzo Eriya 25, Nyumba No. 12, Lilongwe' },
  'applyForm.ph.existingLicenceExample': { en: 'e.g. ML-DRTSS-2020-123456',              ny: 'mwachitsanzo ML-DRTSS-2020-123456' },
  'applyForm.ph.malawian':             { en: 'Malawian',                                 ny: 'Mmalawi' },
  'applyForm.select.placeholder':      { en: 'Select…',                                  ny: 'Sankhani…' },

  // ── Hints ────────────────────────────────────────────────
  'applyForm.hint.leaveBlank':         { en: 'Leave blank if none',                      ny: 'Siyani chopanda ngati palibe' },
  'applyForm.hint.ifAvailable':        { en: 'If available',                             ny: 'Ngati zilipo' },
  'applyForm.hint.ifApplicable':       { en: 'If applicable',                            ny: 'Ngati zikugwirizana' },
  'applyForm.hint.ifKnown':            { en: 'If known',                                 ny: 'Ngati mukudziwa' },
  'applyForm.hint.marriedWomenNote':   { en: 'For married women who changed their surname only', ny: 'Kwa akazi okwatira omwe anasintha dzina lawo lachibadwidwe okha' },
  'applyForm.hint.mustPresentAgency':  { en: 'Must present original Malawi NID at the agency', ny: 'Muyenera kubweretsa Chiphatso choyambirira cha Malawi ku bungwe' },
  'applyForm.hint.mustPresentDrtss':   { en: 'Required — must present original Malawi NID at the DRTSS office', ny: 'Zofunikira — muyenera kubweretsa Chiphatso choyambirira cha Malawi ku ofesi ya DRTSS' },
  'applyForm.hint.renewalOnly':        { en: 'Only for renewals — leave blank for first-time applications', ny: 'Kokha pa kukonzanso — siyani chopanda pa mapempha oyamba' },

  // ── Review-step-only row labels (where text differs from the field label) ──
  'applyForm.review.heightShort':      { en: 'Height (m)',           ny: 'Kutalika (m)' },
  'applyForm.review.phone':            { en: 'Phone',                ny: 'Foni' },
  'applyForm.review.ta':               { en: 'T/A',                  ny: 'T/A' },
  'applyForm.review.idNo':             { en: 'ID No.',               ny: 'Nambala ya Chiphatso' },
  'applyForm.review.email':            { en: 'Email',                ny: 'Imelo' },
  'applyForm.review.prevPassportNo':   { en: 'Previous Passport No.', ny: 'Nambala ya Pasipoti Yakale' },
  'applyForm.review.categoriesApplied':{ en: 'Categories Applied',   ny: 'Magulu Opemphedwa' },
  'applyForm.review.existingLicenceNo':{ en: 'Existing Licence No.', ny: 'Nambala ya Layisensi Yomwe Muli Nayo' },
  'applyForm.review.warning':          {
    en: 'Please review all details carefully before submitting. Once submitted your application will be forwarded to the agency. You will receive notifications on any status updates.',
    ny: 'Chondikoni onani zambiri zonse mosamalitsa musanatumize. Pempha lanu likatumizidwa lidzatumizidwa ku bungwe. Mudzalandira uthenga pa kusintha kulikonse kwa mkhalidwe wake.',
  },

  // ── Buttons & misc ────────────────────────────────────────
  'applyForm.editBtn':    { en: 'Edit',        ny: 'Sinthani' },
  'applyForm.submitting': { en: 'Submitting…', ny: 'Ikutumiza…' },

  // ── Toasts ───────────────────────────────────────────────
  'applyForm.toast.success': { en: 'Application submitted successfully!', ny: 'Pempha latumizidwa bwino!' },
  'applyForm.toast.failure': { en: 'Failed to submit application. Please try again.', ny: 'Kutumiza pempha kwalephera. Chonde yesaninso.' },
};

export default applyForm;
