const UserModel = require('../models/User');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const { createUserToken, attachCookieToResponse } = require('../utils');

const login = async (req, res) => {
  let { email, password } = req.body;

  if (!email?.trim() || !password) {
    CustomAPIError.BadRequestError("Email and Password is required")
  }

  email = email.trim().toLowerCase();

  const user = await UserModel.findOne({ email });

  if (!user) {
    console.log('no user');
    throw new CustomAPIError.UnauthenticatedError('Authentication failed');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomAPIError.UnauthenticatedError('Authentication failed');
  }

  const userToken = createUserToken(user);
  attachCookieToResponse(res, userToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User Logged in',
    role: user.role,
  });
};

const logout = async (req, res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    signed: true,
    secure: true,
    expires: new Date(Date.now()),
    sameSite: "none",
  });
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'logged out successfully' });
};

module.exports = {
  login,
  logout,
};
