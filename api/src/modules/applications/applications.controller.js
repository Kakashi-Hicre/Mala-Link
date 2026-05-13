const applicationsService = require('./applications.service');

// POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { type, agencyName } = req.body;
    const citizenId = req.user.id;

    const application = await applicationsService.createApplication({
      citizenId,
      type,
      agencyName,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// POST /api/applications/:id/form
const submitForm = async (req, res) => {
  try {
    const {
      fullName, dateOfBirth, sex, placeOfBirth, district,
      nationality, physicalAddress, phone, email,
      nextOfKinName, nextOfKinPhone, nextOfKinRelation,
      existingLicenceNo, previousPassportNo,
    } = req.body;

    // dateOfBirth must be a valid date string e.g. "1995-04-12"
    const form = await applicationsService.submitApplicationForm({
      applicationId: req.params.id,
      citizenId:     req.user.id,
      formData: {
        fullName,
        dateOfBirth:    new Date(dateOfBirth),
        sex,            // "MALE" or "FEMALE"
        placeOfBirth,
        district,
        nationality:    nationality || 'Malawian',
        physicalAddress,
        phone,
        email:          email || null,
        nextOfKinName,
        nextOfKinPhone,
        nextOfKinRelation,
        existingLicenceNo:  existingLicenceNo  || null,
        previousPassportNo: previousPassportNo || null,
      },
    });

    res.status(201).json({
      message: 'Application form submitted successfully',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/applications/:id/form
const getForm = async (req, res) => {
  try {
    const form = await applicationsService.getApplicationForm({
      applicationId: req.params.id,
      citizenId:     req.user.id,
      role:          req.user.role,
    });
    res.status(200).json({ data: form });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id/form/verify  (staff only)
const verifyForm = async (req, res) => {
  try {
    const { isVerified } = req.body; // true or false

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be true or false' });
    }

    const form = await applicationsService.verifyApplicationForm({
      applicationId: req.params.id,
      staffId:       req.user.id,
      isVerified,
    });

    res.status(200).json({
      message: isVerified ? 'Form verified successfully' : 'Form marked as unverified',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const applications = await applicationsService.getMyCitizenApplications(req.user.id);
    res.status(200).json({
      count: applications.length,
      data:  applications,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await applicationsService.getApplicationById({
      applicationId: req.params.id,
      citizenId:     req.user.id,
      role:          req.user.role,
    });
    res.status(200).json({ data: application });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/applications/agency/all  (staff only)
const getAgencyApplications = async (req, res) => {
  try {
    if (!req.user.agencyId) {
      return res.status(403).json({ message: 'Not linked to any agency' });
    }

    const { status, type } = req.query;
    const applications = await applicationsService.getAgencyApplications({
      agencyId: req.user.agencyId,
      status,
      type,
    });

    res.status(200).json({
      count: applications.length,
      data:  applications,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id/status  (staff/admin only)
const updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await applicationsService.updateApplicationStatus({
      applicationId: req.params.id,
      status,
      notes,
      staffId: req.user.id,
    });

    res.status(200).json({
      message: `Application status updated to ${status}`,
      data:    updated,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/applications  (admin only)
const getAllApplications = async (req, res) => {
  try {
    const { status, type } = req.query;
    const applications = await applicationsService.getAllApplications({ status, type });
    res.status(200).json({
      count: applications.length,
      data:  applications,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  createApplication,
  submitForm,
  getForm,
  verifyForm,
  getMyApplications,
  getApplicationById,
  getAgencyApplications,
  updateStatus,
  getAllApplications,
};