const path  = require('path');
const fs    = require('fs');
const prisma = require('../../prisma/prisma.client');

// Upload a document linked to an application
const uploadDocument = async ({ applicationId, citizenId, file }) => {
  // 1. Verify the application exists and belongs to this citizen
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    // Clean up the file multer already saved — no orphan files
    fs.unlinkSync(file.path);
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (application.citizenId !== citizenId) {
    fs.unlinkSync(file.path);
    const error = new Error('This application does not belong to you');
    error.statusCode = 403;
    throw error;
  }

  // 2. Only allow uploads when application is PENDING or PROCESSING
  if (!['PENDING', 'PROCESSING', 'PRINTING', 'READY'].includes(application.status)) {
    fs.unlinkSync(file.path);
    const error = new Error(`Cannot upload documents for an application that is ${application.status}`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Build a clean URL path for the file
  // This is what the frontend will use to display the file
  const fileUrl = `/uploads/${applicationId}/${file.filename}`;

  // 4. Save the document record in the database
  const document = await prisma.document.create({
    data: {
      applicationId,
      fileName: file.originalname,
      fileUrl,
      fileType: file.mimetype,
    },
  });

  return document;
};

// Get all documents for one application
const getApplicationDocuments = async ({ applicationId, citizenId, role }) => {
  // Verify the application exists
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  // Citizens can only see their own application documents
  if (role === 'CITIZEN' && application.citizenId !== citizenId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.document.findMany({
    where:   { applicationId },
    orderBy: { uploadedAt: 'desc' },
  });
};

// Delete a document (citizen can only delete their own)
const deleteDocument = async ({ documentId, citizenId, role }) => {
  const document = await prisma.document.findUnique({
    where:   { id: documentId },
    include: { application: true },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  // Citizens can only delete documents on their own applications
  if (role === 'CITIZEN' && document.application.citizenId !== citizenId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  // 1. Delete the physical file from disk
  const filePath = path.join(__dirname, '../../../', document.fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // 2. Delete the database record
  await prisma.document.delete({ where: { id: documentId } });

  return { message: 'Document deleted successfully' };
};

module.exports = { uploadDocument, getApplicationDocuments, deleteDocument };