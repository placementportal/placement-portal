const UserModel = require('../models/User');

const {
  PersonalDataModel,
  EducationModel,
  CurrentScoreModel,
  PastScoreModel,
  PlacementModel,
  ExperienceModel,
  TrainingModel,
} = require('../models/student');

const { studentProfileDetailsAgg } = require('../models/aggregations');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { fileUpload } = require('../utils/fileUpload');

const getPersonalData = async (req, res) => {
  const studentId = req.user.userId;

  const student = await UserModel.findById(studentId)
    .select('name email photo personalDetails')
    .populate('personalDetails');

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Pesonal details found!',
    student,
  });
};

const updatePersonalData = async (req, res) => {
  const {
    fatherName,
    motherName,
    contactNumber,
    locality,
    city,
    pincode,
    district,
    state,
  } = req.body;

  const studentId = req.user.userId;

  const { lastErrorObject } = await PersonalDataModel.findOneAndUpdate(
    { studentId },
    {
      studentId,
      fatherName,
      motherName,
      contactNumber,
      address: { locality, city, pincode, district, state },
    },
    {
      upsert: true,
      rawResult: true,
      runValidators: true,
    }
  );

  const { updatedExisting, upserted } = lastErrorObject;

  if (!updatedExisting) {
    const student = await UserModel.findById(studentId);
    student.personalDetails = upserted;
    await student.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated Personal Details',
  });
};

const getEducationData = async (req, res) => {
  const studentId = req.user.userId;

  const educationData = await EducationModel.findOne({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Education Details found!',
    educationData,
  });
};

const updateEducationData = async (req, res) => {
  const update = req?.params?.update;
  const validUpdates = [
    'highschool',
    'intermediate',
    'diploma',
    'graduation',
    'postGraduation',
  ];

  if (!validUpdates.includes(update))
    throw new CustomAPIError.BadRequestError('Invalid update request!');

  const userId = req?.user?.userId;

  const student = await UserModel.findById(userId);
  if (!student) throw new CustomAPIError.BadRequestError('Invalid student');

  const {
    _id: studentId,
    courseLevel,
    isLateralEntry,
    semestersCount,
  } = student;

  let lastErrorObject;

  /* HIGHSCHOOL, INTER & DIPLOMA UPDATE */
  if (
    update === 'highschool' ||
    update === 'intermediate' ||
    update === 'diploma'
  ) {
    lastErrorObject = await updatePastEducationRecord(
      {
        ...req.body,
        courseLevel,
        isLateralEntry,
        studentId,
      },
      update
    );
  } else if (update === 'graduation') {
    /* GRADUATION UPDATE */
    if (courseLevel === 'graduation')
      lastErrorObject = await updateCurrentScoreRecord(
        {
          ...req.body,
          courseLevel,
          isLateralEntry,
          studentId,
          semestersCount,
        },
        update
      );
    else if (courseLevel === 'PG')
      lastErrorObject = await updatePastEducationRecord(
        {
          ...req.body,
          courseLevel,
          isLateralEntry,
          studentId,
        },
        update
      );
  } else if (update === 'postGraduation') {
    /* POST GRADUATION UPDATE */

    if (courseLevel === 'graduation')
      throw new CustomAPIError.BadRequestError(
        'Post Graduation Data is not allowed!'
      );

    lastErrorObject = await updateCurrentScoreRecord({
      ...req.body,
      courseLevel,
      isLateralEntry,
      studentId,
      semestersCount,
    });
  }

  const { updatedExisting, upserted } = lastErrorObject;
  if (!updatedExisting) {
    student.educationDetails = upserted;
    await student.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Education Record Updated!',
  });
};

const getExperiences = async (req, res) => {
  const studentId = req.user.userId;

  const experiences = await ExperienceModel.find({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Experiences found!',
    experiences,
  });
};

