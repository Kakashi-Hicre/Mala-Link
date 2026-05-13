const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const upload   = require('../../common/middlewares/upload.middleware');
const {
  uploadDocument,
  getApplicationDocuments,
  deleteDocument,
} = require('./documents.controller');

router.use(protect); // all routes require login

// POST /api/documents/upload/:applicationId
// upload.single('file') means we expect one file in a field named "file"
router.post(
  '/upload/:applicationId',
  restrictTo('CITIZEN'),
  upload.single('file'),
  uploadDocument
);

// GET /api/documents/:applicationId
router.get('/:applicationId', getApplicationDocuments);

// DELETE /api/documents/:documentId
router.delete('/:documentId', restrictTo('CITIZEN', 'ADMIN'), deleteDocument);

module.exports = router;