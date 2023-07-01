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

module.exports = { authenticateUser };
