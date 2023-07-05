const UserModel = require("../models/User");
const StudentPersonalDataModel = require("../models/StudentPersonalData");
const StudentEducationDataModel = require("../models/StudentEducationData");
const {
  StudentPlacementDataModel,
  StudentExperienceDataModel,
  StudentJobDataModel,
} = require("../models/StudentJobData");

const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require("../models/Course");

const TrainingModel = require("../models/Training");
const AwardModel = require("../models/Award");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { fileUpload } = require("../utils/fileUpload");

const getPersonalData = async (req, res) => {
  const student_id = req.user.userId;

  const student = await UserModel.findById(student_id)
    .select("name email photo personal_details")
    .populate("personal_details");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Pesonal details found!",
    student,
  });
};

const getEducationData = async (req, res) => {
  const student_id = req.user.userId;
  const student = await UserModel.findById(student_id)
    .select("roll_no courseId batchId departmentId education_details")
    .populate({
      path: "courseId",
      select: "courseName",
    })
    .populate({
      path: "batchId",
      select: "batchYear",
    })
    .populate({
      path: "departmentId",
      select: "departmentName",
    })
    .populate({
      path: "education_details",
      select: "-student_id -_id",
    });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Education Details found!",
    data: student,
  });
};

const updateEducationData = async (req, res) => {
  const student_id = req.user.userId;

  let {
    is_lateral_entry,
    highschool_year,
    highschool_score,
    highschool_board,
    intermediate_year,
    intermediate_score,
    intermediate_board,
    diploma_year,
    diploma_score,
    diploma_board,
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
      highschool_board,
    });
    await UserModel.findOneAndUpdate(
      { role: "student", _id: student_id },
      {
        education_details: currentDetails._id,
      }
    );
  }

  if (btech_scores && !Array.isArray(btech_scores))
    throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");

  if (is_lateral_entry) {
    intermediate_year = intermediate_score = undefined;

    if (!diploma_score || !diploma_year || !diploma_board)
      throw new CustomAPIError.BadRequestError("Enter Diploma Details!");

    if (btech_scores.length > 6)
      throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");
  } else {
    diploma_year = diploma_score = undefined;

    if (!intermediate_score || !intermediate_year || !intermediate_board)
      throw new CustomAPIError.BadRequestError("Enter Intermediate Details!");

    if (btech_scores.length > 8)
      throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");
  }

  await StudentEducationDataModel.findByIdAndUpdate(currentDetails._id, {
    is_lateral_entry,
    highschool_year,
    highschool_score,
    highschool_board,
    intermediate_year,
    intermediate_score,
    intermediate_board,
    diploma_year,
    diploma_score,
    diploma_board,
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
    experiences,
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

const createPlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let { offerLetter, joiningLetter } = req?.files;
  const student_id = req.user.userId;

  if (joiningDate) {
    joiningDate = new Date(joiningDate);
    if (joiningDate == "Invalid Date") {
      throw new CustomAPIError.BadRequestError("Invalid joining date!");
    }
  }

  if (offerLetter) {
    const fileUploadResp = await fileUpload(
      offerLetter,
      "offer-letters",
      "document"
    );
    const { fileURL } = fileUploadResp;
    offerLetter = fileURL;
  }

  if (joiningLetter) {
    if (!joiningDate)
      throw new CustomAPIError.BadRequestError("Joining Date is required!");

    joiningDate = new Date(joiningDate);
    if (joiningDate == "Invalid Date")
      throw new CustomAPIError.BadRequestError("Invalid Joining Date!");

    const fileUploadResp = await fileUpload(
      joiningLetter,
      "joining-letters",
      "document"
    );
    const { fileURL } = fileUploadResp;
    joiningLetter = fileURL;
  }

  const placement = await StudentPlacementDataModel.create({
    student_id,
    jobProfile,
    company,
    location,
    package,
    joiningDate,
    offerLetter,
    joiningLetter,
  });

  let jobData = await StudentJobDataModel.findOne({ student_id });
  if (!jobData) {
    jobData = await StudentJobDataModel.create({ student_id });
  }

  jobData.placements.push(placement._id);
  await jobData.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "New Placement created!",
    id: placement._id,
  });
};

const getPlacements = async (req, res) => {
  const student_id = req.user.userId;

  const placements = await StudentPlacementDataModel.find({ student_id });

  if (!placements || !placements.length) {
    throw new CustomAPIError.NotFoundError("No placements found!");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Placements found!",
    placements,
  });
};

const createTraining = async (req, res) => {
  let { trainingName, organisation, startDate, endDate } = req.body;
  const student_id = req.user.userId;

  startDate = new Date(startDate);
  if (startDate == "Invalid Date")
    throw new CustomAPIError.BadRequestError("Invalid start date!");

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == "Invalid Date")
      throw new CustomAPIError.BadRequestError("Invalid end date!");
  }

  const training = await TrainingModel.create({
    student_id,
    trainingName,
    organisation,
    startDate,
    endDate,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Training Created!",
    id: training._id,
  });
};

const getTrainings = async (req, res) => {
  const student_id = req.user.userId;
  const trainings = await TrainingModel.find({ student_id });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Found trainings!",
    trainings,
  });
};

const createAward = async (req, res) => {
  let { awardName, organisation, description } = req.body;
  const student_id = req.user.userId;

  const award = await AwardModel.create({
    student_id,
    awardName,
    organisation,
    description,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Award Created!",
    id: award._id,
  });
};

const getAwards = async (req, res) => {
  const student_id = req.user.userId;
  const awards = await AwardModel.find({ student_id });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Found Awards!",
    awards,
  });
};

module.exports = {
  getEducationData,
  updateEducationData,
  getExperiences,
  createExperience,
  updateExperience,
  createPlacement,
  getPlacements,
  getPersonalData,
  createTraining,
  getTrainings,
  createAward,
  getAwards,
};
