const jwt    = require('jsonwebtoken');
const { jwtSecret } = require('../../config/app.config');
const prisma = require('../../prisma/prisma.client');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Check if this is a citizen or agency staff token
    // Agency staff tokens carry a role of AGENCY_STAFF
    if (decoded.role === 'AGENCY_STAFF') {
      const staff = await prisma.agencyStaff.findUnique({
        where:   { id: decoded.sub },
        include: { agency: true },
      });

      if (!staff) return res.status(401).json({ message: 'Staff no longer exists' });

      req.user = {
        id:       staff.id,
        fullName: staff.fullName,
        email:    staff.email,
        role:     staff.role,
        agencyId: staff.agencyId,  // ← this is how controllers know which agency
      };
    } else {
      const citizen = await prisma.citizen.findUnique({
        where:  { id: decoded.sub },
        select: { id: true, fullName: true, email: true, role: true },
      });

      if (!citizen) return res.status(401).json({ message: 'User no longer exists' });
      req.user = citizen;
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };