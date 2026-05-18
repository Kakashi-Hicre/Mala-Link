const immigrationFormService = require('./immigrationForm.service');

// POST /api/forms/immigration/:applicationId
const submitImmigrationForm = async (req, res) => {
  try {
    const {
      surname, givenNames, maidenName,
      dateOfBirth, placeOfBirth, sex, nationality,
      occupation, nationalIdNo,
      heightMeters, eyeColour,
      permanentAddress, phone, email,
      previousPassportNo,
    } = req.body;

    const form = await immigrationFormService.submitImmigrationForm({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      formData: {
        surname,
        givenNames,
        maidenName:        maidenName        || null,
        dateOfBirth,
        placeOfBirth,
        sex,
        nationality:       nationality       || 'Malawian',
        occupation,
        nationalIdNo,
        heightMeters:      parseFloat(heightMeters),
        eyeColour,
        permanentAddress,
        phone,
        email:             email             || null,
        previousPassportNo: previousPassportNo || null,
      },
    });

    res.status(201).json({
      message: 'Immigration form submitted successfully',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/forms/immigration/:applicationId
const getImmigrationForm = async (req, res) => {
  try {
    const form = await immigrationFormService.getImmigrationForm({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      role:          req.user.role,
    });
    res.status(200).json({ data: form });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/forms/immigration/:applicationId/verify  (staff only)
const verifyImmigrationForm = async (req, res) => {
  try {
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be true or false' });
    }

    const form = await immigrationFormService.verifyImmigrationForm({
      applicationId: req.params.applicationId,
      staffId:       req.user.id,
      isVerified,
    });

    res.status(200).json({
      message: isVerified ? 'Immigration form verified' : 'Immigration form marked as unverified',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { submitImmigrationForm, getImmigrationForm, verifyImmigrationForm };