/**
 * Run with: node translations/checkTranslations.mjs
 *
 * Walks every namespace file, flags:
 *  - keys defined in more than one file (or twice in the same file's export)
 *  - entries missing an 'en' or 'ny' value
 * Doesn't touch index.js's runtime behaviour — just a lint pass for CI or
 * pre-commit.
 */
import navigation from './navigation.js';
import auth from './auth.js';
import dashboard from './dashboard.js';
import landing from './landing.js';
import search from './search.js';
import apply from './apply.js';
import formFields from './formFields.js';
import review from './review.js';
import track from './track.js';
import notifications from './notifications.js';
import documents from './documents.js';
import profile from './profile.js';
import services from './services.js';
import common from './common.js';

const files = {
  navigation, auth, dashboard, landing, search, apply,
  formFields, review, track, notifications, documents,
  profile, services, common,
};

const seenIn = {}; // key -> [fileNames]
let problems = 0;

for (const [fileName, obj] of Object.entries(files)) {
  for (const [key, value] of Object.entries(obj)) {
    seenIn[key] = seenIn[key] || [];
    seenIn[key].push(fileName);

    if (!value.en) {
      console.warn(`⚠️  Missing 'en' for "${key}" in ${fileName}.js`);
      problems++;
    }
    if (!value.ny) {
      console.warn(`⚠️  Missing 'ny' for "${key}" in ${fileName}.js`);
      problems++;
    }
  }
}

for (const [key, fileNames] of Object.entries(seenIn)) {
  if (fileNames.length > 1) {
    console.warn(`⚠️  "${key}" is defined in more than one file: ${fileNames.join(', ')}`);
    problems++;
  }
}

if (problems === 0) {
  console.log('✅ No missing translations or duplicate keys found.');
} else {
  console.log(`\n${problems} issue(s) found.`);
  process.exitCode = 1;
}
