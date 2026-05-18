const path   = require('path');
const fs     = require('fs');
const prisma = require('../../prisma/prisma.client');

// Valid values from the DocumentType enum in schema.prisma
const VALID_DOCUMENT_TYPES = [
  'PASSPORT_PHOTO',
  'FINGERPRINT',
  'DIGITAL_SIGNATURE',
  'NATIONAL_ID_SCAN',
  'MEDICAL_CERTIFICATE',
  'BIRTH_CERTIFICATE',
  'SUPPORTING_DOC',
];

// Valid values from the CaptureMethod enum
const VALID_CAPTURE_METHODS = ['WEBCAM', 'UPLOAD'];

// Upload a document linked to an application
const uploadDocument = async ({ applicationId, citizenId, file, documentType, captureMethod }) => {
  // 1. Validate enums before hitting the DB
  if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
    fs.unlinkSync(file.path);
    const error = new Error(`Invalid documentType "${documentType}". Valid types: ${VALID_DOCUMENT_TYPES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (!VALID_CAPTURE_METHODS.includes(captureMethod)) {
    fs.unlinkSync(file.path);
    const error = new Error(`Invalid captureMethod "${captureMethod}". Must be WEBCAM or UPLOAD`);
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify the application exists and belongs to this citizen
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
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

  // 3. Only allow uploads when application is PENDING or PROCESSING
  if (!['PENDING', 'PROCESSING', 'PRINTING', 'READY'].includes(application.status)) {
    fs.unlinkSync(file.path);
    const error = new Error(`Cannot upload documents for an application that is ${application.status}`);
    error.statusCode = 400;
    throw error;
  }

  // 4. Build the URL path — served statically by Express
  const fileUrl = `/uploads/${applicationId}/${file.filename}`;

  // 5. Save the document record with the new schema fields
  const document = await prisma.document.create({
    data: {
      applicationId,
      fileName:      file.originalname,
      fileUrl,
      documentType,   // e.g. "PASSPORT_PHOTO"
      captureMethod,  // e.g. "WEBCAM" or "UPLOAD"
      mimeType:      file.mimetype,  // e.g. "image/jpeg"
    },
  });

  return document;
};

// Get all documents for one application
const getApplicationDocuments = async ({ applicationId, citizenId, role }) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
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

  return await prisma.document.findMany({
    where:   { applicationId },
    orderBy: { uploadedAt: 'desc' },
  });
};

// Delete a document
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

  if (role === 'CITIZEN' && document.application.citizenId !== citizenId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  // Delete the physical file from disk
  const filePath = path.join(__dirname, '../../../', document.fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Delete the DB record
  await prisma.document.delete({ where: { id: documentId } });

  return { message: 'Document deleted successfully' };
};

module.exports = { uploadDocument, getApplicationDocuments, deleteDocument };