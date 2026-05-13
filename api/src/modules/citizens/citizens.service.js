const bcrypt = require('bcrypt');
const prisma = require('../../prisma/prisma.client');

// GET my own profile
const getMe = async (citizenId) => {
  const citizen = await prisma.citizen.findUnique({
    where:  { id: citizenId },
    select: {
      id:           true,
      fullName:     true,
      email:        true,
      phone:        true,
      role:         true,
      nationalIdNo: true,
      createdAt:    true,
      // never return passwordHash
      _count: {
        select: {
          applications:  true,
          notifications: true,
        }
      }
    },
  });

  if (!citizen) {
    const error = new Error('Citizen not found');
    error.statusCode = 404;
    throw error;
  }

  return citizen;
};

// PATCH update my profile
const updateMe = async (citizenId, { fullName, phone, currentPassword, newPassword }) => {
  const citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });

  if (!citizen) {
    const error = new Error('Citizen not found');
    error.statusCode = 404;
    throw error;
  }

  // Build update data dynamically — only update fields that were sent
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone)    updateData.phone    = phone;

  // If they want to change password, verify current password first
  if (newPassword) {
    if (!currentPassword) {
      const error = new Error('Please provide your current password');
      error.statusCode = 400;
      throw error;
    }

    const match = await bcrypt.compare(currentPassword, citizen.passwordHash);
    if (!match) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.citizen.update({
    where: { id: citizenId },
    data:  updateData,
    select: {
      id:        true,
      fullName:  true,
      email:     true,
      phone:     true,
      role:      true,
      updatedAt: true,
    },
  });

  return updated;
};

// Admin: get all citizens
const getAllCitizens = async ({ search } = {}) => {
  const where = {};

  // Optional search by name or email
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email:    { contains: search, mode: 'insensitive' } },
    ];
  }

  return await prisma.citizen.findMany({
    where,
    select: {
      id:           true,
      fullName:     true,
      email:        true,
      phone:        true,
      role:         true,
      nationalIdNo: true,
      createdAt:    true,
      _count: {
        select: { applications: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Admin: get one citizen with full details
const getCitizenById = async (citizenId) => {
  const citizen = await prisma.citizen.findUnique({
    where:  { id: citizenId },
    select: {
      id:           true,
      fullName:     true,
      email:        true,
      phone:        true,
      role:         true,
      nationalIdNo: true,
      createdAt:    true,
      applications: {
        select: {
          id:        true,
          type:      true,
          status:    true,
          createdAt: true,
          agency: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!citizen) {
    const error = new Error('Citizen not found');
    error.statusCode = 404;
    throw error;
  }

  return citizen;
};

module.exports = { getMe, updateMe, getAllCitizens, getCitizenById };