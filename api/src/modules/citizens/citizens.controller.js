const citizensService = require('./citizens.service');

const getMe = async (req, res) => {
  try {
    const citizen = await citizensService.getMe(req.user.id);
    res.status(200).json({ data: citizen });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const updated = await citizensService.updateMe(req.user.id, req.body);
    res.status(200).json({
      message: 'Profile updated successfully',
      data:    updated,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAllCitizens = async (req, res) => {
  try {
    const { search } = req.query;
    const citizens = await citizensService.getAllCitizens({ search });
    res.status(200).json({
      count: citizens.length,
      data:  citizens,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getCitizenById = async (req, res) => {
  try {
    const citizen = await citizensService.getCitizenById(req.params.id);
    res.status(200).json({ data: citizen });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { getMe, updateMe, getAllCitizens, getCitizenById };