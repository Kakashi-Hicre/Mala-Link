const prisma = require('../../prisma/prisma.client');

const STATUSES = ['PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED'];

// ── Phase 2: Overview ─────────────────────────────────────────
const getOverview = async () => {
  const agencies = await prisma.agency.findMany({
    select: { id: true, name: true },
  });

  const [
    totalCitizens, totalApplications, activeCards, totalCards,
    totalStaff, statusGroups, recentApplications,
    ...agencyResults
  ] = await Promise.all([
    prisma.citizen.count(),
    prisma.application.count(),
    prisma.idCard.count({ where: { cardStatus: 'ACTIVE' } }),
    prisma.idCard.count(),
    prisma.agencyStaff.count(),
    prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.application.findMany({
      take: 8, orderBy: { createdAt: 'desc' },
      select: {
        id: true, type: true, status: true, createdAt: true,
        citizen: { select: { fullName: true } },
        agency:  { select: { name: true } },
      },
    }),
    ...agencies.map(agency =>
      Promise.all(STATUSES.map(s =>
        prisma.application.count({ where: { agencyId: agency.id, status: s } })
      )).then(counts => {
        const breakdown = { name: agency.name, total: counts.reduce((a, b) => a + b, 0) };
        STATUSES.forEach((s, i) => { breakdown[s] = counts[i]; });
        return breakdown;
      })
    ),
  ]);

  const applicationsByStatus = Object.fromEntries(STATUSES.map(s => [s, 0]));
  for (const row of statusGroups) applicationsByStatus[row.status] = row._count._all;

  const byAgency = {};
  agencies.forEach((agency, i) => { byAgency[agency.name] = agencyResults[i]; });

  return { totalCitizens, totalApplications, totalCards, activeCards, totalStaff,
           applicationsByStatus, byAgency, recentApplications };
};

// ── Phase 4: Staff ────────────────────────────────────────────
const getAllStaff = async ({ agencyId } = {}) => {
  const where = {};
  if (agencyId) where.agencyId = agencyId;

  return await prisma.agencyStaff.findMany({
    where,
    select: {
      id: true, fullName: true, email: true, createdAt: true,
      agency: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const deleteStaff = async (staffId) => {
  const staff = await prisma.agencyStaff.findUnique({ where: { id: staffId } });
  if (!staff) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }
  await prisma.agencyStaff.delete({ where: { id: staffId } });
  return { message: 'Staff member removed successfully' };
};

// ── Phase 5: ID Cards ─────────────────────────────────────────
const getAllCards = async ({ status, search } = {}) => {
  const where = {};

  if (status) where.cardStatus = status;

  if (search) {
    where.OR = [
      { cardNumber: { contains: search, mode: 'insensitive' } },
      { holderName: { contains: search, mode: 'insensitive' } },
    ];
  }

  return await prisma.idCard.findMany({
    where,
    select: {
      id:          true,
      cardNumber:  true,
      holderName:  true,
      sex:         true,
      dateOfBirth: true,
      expiryDate:  true,
      cardStatus:  true,
      issuedAt:    true,
      application: {
        select: {
          type:    true,
          status:  true,
          agency:  { select: { name: true } },
          citizen: { select: { fullName: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });
};

module.exports = { getOverview, getAllStaff, deleteStaff, getAllCards };