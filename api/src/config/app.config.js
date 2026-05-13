require('dotenv').config();

module.exports = {
  port:          process.env.PORT || 3000,
  jwtSecret:     process.env.JWT_SECRET,
  jwtExpiresIn:  process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl:   process.env.DATABASE_URL,
};