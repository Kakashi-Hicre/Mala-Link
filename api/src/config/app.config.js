require('dotenv').config();

module.exports = {
  port:          process.env.PORT || 5000,
  jwtSecret:     process.env.JWT_SECRET,
  jwtExpiresIn:  process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl:   process.env.DATABASE_URL,

  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },

  sms: {
    apiKey:            process.env.AT_API_KEY,
    username:           process.env.AT_USERNAME || 'sandbox',
    senderId:           process.env.AT_SENDER_ID || null, // optional, sandbox works without it
    defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '+265', // Malawi
  },

};