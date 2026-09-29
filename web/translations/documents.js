const documents = {
  // ── Documents page ───────────────────────────────────
  'docs.title':            { en: 'Documents',                   ny: 'Makalata' },
  'docs.subtitle':         { en: 'Upload supporting documents for your active applications', ny: 'Tumizani ziphatso ndi makalata oyenera malingana ndi kalembera wanu' },
  'docs.active.apps':      { en: 'Active Applications',         ny: 'Kalembera Wanu' },
  'docs.no.active':        { en: 'No active applications',      ny: 'Palibe Kalembera wanu' },
  'docs.select':           { en: 'Select an application',       ny: 'Sankhani Kalembera' },
  'docs.select.sub':       { en: 'to upload documents',         ny: 'kutumiza Ziphatso kapena Kalata' },
  'docs.upload':           { en: 'Upload Document',             ny: 'Tumizani' },
  'docs.click':            { en: 'Click to select file',        ny: 'Dinani kusankha fayilo' },
  'docs.types':            { en: 'JPEG, PNG or PDF · Max 5MB',  ny: 'JPEG, PNG kapena PDF · Zolekera 5MB' },
  'docs.uploading':        { en: 'Uploading...',                ny: 'Kutumiza...' },
  'docs.uploaded':         { en: 'Uploaded Documents',          ny: 'Zatumizidwa' },
  'docs.none':             { en: 'No documents uploaded yet',   ny: 'Simunatumize Chiphatso kapena Kalata' },

  // ── Documents page (full upload UI) — page chrome ─────
  'docs.page.subtitle':    { en: 'Upload the required supporting documents for your applications.', ny: 'Kwezani makalata oyenera omwe akufunika pa kalembera wanu.' },
  'docs.noActive.sub':     { en: 'Submit an application first.', ny: 'Tumizani Kalembera Kaye.' },
  'docs.mainSelect.sub':   { en: 'Choose an application on the left to manage its documents.', ny: 'Sankhani kalembera kumanzere kuti musinthe makalata ake.' },
  'docs.sectionTitleSuffix': { en: '— Documents', ny: '— Ziphatso/Makalata' },
  'docs.uploadBeforeVisit1': { en: 'Upload all required documents before visiting the', ny: 'tumizani ziphatso ndi makalata onse oyenera musanapite ku' },
  'docs.uploadBeforeVisit2': { en: 'office.', ny: 'ofesi.' },
  'docs.webcamTip1':       { en: 'Documents with a', ny: 'Makalata omwe ali ndi batani la' },
  'docs.webcamTip2':       { en: 'button can be captured live with your device camera — no scanner required. You can also upload a file from your device for any document.', ny: 'amatha kujambulidwa mwachindunji ndi kamera ya chipangizo chanu — palibe sikanala yofunikira. Mumathanso kukweza fayilo yochokera pa chipangizo chanu pa kalata iliyonse.' },
  'docs.otherUploads':     { en: 'Other Uploads', ny: 'Zina Zokwezedwa' },

  // ── Document type labels & descriptions ───────────────
  'docs.docType.passportPhoto.label': { en: 'Passport Photo', ny: 'Chithunzi cha Pasipoti' },
  'docs.docType.passportPhoto.desc':  { en: 'Clear face photo against a plain background. Webcam capture recommended.', ny: 'Chithunzi choonekera bwino cha nkhope pa chinsalu chosalala. Kujambula ndi webcam ndi bwino.' },
  'docs.docType.birthCert.label':     { en: 'Birth Certificate', ny: 'Satifiketi ya Kubadwa' },
  'docs.docType.birthCert.desc':      { en: 'Scanned or photographed copy of your official birth certificate.', ny: 'Kope losindikizidwa kapena lojambulidwa la satifiketi yanu yovomerezeka ya kubadwa.' },
  'docs.docType.supportingDoc.label': { en: 'Supporting Document', ny: 'Kalata Yothandizira' },
  'docs.docType.supportingDoc.desc':  { en: 'Voter ID, village head letter, or any supporting identity document.', ny: 'Kadi ya wovota, kalata ya mfumu ya mudzi, kapena kalata ina ili yonse yothandizira kuzindikira.' },
  'docs.docType.nationalIdScan.label':{ en: 'National ID (Both Sides)', ny: 'Chiphatso (Mbali Zonse Ziwiri)' },
  'docs.docType.nationalIdScan.desc': { en: 'Clear scan or photo of the front AND back of your Malawi National ID.', ny: 'Sikani kapena chithunzi choonekera bwino cha mbali yakutsogolo NDI yakumbuyo ya Chiphatso chanu cha Malawi.' },
  'docs.docType.fingerprint.label':   { en: 'Fingerprint', ny: 'Chala Chosindikizira' },
  'docs.docType.fingerprint.desc':    { en: 'Scanned fingerprint image. Use a scanner or capture with your device camera.', ny: 'Chithunzi cha chala chosindikizidwa. Gwiritsani ntchito sikanala kapena jambulani ndi kamera ya chipangizo chanu.' },
  'docs.docType.digitalSignature.label': { en: 'Digital Signature', ny: 'Siginecha ya pa Intaneti' },
  'docs.docType.digitalSignature.desc':  { en: 'Sign on paper, then photograph or scan and upload.', ny: 'Sainani pa pepala, kenako jambulani kapena sikanani ndi kukweza.' },
  'docs.docType.medicalCert.label':   { en: 'Medical Certificate (DL3)', ny: 'Satifiketi ya Chipatala (DL3)' },
  'docs.docType.medicalCert.desc':    { en: 'Form DL3 signed by a registered medical practitioner.', ny: 'Fomu ya DL3 yosainidwa ndi dokotala wolembetsedwa.' },

  // ── Webcam modal ───────────────────────────────────────
  'docs.webcam.title':        { en: 'Webcam Capture', ny: 'Kujambula ndi Webcam' },
  'docs.webcam.error':        { en: 'Camera access denied. Please allow camera permissions and try again.', ny: 'Simungagwiritse ntchito kamera. Chondikoni loleni kamera ndipo yesaninso.' },
  'docs.webcam.starting':     { en: 'Starting camera…', ny: 'Kamera ikuyamba…' },
  'docs.webcam.centreFace':   { en: 'CENTRE YOUR FACE', ny: 'IKANI NKHOPE PAKATIKATI' },
  'docs.webcam.cancel':       { en: 'Cancel', ny: 'Lekani' },
  'docs.webcam.capture':      { en: 'Capture Photo', ny: 'Jambulani Chithunzi' },
  'docs.webcam.retake':       { en: 'Retake', ny: 'Jambulaninso' },
  'docs.webcam.useThisPhoto': { en: 'Use This Photo', ny: 'Gwiritsani Ntchito Chithunzichi' },
  'docs.webcamBtn':           { en: 'Webcam', ny: 'Webcam' },

  // ── Document card ──────────────────────────────────────
  'docs.badge.required': { en: 'REQUIRED', ny: 'ZOFUNIKIRA' },
  'docs.badge.optional': { en: 'OPTIONAL', ny: 'SI ZOFUNIKIRA' },
  'docs.card.view':      { en: 'View',    ny: 'Onani' },
  'docs.card.remove':    { en: 'Remove',  ny: 'Chotsani' },
  'docs.card.replace':   { en: 'Replace', ny: 'Sinthani' },
  'docs.card.uploadFile':{ en: 'Upload File', ny: 'Kwezani Fayilo' },

  // ── Progress bar ───────────────────────────────────────
  'docs.progress.allDone':  { en: 'All required documents uploaded!', ny: 'Makalata onse oyenera atumidzidwa!' },
  'docs.progress.required': { en: 'Required documents', ny: 'Makalata oyenera' },

  // ── Statuses used on this page ─────────────────────────
  'docs.status.pendingReview':   { en: 'Pending Review',      ny: 'Kudikira Kuwunikidwa' },
  'docs.status.readyCollection': { en: 'Ready for Collection', ny: 'Lokonzeka Kutenga' },

  // ── Toasts & confirms ──────────────────────────────────
  'docs.toast.loadAppsFailed':  { en: 'Failed to load applications', ny: 'Kutenga malembera kwalephera' },
  'docs.toast.loadDocsFailed':  { en: 'Failed to load documents',    ny: 'Kutenga makalata kwalephera' },
  'docs.toast.uploadedSuffix':  { en: 'uploaded',                    ny: 'Yatumizidwa' },
  'docs.toast.uploadFailed':    { en: 'Upload failed',               ny: 'Kutumiza kwalephera' },
  'docs.confirmRemove':         { en: 'Remove this document?',       ny: 'Kodi muchotse kalata iyi?' },
  'docs.toast.removed':         { en: 'Document removed',            ny: 'Kalata yachotsedwa' },
  'docs.toast.removeFailed':    { en: 'Failed to remove document',   ny: 'Kuchotsa kalata kwalephera' },
};

export default documents;
