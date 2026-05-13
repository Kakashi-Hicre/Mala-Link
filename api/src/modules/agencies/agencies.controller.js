const agenciesService = require('./agencies.service');

const createStaff = async (req, res) => {
  try {
    const staff = await agenciesService.createStaff(req.body);
    res.status(201).json({
      message: 'Staff account created',
      data:    staff,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const staffLogin = async (req, res) => {
  try {
    const result = await agenciesService.staffLogin(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAllAgencies = async (req, res) => {
  try {
    const agencies = await agenciesService.getAllAgencies();
    res.status(200).json({ data: agencies });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAgencyStats = async (req, res) => {
  try {
    const stats = await agenciesService.getAgencyStats(req.params.id);
    res.status(200).json({ data: stats });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { createStaff, staffLogin, getAllAgencies, getAgencyStats };