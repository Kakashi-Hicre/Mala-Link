# TODO: Citizen portal translations

## Step 1 — translation keys
- [ ] Update `web/translations/index,js` with new keys used by citizen pages:
  - dashboard home: stats labels, recent applications header/empty states, apply now / view all
  - apply page: service labels/time/description, step labels, section headings, field labels/placeholders/hints, buttons/alerts/toasts
  - documents page: headers, empty state, upload labels/buttons, delete confirm
  - notifications page: page header title/subtitle, empty state, mark read/all read labels
  - track page: page header, empty state, step labels/desc, rejected/ready/ID issued blocks

## Step 2 — wire pages to `t()`
- [ ] `web/app/dashboard/page.js` replace hard-coded strings
- [ ] `web/app/dashboard/apply/page.js` replace hard-coded strings
- [ ] `web/app/dashboard/documents/page.js` replace hard-coded strings
- [ ] `web/app/dashboard/notifications/page.js` replace hard-coded strings
- [ ] `web/app/dashboard/track/page.js` replace hard-coded strings

## Step 3 — verification
- [ ] Toggle language and confirm all citizen pages switch language
- [ ] Run quick grep for missing `t('...')` keys

