const prisma = require('../../../prisma/prisma.client')

const resolveApplication = async (applicationId, citizenId) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { immigrationForm: true },
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

  if (application.type !== 'PASSPORT') {
    const error = new Error('This application is not an Immigration (Passport) application');
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

// Citizen: submit or update the Immigration form
const submitImmigrationForm = async ({ applicationId, citizenId, formData }) => {
  const application = await resolveApplication(applicationId, citizenId);

  const data = {
    ...formData,
    dateOfBirth: new Date(formData.dateOfBirth),
  };

  if (application.immigrationForm) {
    return await prisma.immigrationForm.update({
      where: { applicationId },
      data,
    });
  }

  return await prisma.immigrationForm.create({
    data: { applicationId, ...data },
  });
};

// Citizen or staff: get the Immigration form
const getImmigrationForm = async ({ applicationId, citizenId, role }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { immigrationForm: true },
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

  if (!application.immigrationForm) {
    const error = new Error('No Immigration form submitted for this application yet');
    error.statusCode = 404;
    throw error;
  }

  return application.immigrationForm;
};

// Agency staff: verify the Immigration form
const verifyImmigrationForm = async ({ applicationId, staffId, isVerified }) => {
  const application = await prisma.application.findUnique({
    where:   { id: applicationId },
    include: { immigrationForm: true },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (!application.immigrationForm) {
    const error = new Error('No Immigration form found for this application');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.immigrationForm.update({
    where: { applicationId },
    data: {
      isVerified,
      verifiedAt:   isVerified ? new Date() : null,
      verifiedById: isVerified ? staffId    : null,
    },
  });
};

module.exports = { submitImmigrationForm, getImmigrationForm, verifyImmigrationForm };