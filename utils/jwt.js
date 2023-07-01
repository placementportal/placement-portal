const jwt = require("jsonwebtoken");

const createUserToken = (user) => {
  return { userId: user.id, name: user.name, role: user.role, email: user.email };
};

const createJWT = (userToken) => jwt.sign(userToken, process.env.JWT_SECRET);

const verifyJWT = (cookie) => jwt.verify(cookie, process.env.JWT_SECRET);

const attachCookieToResponse = (res, userToken) => {
  const accessTokenJWT = createJWT(userToken);

  const oneDay = 24 * 60 * 60 * 1000;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + 30 * oneDay), // 30 days
  });
};

module.exports = {
  createJWT,
  verifyJWT,
  createUserToken,
  attachCookieToResponse,
};