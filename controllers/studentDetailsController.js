const UserModel = require("../models/User");
const StudentPersonalDataModel = require("../models/StudentPersonalData");
const StudentEducationDataModel = require("../models/StudentEducationData");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const getEducationData = async (req, res) => {
  const education_details = await StudentEducationDataModel.findOne({
    student_id: req.user.userId,
  }).select("-createdAt -updatedAt -student_id");

  if (!education_details) {
    throw new CustomAPIError.NotFoundError(
      `No education record found for this user`
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Education Details found!",
    education_details,
  });
};

const updateEducationData = async (req, res) => {
  const student_id = req.user.userId;

  let {
    is_lateral_entry,
    highschool_year,
    highschool_score,
    intermediate_year,
    intermediate_score,
    diploma_year,
    diploma_score,
    btech_scores,
  } = req.body;

  let currentDetails;
  currentDetails = await StudentEducationDataModel.findOne({
    student_id,
  });

  if (!currentDetails) {
    currentDetails = await StudentEducationDataModel.create({
      student_id,
      is_lateral_entry,
      highschool_year,
      highschool_score,
    });
    await UserModel.findOneAndUpdate(
      { role: "student", _id: student_id },
      {
        education_details: currentDetails._id,
      }
    );
  }

  if (!Array.isArray(btech_scores))
    throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");

  if (is_lateral_entry) {
    intermediate_year = intermediate_score = undefined;

    if (!diploma_score || !diploma_year)
      throw new CustomAPIError.BadRequestError("Enter Diploma Details!");

    if (btech_scores.length > 6)
      throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");
  } else {
    diploma_year = diploma_score = undefined;

    if (!intermediate_score || !intermediate_year)
      throw new CustomAPIError.BadRequestError("Enter Intermediate Details!");

    if (btech_scores.length > 8)
      throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");
  }

  await StudentEducationDataModel.findByIdAndUpdate(currentDetails._id, {
    is_lateral_entry,
    highschool_year,
    highschool_score,
    intermediate_year,
    intermediate_score,
    diploma_year,
    diploma_score,
    btech_scores,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Education Details Updated!",
  });
};

module.exports = {
  getEducationData,
  updateEducationData,
};