const getExperienceById = async (req, res) => {
  const id = req?.params?.id;
  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const experience = await ExperienceModel.findById(id);

  if (!experience)
    throw new CustomAPIError.NotFoundError(
      `No experience found with id: ${id}`
    );

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Experience found with id: ${id}`,
    experience,
  });
};

const createExperience = async (req, res) => {
  const studentId = req.user.userId;
  let { jobProfile, company, startDate, endDate } = req.body;

  if (!startDate) {
    throw new CustomAPIError.BadRequestError('Start Date is required!');
  }

  startDate = new Date(startDate);
  if (startDate == 'Invalid Date')
    throw new CustomAPIError.BadRequestError('Invalid Start Date!');

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid End Date!');
  }

  const experience = await ExperienceModel.create({
    studentId,
    jobProfile,
    company,
    startDate,
    endDate,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'New Experience created!',
    id: experience._id,
  });

  const student = await UserModel.findById(studentId);
  student.experiences.push(experience._id);
  await student.save();
};

const updateExperience = async (req, res) => {
  const studentId = req.user.userId;
  const id = req?.params?.id;

  let { jobProfile, company, startDate, endDate } = req.body;

  if (!id?.trim()) {
    throw new CustomAPIError.BadRequestError('Experience Id is required');
  }

  const experience = await ExperienceModel.findById(id);

  if (!experience) {
    throw new CustomAPIError.NotFoundError(
      `No experience found with id: ${id}`
    );
  }

  if (experience.studentId != studentId && req.user.role !== 'admin') {
    throw new CustomAPIError.UnauthorizedError(
      'Not authorized to perform this action'
    );
  }

  if (startDate) {
    startDate = new Date(startDate);
    if (startDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid Start Date!');
  }

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid End Date!');
  }

  await ExperienceModel.findByIdAndUpdate(experience._id, {
    jobProfile,
    company,
    startDate,
    endDate,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Experience updated!',
    id,
  });
};

const deleteExperience = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const experience = await ExperienceModel.findById(id);

  if (!experience)
    throw new CustomAPIError.NotFoundError(`No Experience found with ${id}`);

  if (
    experience.studentId.toString() != studentId &&
    req.user.role != 'admin'
  ) {
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to perform this action'
    );
  }

  await ExperienceModel.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Experience deleted!',
    id,
  });

  const student = await UserModel.findById(studentId);
  student.experiences = student.experiences.filter(
    (ele) => ele.toString() !== id
  );
  await student.save();
};

const createPlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let offerLetter = req?.files?.offerLetter;
  let joiningLetter = req?.files?.joiningLetter;
  const studentId = req.user.userId;

  if (joiningDate) {
    joiningDate = new Date(joiningDate);
    if (joiningDate == 'Invalid Date') {
      throw new CustomAPIError.BadRequestError('Invalid joining date!');
    }
  }

  if (offerLetter) {
    const fileUploadResp = await fileUpload(
      offerLetter,
      'offer-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    offerLetter = fileURL;
  }

  if (joiningLetter) {
    if (!joiningDate)
      throw new CustomAPIError.BadRequestError('Joining Date is required!');

    const fileUploadResp = await fileUpload(
      joiningLetter,
      'joining-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    joiningLetter = fileURL;
  }

  const placement = await PlacementModel.create({
    studentId,
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
    message: 'New Placement created!',
    id: placement._id,
  });

  const student = await UserModel.findById(studentId);
  student.placements.push(placement._id);
  await student.save();
};

const getPlacements = async (req, res) => {
  const studentId = req.user.userId;

  const placements = await PlacementModel.find({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Placements found!',
    placements,
  });
};

const getPlacementById = async (req, res) => {
  const id = req?.params?.id;
  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const placement = await PlacementModel.findById(id);
  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Placement found with id: ${id}`,
    placement,
  });
};

const updatePlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let offerLetter = req?.files?.offerLetter;
  let joiningLetter = req?.files?.joiningLetter;
  const studentId = req.user.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const placement = await PlacementModel.findById(id);

  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with id: ${id}`);

  if (placement.studentId.toString() != studentId && req.user.role != 'admin') {
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to perform this action'
    );
  }

  if (joiningDate) {
    joiningDate = new Date(joiningDate);
    if (joiningDate == 'Invalid Date') {
      throw new CustomAPIError.BadRequestError('Invalid joining date!');
    }
  }

  if (offerLetter) {
    const fileUploadResp = await fileUpload(
      offerLetter,
      'offer-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    offerLetter = fileURL;
  }

  if (joiningLetter) {
    if (!joiningDate)
      throw new CustomAPIError.BadRequestError('Joining Date is required!');

    const fileUploadResp = await fileUpload(
      joiningLetter,
      'joining-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    joiningLetter = fileURL;
  }

  await PlacementModel.findByIdAndUpdate(id, {
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
    message: 'Placement Updated!',
    id,
  });
};

const deletePlacement = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const placement = await PlacementModel.findById(id);

  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with ${id}`);

  if (placement.studentId.toString() != studentId && req.user.role != 'admin') {
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to perform this action'
    );
  }

  await PlacementModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Placement deleted!',
    id,
  });

  const student = await UserModel.findById(studentId);
  student.placements = student.placements.filter(
    (ele) => ele.toString() !== id
  );
  await student.save();
};

