const africastalking = require('africastalking');
const config = require('../../config/app.config');

// Build the SMS client lazily and reuse it
let smsClient = null;

const getSmsClient = () => {
  if (smsClient) return smsClient;

  const at = africastalking({
    apiKey:   config.sms.apiKey,
    username: config.sms.username, // literally 'sandbox' for dev, your real app username in production
  });

  smsClient = at.SMS;
  return smsClient;
};

/**
 * Africa's Talking requires international format (e.g. +265888123456).
 * If a citizen's phone is stored locally (e.g. 0888123456), convert it
 * using the configured default country code. Numbers already starting
 * with '+' are left untouched.
 */
const toInternationalFormat = (phone) => {
  if (!phone) return phone;
  const trimmed = phone.trim();

  if (trimmed.startsWith('+')) return trimmed;

  const withoutLeadingZero = trimmed.replace(/^0/, '');
  return `${config.sms.defaultCountryCode}${withoutLeadingZero}`;
};

/**
 * Send an SMS.
 * @param {Object} params
 * @param {string} params.to      - recipient phone number (local or international)
 * @param {string} params.message - the SMS text
 */
const sendSMS = async ({ to, message }) => {
  const sms = getSmsClient();
  const recipient = toInternationalFormat(to);

  const response = await sms.send({
    to: [recipient],
    message,
    // Only include 'from' if you've set up a Sender ID/shortcode —
    // sandbox works fine without one.
    ...(config.sms.senderId ? { from: config.sms.senderId } : {}),
  });

  console.log('[SMS] Response:', JSON.stringify(response));
  return response;
};

module.exports = { sendSMS, toInternationalFormat };