const prisma = require('../../../prisma/prisma.client');

// Helper — verify the application belongs to the citizen and is an NRB/NATIONAL_ID type
const resolveApplication = async (applicationId, citizenId) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { nrbForm: true },
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

  if (application.type !== 'NATIONAL_ID') {
    const error = new Error('This application is not an NRB (National ID) application');
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

// Citizen: submit or update the NRB form
const submitNrbForm = async ({ applicationId, citizenId, formData }) => {
  const application = await resolveApplication(applicationId, citizenId);

  // Parse dateOfBirth to Date objects
  const data = {
    ...formData,
    dateOfBirth: new Date(formData.dateOfBirth),
  };

  // If a form already exists, update it
  if (application.nrbForm) {
    return await prisma.nrbForm.update({
      where: { applicationId },
      data,
    });
  }

  // Otherwise create fresh
  return await prisma.nrbForm.create({
    data: { applicationId, ...data },
  });
};

// Citizen or staff: get the NRB form for an application
const getNrbForm = async ({ applicationId, citizenId, role }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { nrbForm: true },
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

  if (!application.nrbForm) {
    const error = new Error('No NRB form submitted for this application yet');
    error.statusCode = 404;
    throw error;
  }

  return application.nrbForm;
};

// Agency staff: verify the NRB form
const verifyNrbForm = async ({ applicationId, staffId, isVerified }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { nrbForm: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (!application.nrbForm) {
    const error = new Error('No NRB form found for this application');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.nrbForm.update({
    where: { applicationId },
    data: {
      isVerified,
      verifiedAt:   isVerified ? new Date() : null,
      verifiedById: isVerified ? staffId    : null,
    },
  });
};

module.exports = { submitNrbForm, getNrbForm, verifyNrbForm };