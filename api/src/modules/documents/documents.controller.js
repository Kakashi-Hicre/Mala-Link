const documentsService = require('./documents.service');

// POST /api/documents/upload/:applicationId
const uploadDocument = async (req, res) => {
  try {
    // req.file is set by Multer middleware before this runs
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = await documentsService.uploadDocument({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      file:          req.file,
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