const applicationsService = require('./applications.service');

// POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { type, agencyName } = req.body;

    const application = await applicationsService.createApplication({
      citizenId: req.user.id,
      type,
      agencyName,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      data:    application,
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
  getMyApplications,
  getApplicationById,
  getAgencyApplications,
  updateStatus,
  getAllApplications,
};