const createTraining = async (req, res) => {
  let { trainingName, organisation, startDate, endDate } = req.body;
  const studentId = req.user.userId;
  let certificate = req?.files?.certificate;

  startDate = new Date(startDate);
  if (startDate == 'Invalid Date')
    throw new CustomAPIError.BadRequestError('Invalid start date!');

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid end date!');
  }

  if (certificate) {
    if (!endDate)
      throw new CustomAPIError.BadRequestError('End Date is required!');

    const fileUploadResp = await fileUpload(
      certificate,
      'training_certificates',
      'document'
    );
    const { fileURL } = fileUploadResp;
    certificate = fileURL;
  }

  const training = await TrainingModel.create({
    studentId,
    trainingName,
    organisation,
    startDate,
    endDate,
    certificate,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Training Created!',
    id: training._id,
  });

  const student = await UserModel.findById(studentId);
  student.trainings.push(training._id);
  await student.save();
};

const getTrainings = async (req, res) => {
  const studentId = req.user.userId;
  const trainings = await TrainingModel.find({ studentId });
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found trainings!',
    trainings,
  });
};

const getTrainingById = async (req, res) => {
  const id = req?.params?.id;
  const studentId = req.user.userId;
  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const training = await TrainingModel.findOne({
    _id: id,
    studentId,
  });

  if (!training)
    throw new CustomAPIError.NotFoundError(`No Training found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Training found with id: ${id}`,
    training,
  });
};

const updateTraining = async (req, res) => {
  let { trainingName, organisation, startDate, endDate } = req.body;
  let certificate = req?.files?.certificate;
  const studentId = req.user.userId;
  const id = req?.params?.id;

  startDate = new Date(startDate);
  if (startDate == 'Invalid Date')
    throw new CustomAPIError.BadRequestError('Invalid start date!');

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid end date!');
  }

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const training = await TrainingModel.findOne({
    _id: id,
    studentId,
  });

  if (!training)
    throw new CustomAPIError.NotFoundError(`No training found with id: ${id}`);

  if (certificate) {
    if (!endDate)
      throw new CustomAPIError.BadRequestError('End Date is required!');

    const fileUploadResp = await fileUpload(
      certificate,
      'training_certificates',
      'document'
    );
    const { fileURL } = fileUploadResp;
    certificate = fileURL;
  }

  await TrainingModel.findByIdAndUpdate(id, {
    trainingName,
    organisation,
    startDate,
    endDate,
    certificate,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Training Updated!',
    id,
  });
};

const deleteTraining = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const training = await TrainingModel.findOne({ _id: id, studentId });
  if (!training) {
    throw new CustomAPIError.NotFoundError(`No Training found with ${id}`);
  }

  await TrainingModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Training deleted!',
    id,
  });

  const student = await UserModel.findById(studentId);
  student.trainings = student.trainings.filter((ele) => ele.toString() !== id);
  await student.save();
};

const getStudentProfile = async (req, res) => {
  const studentId = req?.user?.userId;
  const profileDetails = (
    await UserModel.aggregate(studentProfileDetailsAgg(studentId, true))
  )[0];
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile Details Found!',
    profileDetails,
  });
};

async function updatePastEducationRecord(data, label) {
  const {
    studentId,
    courseLevel,
    isLateralEntry,
    year,
    scale,
    score,
    institute,
    board,
  } = data;

  const doc = new PastScoreModel({
    year,
    scale,
    score,
    institute,
    board,
  });

  throwDocErrors(doc, `Invalid ${label} data`);

  const { lastErrorObject } = await EducationModel.findOneAndUpdate(
    { studentId },
    {
      studentId,
      isLateralEntry,
      courseLevel,
      [label]: doc,
    },
    { upsert: true, runValidators: true, rawResult: true }
  );

  return lastErrorObject;
}

async function updateCurrentScoreRecord(data, label) {
  const {
    studentId,
    isLateralEntry,
    courseLevel,
    scores,
    semestersCount,
    aggregateGPA,
  } = data;

  const doc = new CurrentScoreModel({
    semestersCount,
    scores,
    aggregateGPA,
  });

  throwDocErrors(doc, `Invalid ${label} data`);

  const { lastErrorObject } = await EducationModel.findOneAndUpdate(
    { studentId },
    {
      studentId,
      isLateralEntry,
      courseLevel,
      [label]: doc,
    },
    { upsert: true, runValidators: true, rawResult: true }
  );

  return lastErrorObject;
}

function throwDocErrors(doc, message) {
  const error = doc.validateSync();
  if (error) {
    for (let key in error?.errors) {
      message = error?.errors?.[key]?.message;
      break;
    }
    throw new CustomAPIError.BadRequestError(message);
  }
}

module.exports = {
  getEducationData,
  updateEducationData,

  getPersonalData,
  updatePersonalData,
  getStudentProfile,

  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,

  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,

  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};
