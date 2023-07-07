const UserModel = require("../models/User");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const { createUserToken, attachCookieToResponse } = require("../utils");

const login = async (req, res) => {
  const role = req.params?.role;

  let { password } = req.body;

  if (!role || (role != "student" && role != "admin")) {
    throw new CustomAPIError.BadRequestError("Invalid role");
  }

  let user;

  if (role == "student") {
    let { roll_no } = req.body;

    if (!roll_no?.trim() || !password?.trim()) {
      throw new CustomAPIError.BadRequestError(
        "Please provide Roll No. & Date of Birth"
      );
    }

    const date_of_birth = new Date(password);
    console.log(roll_no, date_of_birth);
    if (date_of_birth == "Invalid Date") {
      throw new CustomAPIError.BadRequestError("Invalid date of birth!");
    }

    user = await UserModel.findOne({ roll_no, role });
  } else if (role == "admin") {
    const { email } = req.body;

    if (!email?.trim() || !password) {
      throw new CustomAPIError.BadRequestError(
        "Please provide email & password"
      );
    }

    user = await UserModel.findOne({ email: email.toLowerCase(), role });
  }

  if (!user) {
    console.log("no user");
    throw new CustomAPIError.UnauthenticatedError("Authentication failed");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomAPIError.UnauthenticatedError("Authentication failed");
  }

  const userToken = createUserToken(user);
  attachCookieToResponse(res, userToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User Logged in",
  });
};

const logout = async (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now()),
  });
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "logged out successfully" });
};

module.exports = {
  login,
  logout,
};
