const idcardsService = require('./idcards.service');

// POST /api/idcards/:applicationId/issue  (staff)
const issueIDCard = async (req, res) => {
  try {
    const idCard = await idcardsService.issueIDCard({
      applicationId: req.params.applicationId,
      staffAgencyId: req.user.agencyId,
    });

    res.status(201).json({
      message: 'ID Card issued successfully',
      data:    idCard,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// POST /api/idcards/manual  (staff — manually register an existing physical card)
const createManualCard = async (req, res) => {
  try {
    const {
      cardNumber,
      holderName,
      sex,
      dateOfBirth,
      expiryDate,
      cardStatus,
    } = req.body;

    // Basic validation
    if (!cardNumber || !holderName || !sex || !dateOfBirth || !expiryDate) {
      return res.status(400).json({
        message: 'cardNumber, holderName, sex, dateOfBirth and expiryDate are all required',
      });
    }

    if (!['MALE', 'FEMALE'].includes(sex)) {
      return res.status(400).json({ message: 'sex must be MALE or FEMALE' });
    }

    const card = await idcardsService.createManualCard({
      staffId:  req.user.id,
      cardData: { cardNumber, holderName, sex, dateOfBirth, expiryDate, cardStatus },
    });

    res.status(201).json({
      message: 'Card registered successfully',
      data:    card,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/idcards/:cardNumber/status  (staff)
const updateCardStatus = async (req, res) => {
  try {
    const { cardStatus } = req.body;

    if (!['ACTIVE', 'EXPIRED', 'LOST', 'SUSPENDED'].includes(cardStatus)) {
      return res.status(400).json({
        message: 'cardStatus must be one of: ACTIVE, EXPIRED, LOST, SUSPENDED',
      });
    }

    const card = await idcardsService.updateCardStatus({
      cardNumber: req.params.cardNumber,
      cardStatus,
      staffId:    req.user.id,
    });

    res.status(200).json({
      message: `Card status updated to ${cardStatus}`,
      data:    card,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/idcards/my  (citizen)
const getMyIDCards = async (req, res) => {
  try {
    const cards = await idcardsService.getMyCitizenIDCards(req.user.id);
    res.status(200).json({
      count: cards.length,
      data:  cards,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/idcards/:id  (citizen sees own / staff sees all)
const getIDCardById = async (req, res) => {
  try {
    const card = await idcardsService.getIDCardById({
      cardId:    req.params.id,
      citizenId: req.user.id,
      role:      req.user.role,
    });
    res.status(200).json({ data: card });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// PATCH /api/idcards/:applicationId/collect  (staff)
const markAsCollected = async (req, res) => {
  try {
    const result = await idcardsService.markAsCollected({
      applicationId: req.params.applicationId,
      staffAgencyId: req.user.agencyId,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// GET /api/idcards/search?cardNumber=  (PUBLIC — no auth)
const searchIDCard = async (req, res) => {
  try {
    const { cardNumber } = req.query;

    if (!cardNumber) {
      return res.status(400).json({ message: 'cardNumber query parameter is required' });
    }

    const result = await idcardsService.searchByCardNumber(cardNumber);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  issueIDCard,
  createManualCard,
  updateCardStatus,
  getMyIDCards,
  getIDCardById,
  markAsCollected,
  searchIDCard,
};