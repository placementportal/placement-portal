const UserModel = require("../models/User");
const StudentPersonalDataModel = require("../models/StudentPersonalData");
const StudentEducationDataModel = require("../models/StudentEducationData");
const {
  StudentPlacementDataModel,
  StudentExperienceDataModel,
  StudentJobDataModel,
} = require("../models/StudentJobData");

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

const getExperiences = async (req, res) => {
  const student_id = req.user.userId;

  const experiences = await StudentExperienceDataModel.find({ student_id });

  if (!experiences || !experiences.length) {
    throw new CustomAPIError.NotFoundError("No experiences found!");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Experiences found!",
    experiences
  });
};

const createExperience = async (req, res) => {
  const student_id = req.user.userId;
  let { jobProfile, company, startDate, endDate } = req.body;

  if (!startDate) {
    throw new CustomAPIError.BadRequestError("Start Date is required!");
  }

  startDate = new Date(startDate);
  if (startDate == "Invalid Date")
    throw new CustomAPIError.BadRequestError("Invalid Start Date!");

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == "Invalid Date")
      throw new CustomAPIError.BadRequestError("Invalid End Date!");
  }

  const experience = await StudentExperienceDataModel.create({
    student_id,
    jobProfile,
    company,
    startDate,
    endDate,
  });

  let jobData = await StudentJobDataModel.findOne({ student_id });
  if (!jobData) {
    jobData = await StudentJobDataModel.create({ student_id });
  }

  jobData.experiences.push(experience._id);
  await jobData.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "New Experience created!",
    id: experience._id,
  });
};

const updateExperience = async (req, res) => {
  const student_id = req.user.userId;
  const experienceId = req.params?.id;

  let { jobProfile, company, startDate, endDate } = req.body;

  if (!experienceId?.trim()) {
    throw new CustomAPIError.BadRequestError("Experience Id is required");
  }

  const experience = await StudentExperienceDataModel.findOne({
    _id: experienceId,
    student_id,
  });

  if (!experience) {
    throw new CustomAPIError.NotFoundError(
      `No experience found with id: ${experienceId}`
    );
  }

  if (startDate) {
    startDate = new Date(startDate);
    if (startDate == "Invalid Date")
      throw new CustomAPIError.BadRequestError("Invalid Start Date!");
  }

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == "Invalid Date")
      throw new CustomAPIError.BadRequestError("Invalid End Date!");
  }

  await StudentExperienceDataModel.findByIdAndUpdate(experienceId, {
    jobProfile,
    company,
    startDate,
    endDate,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Experience updated!",
  });
};

module.exports = {
  getEducationData,
  updateEducationData,
  getExperiences,
  createExperience,
  updateExperience,
};
