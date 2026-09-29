const nodemailer = require('nodemailer');
const config = require('../../config/app.config');

// Build the transporter lazily and reuse it — no need to reconnect on every email
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, // Ethereal (and most dev SMTP) uses STARTTLS on 587, not implicit TLS on 465
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  return transporter;
};

/**
 * Send an email.
 * @param {Object} params
 * @param {string} params.to      - recipient address
 * @param {string} params.subject - email subject
 * @param {string} params.text    - plain-text body
 * @param {string} [params.html]  - optional HTML body (falls back to wrapped text)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();

  const info = await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  });

  // Ethereal doesn't actually deliver anywhere — this URL is how you "see" the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[EMAIL] Preview URL: ${previewUrl}`);
  }

  return info;
};

module.exports = { sendEmail, getTransporter };