const drtssFormService = require('./drtssForm.service');

// POST /api/forms/drtss/:applicationId
const submitDrtssForm = async (req, res) => {
  try {
    const {
      fullName, dateOfBirth, sex, nationality, nationalIdNo,
      residentialAddress, phone,
      licenceCategories,   // array e.g. ["A", "B"]
      existingLicenceNo,
    } = req.body;

    const form = await drtssFormService.submitDrtssForm({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      formData: {
        fullName,
        dateOfBirth,
        sex,
        nationality:       nationality    || 'Malawian',
        nationalIdNo,
        residentialAddress,
        phone,
        licenceCategories: Array.isArray(licenceCategories) ? licenceCategories : [licenceCategories],
        existingLicenceNo: existingLicenceNo || null,
      },
    });

    res.status(201).json({
      message: 'DRTSS form submitted successfully',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/forms/drtss/:applicationId
const getDrtssForm = async (req, res) => {
  try {
    const form = await drtssFormService.getDrtssForm({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      role:          req.user.role,
    });
    res.status(200).json({ data: form });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/forms/drtss/:applicationId/verify  (staff only)
const verifyDrtssForm = async (req, res) => {
  try {
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be true or false' });
    }

    const form = await drtssFormService.verifyDrtssForm({
      applicationId: req.params.applicationId,
      staffId:       req.user.id,
      isVerified,
    });

    res.status(200).json({
      message: isVerified ? 'DRTSS form verified' : 'DRTSS form marked as unverified',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { submitDrtssForm, getDrtssForm, verifyDrtssForm };