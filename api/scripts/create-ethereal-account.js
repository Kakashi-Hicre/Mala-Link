/**
 * Run this ONCE to generate a free Ethereal test inbox:
 *
 *     node scripts/create-ethereal-account.js
 *
 * Ethereal (https://ethereal.email) is a fake SMTP service made by the
 * Nodemailer team. Emails you "send" through it never leave their servers —
 * you view them in a browser inbox instead. Perfect for dev, since you don't
 * need a real Gmail/SendGrid account and won't accidentally spam real citizens.
 *
 * Copy the printed values into your .env file.
 */
const nodemailer = require('nodemailer');

(async () => {
  const testAccount = await nodemailer.createTestAccount();

  console.log('\n✅ Ethereal test account created!\n');
  console.log('Add these to your .env file:\n');
  console.log(`EMAIL_HOST=${testAccount.smtp.host}`);
  console.log(`EMAIL_PORT=${testAccount.smtp.port}`);
  console.log(`EMAIL_USER=${testAccount.user}`);
  console.log(`EMAIL_PASS=${testAccount.pass}`);
  console.log(`EMAIL_FROM="Mala-Link <${testAccount.user}>"`);
  console.log('\nYou can also log into https://ethereal.email/login with that');
  console.log('user/pass to view the inbox in a browser.\n');
})();