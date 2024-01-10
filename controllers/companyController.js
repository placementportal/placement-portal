const JobOpeningModel = require('../models/JobOpenings');
const CompanyModel = require('../models/Company');
const JobApplicationModel = require('../models/JobApplication');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const {
  validateNoticeReceivers: validateReceivers,
} = require('./noticeController');

const { jobApplicationsAgg } = require('../models/aggregations');
const UserModel = require('../models/User');

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

  const { userId: postedBy, companyId } = req.user;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

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
  const { companyId, userId } = req.user;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (!company.admins.includes(userId))
    throw new CustomAPIError.BadRequestError(
      `Not allowed to access this resource!`
    );

  const jobs = await JobOpeningModel.find({ company: companyId })
    .populate({
      path: 'company',
      select: 'name website',
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

const getJobApplications = async (req, res) => {
  const companyId = req.user.companyId;

  const jobsWithApplications = await JobOpeningModel.aggregate(
    jobApplicationsAgg({ companyId })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found Applications',
    jobsWithApplications,
  });
};

const jobApplicationAction = async (req, res) => {
  const applicationId = req?.params?.id;
  const action = req?.query?.action;
  const userId = req?.user?.userId;

  const application = await JobApplicationModel.findById(applicationId);
  if (!application)
    throw new CustomAPIError.BadRequestError('Invalid application id!');

  const { applicantId, jobId, companyId, status: currentStatus } = application;

  const {
    isValid,
    updatedStatus,
    currentJobArr,
    updatedJobArr,
    currentApplicantArr,
    updatedApplicantArr,
  } = isActionValid(action, currentStatus);

  if (!isValid) throw new CustomAPIError.BadRequestError('Invalid action!');

  const job = await JobOpeningModel.findById(jobId);

  if (job.status !== 'open')
    throw new CustomAPIError.BadRequestError('Job is already closed!');

  const company = await CompanyModel.findById(companyId);
  if (!company.admins.includes(userId))
    throw new CustomAPIError.BadRequestError(
      'Not authorized to perform this action'
    );

  application.status = updatedStatus;

  job[currentJobArr] = job[currentJobArr].filter(
    (id) => id.toString() !== applicantId.toString()
  );
  job[updatedJobArr].push(applicantId);

  const applicant = await UserModel.findById(applicantId);
  applicant[currentApplicantArr] = applicant[currentApplicantArr].filter(
    (id) => id.toString() !== jobId.toString()
  );
  applicant[updatedApplicantArr].push(jobId);

  await application.save();
  await job.save();
  await applicant.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Candidate is ${updatedStatus}`,
  });
};

function isActionValid(action, currentStatus) {
  const obj = {
    isValid: false,
    updatedStatus: '',
    currentJobArr: '',
    updatedJobArr: '',
    currentApplicantArr: '',
    updatedApplicantArr: '',
  };

  switch (action) {
    case 'shortlist':
      obj.isValid = currentStatus === 'pending';
      obj.updatedStatus = 'shortlisted';
      obj.updatedJobArr = 'shortlistedCandidates';
      obj.updatedApplicantArr = 'jobsShortlisted';
      break;
    case 'hire':
      obj.isValid =
        currentStatus === 'pending' || currentStatus === 'shortlisted';
      obj.updatedStatus = 'hired';
      obj.updatedJobArr = 'selectedCandidates';
      obj.updatedApplicantArr = 'jobsSelected';
      break;
    case 'reject':
      obj.isValid =
        currentStatus === 'pending' || currentStatus === 'shortlisted';
      obj.updatedStatus = 'rejected';
      obj.updatedJobArr = 'rejectedCandidates';
      obj.updatedApplicantArr = 'jobsRejected';
      break;
  }

  switch (currentStatus) {
    case 'pending':
      obj.currentJobArr = 'applicants';
      obj.currentApplicantArr = 'jobsApplied';
      break;
    case 'shortlist':
      obj.currentJobArr = 'shortlistedCandidates';
      obj.currentApplicantArr = 'jobsShortlisted';
      break;
  }

  return obj;
}

module.exports = {
  getCompanies,
  createJobOpening,
  getJobsForIncharge,
  getJobApplications,
  jobApplicationAction,
};
