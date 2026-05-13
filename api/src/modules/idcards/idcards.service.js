const prisma                = require('../../prisma/prisma.client');
const { notifyStatusChange } = require('../notifications/notifications.service');

// Generate a unique card number — Format: ML-NRB-2024-123456
const generateCardNumber = (agencyName) => {
  const year   = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ML-${agencyName}-${year}-${random}`;
};

// ── Agency staff: issue a card linked to an application ────────
const issueIDCard = async ({ applicationId, staffAgencyId }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { citizen: true, agency: true, idCard: true, form: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (application.status !== 'READY') {
    const error = new Error(`Cannot issue card — application status is ${application.status}, must be READY`);
    error.statusCode = 400;
    throw error;
  }

  if (application.idCard) {
    const error = new Error('An ID card has already been issued for this application');
    error.statusCode = 409;
    throw error;
  }

  if (staffAgencyId && application.agencyId !== staffAgencyId) {
    const error = new Error('This application belongs to a different agency');
    error.statusCode = 403;
    throw error;
  }

  if (!application.form) {
    const error = new Error('No application form found. The citizen must submit their form first.');
    error.statusCode = 400;
    throw error;
  }

  if (!application.form.isVerified) {
    const error = new Error('Application form has not been verified yet. Please verify the form before issuing a card.');
    error.statusCode = 400;
    throw error;
  }

  const cardNumber = generateCardNumber(application.agency.name);
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);

  const [idCard] = await prisma.$transaction([
    prisma.idCard.create({
      data: {
        applicationId,
        cardNumber,
        holderName:  application.form.fullName,
        sex:         application.form.sex,
        dateOfBirth: application.form.dateOfBirth,
        expiryDate,
        cardStatus:  'ACTIVE',
        issuedAt:    new Date(),
      },
    }),
    ...(application.type === 'NATIONAL_ID'
      ? [prisma.citizen.update({
          where: { id: application.citizenId },
          data:  { nationalIdNo: cardNumber },
        })]
      : []),
  ]);

  await notifyStatusChange({
    citizen:         application.citizen,
    applicationType: application.type,
    status:          'READY',
  });

  return idCard;
};

// ── NRB Staff: manually register an existing physical card ─────
const createManualCard = async ({ staffId, cardData }) => {
  const { cardNumber, holderName, sex, dateOfBirth, expiryDate, cardStatus } = cardData;

  const existing = await prisma.idCard.findUnique({
    where: { cardNumber: cardNumber.trim().toUpperCase() },
  });

  if (existing) {
    const error = new Error(`Card number ${cardNumber} already exists in the system`);
    error.statusCode = 409;
    throw error;
  }

  const card = await prisma.idCard.create({
    data: {
      cardNumber:  cardNumber.trim().toUpperCase(),
      holderName:  holderName.trim(),
      sex,
      dateOfBirth: new Date(dateOfBirth),
      expiryDate:  new Date(expiryDate),
      cardStatus:  cardStatus || 'ACTIVE',
      issuedAt:    new Date(),
    },
  });

  return card;
};

// ── Staff: update card status ──────────────────────────────────
const updateCardStatus = async ({ cardNumber, cardStatus, staffId }) => {
  const card = await prisma.idCard.findUnique({
    where: { cardNumber: cardNumber.trim().toUpperCase() },
  });

  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.idCard.update({
    where: { cardNumber: cardNumber.trim().toUpperCase() },
    data:  { cardStatus },
  });
};

// ── Citizen: get all their own ID cards ────────────────────────
const getMyCitizenIDCards = async (citizenId) => {
  return await prisma.idCard.findMany({
    where:   { application: { citizenId } },
    include: {
      application: {
        select: {
          type:   true,
          status: true,
          agency: { select: { name: true } },
        },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });
};

// ── Get one ID card by id ──────────────────────────────────────
const getIDCardById = async ({ cardId, citizenId, role }) => {
  const idCard = await prisma.idCard.findUnique({
    where:   { id: cardId },
    include: {
      application: {
        include: {
          citizen: { select: { id: true, fullName: true, email: true } },
          agency:  { select: { name: true } },
        },
      },
    },
  });

  if (!idCard) {
    const error = new Error('ID Card not found');
    error.statusCode = 404;
    throw error;
  }

  if (role === 'CITIZEN' && idCard.application?.citizen?.id !== citizenId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  return idCard;
};

// ── Staff: mark application as collected ──────────────────────
const markAsCollected = async ({ applicationId, staffAgencyId }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { citizen: true, agency: true, idCard: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (!application.idCard) {
    const error = new Error('No ID card has been issued for this application yet');
    error.statusCode = 400;
    throw error;
  }

  if (application.status === 'COLLECTED') {
    const error = new Error('This application has already been marked as collected');
    error.statusCode = 409;
    throw error;
  }

  await prisma.application.update({
    where: { id: applicationId },
    data:  { status: 'COLLECTED' },
  });

  await notifyStatusChange({
    citizen:         application.citizen,
    applicationType: application.type,
    status:          'COLLECTED',
  });

  return { message: 'Application marked as collected successfully' };
};

// ── PUBLIC: search card by card number ────────────────────────
const searchByCardNumber = async (cardNumber) => {
  if (!cardNumber || cardNumber.trim().length < 3) {
    const error = new Error('Please enter a valid card number');
    error.statusCode = 400;
    throw error;
  }

  const idCard = await prisma.idCard.findUnique({
    where: { cardNumber: cardNumber.trim().toUpperCase() },
    include: {
      application: {
        select: {
          type:      true,
          status:    true,
          createdAt: true,
          updatedAt: true,
          agency:    { select: { name: true } },
          citizen:   { select: { fullName: true } },
        },
      },
    },
  });

  if (!idCard) {
    const error = new Error('No record found for this card number. Please check and try again.');
    error.statusCode = 404;
    throw error;
  }

  const isManual = !idCard.application;

  return {
    cardNumber:  idCard.cardNumber,
    holderName:  isManual ? idCard.holderName : idCard.application.citizen.fullName,
    cardStatus:  idCard.cardStatus,
    issuedAt:    idCard.issuedAt,
    expiryDate:  idCard.expiryDate,
    type:        isManual ? null : idCard.application.type,
    status:      isManual ? null : idCard.application.status,
    agency:      isManual ? null : idCard.application.agency.name,
    appliedAt:   isManual ? null : idCard.application.createdAt,
    lastUpdated: isManual ? idCard.updatedAt : idCard.application.updatedAt,
    isManual,
  };
};

module.exports = {
  issueIDCard,
  createManualCard,
  updateCardStatus,
  getMyCitizenIDCards,
  getIDCardById,
  markAsCollected,
  searchByCardNumber,
};