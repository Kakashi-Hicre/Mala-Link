const prisma = require('../../../prisma/prisma.client')

const resolveApplication = async (applicationId, citizenId) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { drtssForm: true },
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

  if (application.type !== 'DRIVING_LICENCE') {
    const error = new Error('This application is not a DRTSS (Driving Licence) application');
    error.statusCode = 400;
    throw error;
  }

  if (!['PENDING', 'PROCESSING'].includes(application.status)) {
    const error = new Error(`Cannot modify a form for an application that is ${application.status}`);
    error.statusCode = 400;
    throw error;
  }

  return application;
};

// Valid licence categories from the schema enum
const VALID_CATEGORIES = ['A', 'B', 'C1', 'C', 'D1', 'D'];

// Citizen: submit or update the DRTSS form
const submitDrtssForm = async ({ applicationId, citizenId, formData }) => {
  const application = await resolveApplication(applicationId, citizenId);

  // Validate licence categories
  const categories = formData.licenceCategories || [];
  if (categories.length === 0) {
    const error = new Error('At least one licence category must be selected');
    error.statusCode = 400;
    throw error;
  }

  const invalid = categories.filter(c => !VALID_CATEGORIES.includes(c));
  if (invalid.length > 0) {
    const error = new Error(`Invalid licence categories: ${invalid.join(', ')}. Valid: ${VALID_CATEGORIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const data = {
    ...formData,
    dateOfBirth: new Date(formData.dateOfBirth),
  };

  if (application.drtssForm) {
    return await prisma.drtssForm.update({
      where: { applicationId },
      data,
    });
  }

  return await prisma.drtssForm.create({
    data: { applicationId, ...data },
  });
};

// Citizen or staff: get the DRTSS form
const getDrtssForm = async ({ applicationId, citizenId, role }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { drtssForm: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (role === 'CITIZEN' && application.citizenId !== citizenId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  if (!application.drtssForm) {
    const error = new Error('No DRTSS form submitted for this application yet');
    error.statusCode = 404;
    throw error;
  }

  return application.drtssForm;
};

// Agency staff: verify the DRTSS form
const verifyDrtssForm = async ({ applicationId, staffId, isVerified }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { drtssForm: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (!application.drtssForm) {
    const error = new Error('No DRTSS form found for this application');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.drtssForm.update({
    where: { applicationId },
    data: {
      isVerified,
      verifiedAt:   isVerified ? new Date() : null,
      verifiedById: isVerified ? staffId    : null,
    },
  });
};

module.exports = { submitDrtssForm, getDrtssForm, verifyDrtssForm };