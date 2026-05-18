const nrbFormService = require('./nrbForm.service');

// POST /api/forms/nrb/:applicationId
const submitNrbForm = async (req, res) => {
  try {
    const {
      // Full name
      firstName, otherNames, surname,
      // Personal
      dateOfBirth, sex, maritalStatus, nationality, secondNationality,
      colourOfEyes, heightMeters, phone, birthCertNo, passportNo, disability,
      // Place of birth
      birthDistrict, birthTA, birthVillage,
      // Residential
      residentialDistrict, residentialTA, residentialVillage,
      // Permanent home
      permanentDistrict, permanentTA, permanentVillage,
      // Mother
      motherFullName, motherNationality, motherIdNo,
      motherDistrict, motherTA, motherVillage,
      // Father
      fatherFullName, fatherNationality, fatherIdNo,
      fatherDistrict, fatherTA, fatherVillage,
    } = req.body;

    const form = await nrbFormService.submitNrbForm({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      formData: {
        firstName,
        otherNames:        otherNames        || null,
        surname,
        dateOfBirth,
        sex,
        maritalStatus,
        nationality:       nationality       || 'Malawian',
        secondNationality: secondNationality || null,
        colourOfEyes,
        heightMeters:      parseFloat(heightMeters),
        phone,
        birthCertNo:       birthCertNo       || null,
        passportNo:        passportNo        || null,
        disability:        disability        || null,
        birthDistrict,
        birthTA,
        birthVillage,
        residentialDistrict,
        residentialTA,
        residentialVillage,
        permanentDistrict,
        permanentTA,
        permanentVillage,
        motherFullName,
        motherNationality: motherNationality || 'Malawian',
        motherIdNo:        motherIdNo        || null,
        motherDistrict,
        motherTA:          motherTA          || null,
        motherVillage:     motherVillage     || null,
        fatherFullName,
        fatherNationality: fatherNationality || 'Malawian',
        fatherIdNo:        fatherIdNo        || null,
        fatherDistrict,
        fatherTA:          fatherTA          || null,
        fatherVillage:     fatherVillage     || null,
      },
    });

    res.status(201).json({
      message: 'NRB form submitted successfully',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/forms/nrb/:applicationId
const getNrbForm = async (req, res) => {
  try {
    const form = await nrbFormService.getNrbForm({
      applicationId: req.params.applicationId,
      citizenId:     req.user.id,
      role:          req.user.role,
    });
    res.status(200).json({ data: form });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/forms/nrb/:applicationId/verify  (staff only)
const verifyNrbForm = async (req, res) => {
  try {
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be true or false' });
    }

    const form = await nrbFormService.verifyNrbForm({
      applicationId: req.params.applicationId,
      staffId:       req.user.id,
      isVerified,
    });

    res.status(200).json({
      message: isVerified ? 'NRB form verified' : 'NRB form marked as unverified',
      data:    form,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { submitNrbForm, getNrbForm, verifyNrbForm };