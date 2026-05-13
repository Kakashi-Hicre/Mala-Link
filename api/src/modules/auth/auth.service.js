const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prisma.client');
const { jwtSecret, jwtExpiresIn } = require('../../config/app.config');

const signToken = (userId, email, role) => {
  return jwt.sign(
    { sub: userId, email, role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

const register = async ({ fullName, email, phone, password }) => {
  // 1. Check if email already taken
  const existing = await prisma.citizen.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create citizen
  const citizen = await prisma.citizen.create({
    data: { fullName, email, phone, passwordHash },
  });

  // 4. Return token
  const token = signToken(citizen.id, citizen.email, citizen.role);
  return { access_token: token };
};

const login = async ({ email, password }) => {
  // 1. Find citizen — include passwordHash for comparison
  const citizen = await prisma.citizen.findUnique({ where: { email } });
  if (!citizen) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 2. Compare passwords
  const match = await bcrypt.compare(password, citizen.passwordHash);
  if (!match) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 3. Return token
  const token = signToken(citizen.id, citizen.email, citizen.role);
  return { access_token: token };
};


module.exports = { register, login };