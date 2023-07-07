const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");

const UserModel = require("../models/User");
const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require("../models/Course");

const showCurrentUser = async (req, res) => {
  const user = req.user;

  const userData = await UserModel.findById(req.user.userId);

  if (user.role == "student") {
    const { courseId, batchId, departmentId, lastNoticeFetched } = userData;

    const course = await CourseModel.findById(courseId);
    const batch = await BatchModel.findById(batchId);
    const department = await DepartmentModel.findById(departmentId);

    const minLastNotice = Math.min(
      course.lastNoticeTime,
      batch.lastNoticeTime,
      department.lastNoticeTime
    );

    const notification = lastNoticeFetched < minLastNotice;

    user["noticeNotification"] = notification;
  }

  res.status(StatusCodes.OK).json({ success: true, user });
};

const getUserById = async (req, res) => {
  const userId = req?.params?.userId;

  if (!userId) {
    throw new CustomAPIError.BadRequestError("User Id is required");
  }

  const user = UserModel.findOne({ _id: userId, role: "user" });

  if (user) {
    return res.json({
      success: true,
      message: `User found with id: ${userId}`,
      user: user.name,
    });
  }

  return res.json({
    success: false,
    message: `No user found with id: ${userId}`,
  });
};

module.exports = {
  showCurrentUser,
  getUserById,
};
