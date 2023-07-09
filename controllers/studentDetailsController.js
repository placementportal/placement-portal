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

  let { is_lateral_entry, updateBody, update } = req.body;

  const validUpdates = ["highschool", "intermediate", "diploma", "btech"];
  if (!update?.trim() || !validUpdates.includes(update) || !updateBody) {
    throw new CustomAPIError.BadRequestError("Invalid Update Request!");
  }

  if (is_lateral_entry && update == "intermediate") {
    throw new CustomAPIError.BadRequestError("Invalid Update Request!");
  } else if (!is_lateral_entry && update == "diploma") {
    throw new CustomAPIError.BadRequestError("Invalid Update Request!");
  }

  let currentDetails;
  currentDetails = await StudentEducationDataModel.findOne({
    student_id,
  });

  if (!currentDetails) {
    currentDetails = await StudentEducationDataModel.create({
      student_id,
      is_lateral_entry,
    });
    await UserModel.findOneAndUpdate(
      { role: "student", _id: student_id },
      {
        education_details: currentDetails._id,
      }
    );
  }

  if (update == "highschool") {
    const { highschool_board, highschool_score, highschool_year } = updateBody;
    if (!highschool_board?.trim() || !highschool_year || !highschool_score) {
      throw new CustomAPIError.BadRequestError("Invalid HighSchool Data!");
    }
  } else if (update == "intermediate") {
    const { intermediate_board, intermediate_score, intermediate_year } =
      updateBody;
    if (
      !intermediate_board?.trim() ||
      !intermediate_year ||
      !intermediate_score
    ) {
      throw new CustomAPIError.BadRequestError("Invalid Intermediate Data!");
    }
  } else if (update == "diploma") {
    const { diploma_board, diploma_score, diploma_year } = updateBody;
    if (!diploma_board?.trim() || !diploma_score || !diploma_year) {
      throw new CustomAPIError.BadRequestError("Invalid Diploma Data!");
    }
  } else if (update == "btech") {
    const { btech_scores } = updateBody;
    let scoresMaxCount = is_lateral_entry ? 6 : 8;

    if (
      !btech_scores ||
      !Array.isArray(btech_scores) ||
      btech_scores.length > scoresMaxCount
    )
      throw new CustomAPIError.BadRequestError("Invalid B. Tech. scores!");
  }

  await StudentEducationDataModel.findByIdAndUpdate(currentDetails._id, {
    ...updateBody,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Education Details Updated!",
  });
};

const getExperiences = async (req, res) => {
  const student_id = req.user.userId;

  const experiences = await StudentExperienceDataModel.find({ student_id });

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
  const experienceId = req?.params?.id;

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
    id: experienceId,
  });
};

const deleteExperience = async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const experience = await StudentExperienceDataModel.findOne({
    _id: id,
    student_id,
  });

  if (!experience)
    throw new CustomAPIError.NotFoundError(`No Experience found with ${id}`);

  await StudentExperienceDataModel.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Experience deleted!",
    id,
  });

  const jobData = await StudentJobDataModel.findOne({ student_id });
  jobData.experiences = jobData.experiences.filter((ele) => ele != id);
  await jobData.save();
};

const createPlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let offerLetter = req?.files?.offerLetter;
  let joiningLetter = req?.files?.joiningLetter;
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

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Placements found!",
    placements,
  });
};

const updatePlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let offerLetter = req?.files?.offerLetter;
  let joiningLetter = req?.files?.joiningLetter;
  const student_id = req.user.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const placement = await StudentPlacementDataModel.findOne({
    _id: id,
    student_id,
  });
  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with id: ${id}`);

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

    const fileUploadResp = await fileUpload(
      joiningLetter,
      "joining-letters",
      "document"
    );
    const { fileURL } = fileUploadResp;
    joiningLetter = fileURL;
  }

  await StudentPlacementDataModel.findByIdAndUpdate(id, {
    jobProfile,
    company,
    location,
    package,
    joiningDate,
    offerLetter,
    joiningLetter,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Placement Updated!",
    id,
  });
};

const deletePlacement = async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const placement = await StudentPlacementDataModel.findOne({
    _id: id,
    student_id,
  });

  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with ${id}`);

  await StudentPlacementDataModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Placement deleted!",
    id,
  });

  const jobData = await StudentJobDataModel.findOne({ student_id });
  jobData.placements = jobData.placements.filter(ele => ele != id);
  await jobData.save();
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

const updateTraining = async (req, res) => {
  let { trainingName, organisation, startDate, endDate } = req.body;
  const student_id = req.user.userId;
  const id = req?.params?.id;

  startDate = new Date(startDate);
  if (startDate == "Invalid Date")
    throw new CustomAPIError.BadRequestError("Invalid start date!");

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == "Invalid Date")
      throw new CustomAPIError.BadRequestError("Invalid end date!");
  }

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const training = await TrainingModel.findOne({
    _id: id,
    student_id,
  });

  if (!training)
    throw new CustomAPIError.NotFoundError(`No training found with id: ${id}`);

  await TrainingModel.findByIdAndUpdate(id, {
    trainingName,
    organisation,
    startDate,
    endDate,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Training Updated!",
    id,
  });
};

const deleteTraining = async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const training = await TrainingModel.findOne({ _id: id, student_id });
  if (!training) {
    throw new CustomAPIError.NotFoundError(`No Training found with ${id}`);
  }

  await TrainingModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Training deleted!",
    id,
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

const updateAward = async (req, res) => {
  let { awardName, organisation, description } = req.body;
  const student_id = req.user.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const award = await AwardModel.findOne({
    _id: id,
    student_id,
  });

  if (!award)
    throw new CustomAPIError.NotFoundError(`No award found with id: ${id}`);

  await AwardModel.findByIdAndUpdate(id, {
    awardName,
    organisation,
    description,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Award Updated!",
    id,
  });
};

const deleteAward = async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError("Id is required!");

  const award = await AwardModel.findOne({ _id: id, student_id });
  if (!award) {
    throw new CustomAPIError.NotFoundError(`No award found with ${id}`);
  }

  await AwardModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Award deleted!",
    id,
  });
};

module.exports = {
  getEducationData,
  updateEducationData,

  getPersonalData,

  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,

  createPlacement,
  getPlacements,
  updatePlacement,
  deletePlacement,

  createTraining,
  getTrainings,
  updateTraining,
  deleteTraining,

  createAward,
  getAwards,
  updateAward,
  deleteAward,
};
