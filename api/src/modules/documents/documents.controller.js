const documentsService = require('./documents.service');

// POST /api/documents/upload/:applicationId
// Body fields (multipart/form-data):
//   file          — the actual file
//   documentType  — e.g. "PASSPORT_PHOTO", "FINGERPRINT", "NATIONAL_ID_SCAN" …
//   captureMethod — "WEBCAM" or "UPLOAD"
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, captureMethod } = req.body;

    if (!documentType) {
      return res.status(400).json({
        message: 'documentType is required. Valid: PASSPORT_PHOTO, FINGERPRINT, DIGITAL_SIGNATURE, NATIONAL_ID_SCAN, MEDICAL_CERTIFICATE, BIRTH_CERTIFICATE, SUPPORTING_DOC',
      });
    }

    if (!captureMethod) {
      return res.status(400).json({
        message: 'captureMethod is required. Valid: WEBCAM or UPLOAD',
      });
    }

    const document = await documentsService.uploadDocument({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      file:          req.file,
      documentType,
      captureMethod,
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      data:    document,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/documents/:applicationId
const getApplicationDocuments = async (req, res) => {
  try {
    const documents = await documentsService.getApplicationDocuments({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      role:          req.user.role,
    });

    res.status(200).json({
      count: documents.length,
      data:  documents,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// DELETE /api/documents/:documentId
const deleteDocument = async (req, res) => {
  try {
    const result = await documentsService.deleteDocument({
      documentId: req.params.documentId,
      citizenId:  req.user.id,
      role:       req.user.role,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, getApplicationDocuments, deleteDocument };