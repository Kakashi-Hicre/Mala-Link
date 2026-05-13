const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const prisma = require('../../prisma/prisma.client');
const { jwtSecret, jwtExpiresIn } = require('../../config/app.config');

const signToken = (staffId, email, role, agencyId) => {
  return jwt.sign(
    { sub: staffId, email, role, agencyId },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// Admin: create a staff account for an agency
const createStaff = async ({ fullName, email, password, agencyName }) => {
  // Find the agency
  const agency = await prisma.agency.findUnique({ where: { name: agencyName } });
  if (!agency) {
    const error = new Error(`Agency ${agencyName} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Check email not taken
  const existing = await prisma.agencyStaff.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const staff = await prisma.agencyStaff.create({
    data: {
      fullName,
      email,
      passwordHash,
      agencyId: agency.id,
    },
    select: {
      id:        true,
      fullName:  true,
      email:     true,
      role:      true,
      agency: { select: { name: true } },
    },
  });

  return staff;
};

// Agency staff login — separate from citizen login
const staffLogin = async ({ email, password }) => {
  const staff = await prisma.agencyStaff.findUnique({
    where:   { email },
    include: { agency: true },
  });

  if (!staff) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const match = await bcrypt.compare(password, staff.passwordHash);
  if (!match) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(staff.id, staff.email, staff.role, staff.agencyId);
  return {
    access_token: token,
    staff: {
      id:       staff.id,
      fullName: staff.fullName,
      email:    staff.email,
      role:     staff.role,
      agency:   staff.agency.name,
    },
  };
};

// Get all agencies (public — citizens need to know which agency handles what)
const getAllAgencies = async () => {
  return await prisma.agency.findMany({
    select: {
      id:   true,
      name: true,
      _count: {
        select: { applications: true }
      }
    },
  });
};

// Admin/staff: get stats for one agency
const getAgencyStats = async (agencyId) => {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
  });

  if (!agency) {
    const error = new Error('Agency not found');
    error.statusCode = 404;
    throw error;
  }

  // Count applications by status for this agency
  const [total, pending, processing, printing, ready, collected, rejected] =
    await Promise.all([
      prisma.application.count({ where: { agencyId } }),
      prisma.application.count({ where: { agencyId, status: 'PENDING'    } }),
      prisma.application.count({ where: { agencyId, status: 'PROCESSING' } }),
      prisma.application.count({ where: { agencyId, status: 'PRINTING'   } }),
      prisma.application.count({ where: { agencyId, status: 'READY'      } }),
      prisma.application.count({ where: { agencyId, status: 'COLLECTED'  } }),
      prisma.application.count({ where: { agencyId, status: 'REJECTED'   } }),
    ]);

  return {
    agency: agency.name,
    stats: { total, pending, processing, printing, ready, collected, rejected },
  };
};

module.exports = { createStaff, staffLogin, getAllAgencies, getAgencyStats };