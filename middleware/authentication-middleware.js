const { verifyJWT } = require("../utils");
const CustomAPIError = require("../errors");

const authenticateUser = async (req, res, next) => {
  try {
    const { accessToken } = req.signedCookies;

    if (!accessToken) {
      throw new CustomAPIError.UnauthenticatedError("Authentication Failed");
    }

    const userPayload = verifyJWT(accessToken, process.env.JWT_SECRET);

    req.user = userPayload;

    next();
  } catch (error) {
    throw new CustomAPIError.UnauthenticatedError("Authentication Failed");
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomAPIError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
