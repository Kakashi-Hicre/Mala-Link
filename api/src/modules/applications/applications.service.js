const prisma = require('../../prisma/prisma.client');
const { notifyStatusChange } = require('../notifications/notifications.service');

// Citizen: submit a new application
const createApplication = async ({ citizenId, type, agencyName }) => {
  const agency = await prisma.agency.findUnique({
    where: { name: agencyName },
  });

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

  const application = await prisma.application.create({
    data: { citizenId, agencyId: agency.id, type },
    include: {
      citizen: { select: { id: true, fullName: true, email: true } },
      agency:  { select: { id: true, name: true } },
    },
  });

  return application;
};

// Citizen: submit the application form for a specific application
const submitApplicationForm = async ({ applicationId, citizenId, formData }) => {
  // 1. Verify application exists and belongs to this citizen
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { form: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (application.citizenId !== citizenId) {
    const error = new Error('This application does not belong to you');
    error.statusCode = 403;
    throw error;
  }

  // 2. Only allow form submission for PENDING applications
  if (!['PENDING', 'PROCESSING'].includes(application.status)) {
    const error = new Error(`Cannot submit a form for an application that is ${application.status}`);
    error.statusCode = 400;
    throw error;
  }

  // 3. If form already exists, update it instead of creating
  if (application.form) {
    const updated = await prisma.applicationForm.update({
      where: { applicationId },
      data:  formData,
    });
    return updated;
  }

  // 4. Create new form
  const form = await prisma.applicationForm.create({
    data: {
      applicationId,
      ...formData,
    },
  });

  return form;
};

// Get the form for a specific application
const getApplicationForm = async ({ applicationId, citizenId, role }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { form: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  // Citizens can only see their own
  if (role === 'CITIZEN' && application.citizenId !== citizenId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  if (!application.form) {
    const error = new Error('No form submitted for this application yet');
    error.statusCode = 404;
    throw error;
  }

  return application.form;
};

// Agency staff: verify (approve) or flag an application form
const verifyApplicationForm = async ({ applicationId, staffId, isVerified }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { form: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (!application.form) {
    const error = new Error('No form found for this application');
    error.statusCode = 404;
    throw error;
  }

  const updatedForm = await prisma.applicationForm.update({
    where: { applicationId },
    data: {
      isVerified,
      verifiedAt:   isVerified ? new Date() : null,
      verifiedById: isVerified ? staffId    : null,
    },
  });

  return updatedForm;
};

// Citizen: get all their own applications
const getMyCitizenApplications = async (citizenId) => {
  return await prisma.application.findMany({
    where: { citizenId },
    include: {
      agency:    { select: { name: true } },
      documents: { select: { id: true, fileName: true, fileUrl: true } },
      idCard:    true,
      form:      { select: { isVerified: true, fullName: true, createdAt: true } },
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
      form:      true,
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
      form:      true,   // ← staff need to see the form to verify it
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Agency staff/admin: update application status
const updateApplicationStatus = async ({ applicationId, status, notes, staffId }) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
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
      form:    { select: { isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  createApplication,
  submitApplicationForm,
  getApplicationForm,
  verifyApplicationForm,
  getMyCitizenApplications,
  getApplicationById,
  getAgencyApplications,
  updateApplicationStatus,
  getAllApplications,
};