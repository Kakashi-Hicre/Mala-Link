const prisma = require('../../prisma/prisma.client');
const { notifyStatusChange } = require('../notifications/notifications.service');

// ── Helper: get whichever form exists for an application ───────
// Returns { form, formType } or { form: null }
const getFormForApplication = (application) => {
  if (application.nrbForm)         return { form: application.nrbForm,        formType: 'nrbForm'         };
  if (application.immigrationForm) return { form: application.immigrationForm, formType: 'immigrationForm' };
  if (application.drtssForm)       return { form: application.drtssForm,       formType: 'drtssForm'       };
  return { form: null, formType: null };
};

// ── Include clause that pulls all three possible forms ─────────
const FULL_FORM_INCLUDE = {
  nrbForm:         true,
  immigrationForm: true,
  drtssForm:       true,
};

// Citizen: submit a new application
const createApplication = async ({ citizenId, type, agencyName }) => {
  const agency = await prisma.agency.findUnique({ where: { name: agencyName } });

  if (!agency) {
    const error = new Error(`Agency ${agencyName} not found. Valid options: NRB, DRTSS, IMMIGRATION`);
    error.statusCode = 404;
    throw error;
  }

  const existing = await prisma.application.findFirst({
    where: {
      citizenId,
      type,
      status: { in: ['PENDING', 'PROCESSING', 'PRINTING'] },
    },
  });

  if (existing) {
    const error = new Error(`You already have an active ${type.replace('_', ' ')} application (Status: ${existing.status})`);
    error.statusCode = 409;
    throw error;
  }

  return await prisma.application.create({
    data: { citizenId, agencyId: agency.id, type },
    include: {
      citizen: { select: { id: true, fullName: true, email: true } },
      agency:  { select: { id: true, name: true } },
    },
  });
};

// Citizen: get all their own applications
const getMyCitizenApplications = async (citizenId) => {
  return await prisma.application.findMany({
    where: { citizenId },
    include: {
      agency:    { select: { name: true } },
      documents: { select: { id: true, fileName: true, fileUrl: true, documentType: true } },
      idCard:    true,
      ...FULL_FORM_INCLUDE,
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Citizen: track one specific application
const getApplicationById = async ({ applicationId, citizenId, role }) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      citizen:   { select: { id: true, fullName: true, email: true, phone: true } },
      agency:    { select: { name: true } },
      documents: true,
      idCard:    true,
      ...FULL_FORM_INCLUDE,
    },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (role === 'CITIZEN' && application.citizenId !== citizenId) {
    const error = new Error('You do not have access to this application');
    error.statusCode = 403;
    throw error;
  }

  return application;
};

// Agency staff: get all applications for their agency
const getAgencyApplications = async ({ agencyId, status, type }) => {
  const where = { agencyId };
  if (status) where.status = status;
  if (type)   where.type   = type;

  return await prisma.application.findMany({
    where,
    include: {
      citizen:   { select: { id: true, fullName: true, email: true, phone: true } },
      documents: true,
      idCard:    true,
      ...FULL_FORM_INCLUDE,
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Agency staff/admin: update application status
const updateApplicationStatus = async ({ applicationId, status, notes, staffId }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { citizen: true, agency: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  const statusOrder  = ['PENDING', 'PROCESSING', 'PRINTING', 'READY', 'COLLECTED'];
  const currentIndex = statusOrder.indexOf(application.status);
  const newIndex     = statusOrder.indexOf(status);

  if (status !== 'REJECTED' && newIndex < currentIndex) {
    const error = new Error(`Cannot move status from ${application.status} back to ${status}`);
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data:  { status, notes: notes || application.notes },
    include: {
      citizen: { select: { id: true, fullName: true, email: true } },
      agency:  { select: { name: true } },
    },
  });

  await notifyStatusChange({
    citizen:         updated.citizen,
    applicationType: updated.type,
    status:          updated.status,
  });

  return updated;
};

// Admin only: get all applications across all agencies
const getAllApplications = async ({ status, type }) => {
  const where = {};
  if (status) where.status = status;
  if (type)   where.type   = type;

  return await prisma.application.findMany({
    where,
    include: {
      citizen: { select: { id: true, fullName: true, email: true } },
      agency:  { select: { name: true } },
      // Only include verification status, not full form data
      nrbForm:         { select: { isVerified: true } },
      immigrationForm: { select: { isVerified: true } },
      drtssForm:       { select: { isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  createApplication,
  getMyCitizenApplications,
  getApplicationById,
  getAgencyApplications,
  updateApplicationStatus,
  getAllApplications,
  getFormForApplication,       // exported so idcards.service can use it
  FULL_FORM_INCLUDE,           // exported so idcards.service can use it
};