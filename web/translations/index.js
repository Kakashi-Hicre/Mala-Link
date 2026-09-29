import navigation from './navigation';
import auth from './auth';
import dashboard from './dashboard';
import landing from './landing';
import search from './search';
import apply from './apply';
import applyForm from './applyForm';
import formFields from './formFields';
import review from './review';
import track from './track';
import notifications from './notifications';
import documents from './documents';
import profile from './profile';
import services from './services';
import common from './common';

// Merge every namespace into one flat lookup table, keyed exactly as before
// (e.g. 'land.nav.services', 'auth.email', 'dash.greeting'...).
// useTranslation.js, LanguageContext.js and every component keep working
// unchanged, because the shape this default export produces is identical
// to the old single-file version.
const translations = {
  ...navigation,
  ...auth,
  ...dashboard,
  ...landing,
  ...search,
  ...apply,
  ...applyForm,
  ...formFields,
  ...review,
  ...track,
  ...notifications,
  ...documents,
  ...profile,
  ...services,
  ...common,
};

export default translations;
