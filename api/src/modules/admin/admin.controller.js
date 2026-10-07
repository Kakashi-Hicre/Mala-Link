const { getOverview, getAllStaff, deleteStaff, getAllCards } = require('./admin.service');

const getOverviewHandler = async (req, res, next) => {
  try { res.json({ data: await getOverview() }); }
  catch (err) { next(err); }
};

const getAllStaffHandler = async (req, res, next) => {
  try { res.json({ data: await getAllStaff(req.query) }); }
  catch (err) { next(err); }
};

const deleteStaffHandler = async (req, res, next) => {
  try { res.json({ data: await deleteStaff(req.params.id) }); }
  catch (err) { next(err); }
};

const getAllCardsHandler = async (req, res, next) => {
  try { res.json({ data: await getAllCards(req.query) }); }
  catch (err) { next(err); }
};

module.exports = {
  getOverviewHandler, getAllStaffHandler,
  deleteStaffHandler, getAllCardsHandler,
};
