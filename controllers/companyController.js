const JobOpeningModel = require('../models/JobOpenings');
const CompanyModel = require('../models/Company');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const {
  validateNoticeReceivers: validateReceivers,
} = require('./noticeController');

const getCompanies = async (req, res) => {
  const companies = await CompanyModel.find();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Companies found!',
    companies,
  });
};

const createJobOpening = async (req, res) => {
  const {
    profile,
    description,
    location,
    jobPackage,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
    keySkills,
    openingsCount,
    deadline,
  } = req.body;

  const { id: companyId } = req.params;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  const postedBy = req?.user?.userId;
  if (!company.admins.includes(postedBy))
    throw new CustomAPIError.BadRequestError(
      `Not allowed to create an opening for company with id: ${companyId}`
    );

  const { course, batches, departments } = await validateReceivers({
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  });

  const jobOpening = await JobOpeningModel.create({
    profile,
    description,
    location,
    company: companyId,
    jobPackage,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
    keySkills,
    postedBy,
    openingsCount,
    deadline,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created Job Opening',
    id: jobOpening._id,
  });

  course.lastJobOpening = jobOpening.createdAt;
  await course.save();

  for (let batch of batches) {
    batch.lastJobOpening = jobOpening.createdAt;
    await batch.save();
  }

  for (let department of departments) {
    department.lastJobOpening = jobOpening.createdAt;
    await department.save();
  }
};

const getJobsForIncharge = async (req, res) => {
  const { id: companyId } = req.params;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  const userId = req.user.userId;
  if (!company.admins.includes(userId))
    throw new CustomAPIError.BadRequestError(
      `Not allowed to access this resource!`
    );

  const jobs = await JobOpeningModel.find({ company: companyId })
    .populate({
      path: 'company',
      select: 'name website'
    })
    .populate({
      path: 'receivingCourse',
      select: 'courseName',
    })
    .populate({
      path: 'receivingBatches',
      select: 'batchYear',
    })
    .populate({
      path: 'receivingDepartments',
      select: 'departmentName',
    })
    .populate({
      path: 'postedBy',
      select: 'name',
    });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found job openings!',
    jobs,
  });
};

module.exports = {
  getCompanies,
  createJobOpening,
  getJobsForIncharge,
};
