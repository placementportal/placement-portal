const JobOpeningModel = require('../models/JobOpenings');
const CompanyModel = require('../models/Company');
const JobApplicationModel = require('../models/JobApplication');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const { validateJobReceivers } = require('../utils');

const {
  jobApplicationsAgg,
  companyInchargeJobsAgg,
} = require('../models/aggregations');
const UserModel = require('../models/User');

const { fileUpload } = require('../utils');
const { PlacementModel } = require('../models/student');

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
    receivingBatch,
    receivingDepartments,
    keySkills,
    openingsCount,
    deadline,
  } = req.body;

  const { userId, companyId } = req.user;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);
  const companyAdmin = await UserModel.findById(userId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (companyAdmin.companyId != companyId)
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to access this resource'
    );

  const { course, batch, departments } = await validateJobReceivers({
    receivingCourse,
    receivingBatch,
    receivingDepartments,
  });

  const jobOpening = await JobOpeningModel.create({
    profile,
    description,
    location,
    company: {
      id: company._id,
      name: company.name,
      website: company.website,
    },
    jobPackage,
    receivingCourse: { id: course._id, courseName: course.courseName },
    receivingBatch: batch,
    receivingDepartments: departments,
    keySkills,
    postedBy: {
      id: companyAdmin._id,
      name: companyAdmin.name,
    },
    openingsCount,
    deadline,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created Job Opening',
    id: jobOpening._id,
  });

  course.lastJobOpening = jobOpening.createdAt;

  course.batches
    .get(receivingBatch)
    .set('lastJobOpening', jobOpening.createdAt);

  for (let receivingDepartment of receivingDepartments) {
    course.departments
      .get(receivingDepartment)
      .set('lastJobOpening', jobOpening.createdAt);
  }
  await course.save();
};

const getJobsForIncharge = async (req, res) => {
  const { companyId, userId } = req.user;
  const status = req?.query?.status || 'open';

  const validStatus = ['open', 'expired'];
  if (!validStatus.includes(status)) {
    throw new CustomAPIError.BadRequestError('Invalid status');
  }

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

  const jobs = await JobOpeningModel.aggregate(
    companyInchargeJobsAgg({ companyId, status })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found job openings!',
    jobs,
  });
};

const updateJobOpening = async (req, res) => {
  const jobId = req?.params?.jobId;
  const { userId, companyId } = req.user;

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);
  const companyAdmin = await UserModel.findById(userId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (companyAdmin.companyId != companyId)
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to access this resource'
    );

  const {
    profile,
    description,
    location,
    jobPackage,
    receivingCourse,
    receivingBatch,
    receivingDepartments,
    keySkills,
    openingsCount,
    deadline,
  } = req.body;

  const { course, batch, departments } = await validateJobReceivers({
    receivingCourse,
    receivingBatch,
    receivingDepartments,
  });

  const jobOpening = await JobOpeningModel.findOneAndUpdate(
    { _id: jobId, applications: { $size: 0 } },
    {
      profile,
      description,
      location,
      company: {
        id: company._id,
        name: company.name,
        website: company.website,
      },
      jobPackage,
      receivingCourse: { id: course._id, courseName: course.courseName },
      receivingBatch: batch,
      receivingDepartments: departments,
      keySkills,
      postedBy: {
        id: companyAdmin._id,
        name: companyAdmin.name,
      },
      openingsCount,
      deadline,
    },
    { runValidators: true }
  );

  if (!jobOpening) {
    throw new CustomAPIError.NotFoundError(`Invalid job id: ${jobId}!`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated Job Opening',
    id: jobOpening._id,
  });
};

const deleteJobOpening = async (req, res) => {
  const jobId = req?.params?.jobId;
  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  const job = await JobOpeningModel.findOneAndDelete({
    _id: jobId,
    applications: { $size: 0 },
  });

  if (!job) throw new CustomAPIError.NotFoundError(`Invalid job id: ${jobId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job Deleted successfully!',
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
  const { id: applicationId, action } = req?.params;
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

const createOnCampusPlacement = async (req, res) => {
  const applicationId = req?.params?.id;

  const application = await JobApplicationModel.findById(applicationId);

  if (!application)
    throw new CustomAPIError.NotFoundError(
      `No application found with id: ${applicationId}`
    );

  const { jobId, status: applicationStatus, applicantId } = application;
  if (applicationStatus === 'hired' || applicationStatus === 'rejected')
    throw new CustomAPIError.BadRequestError(
      `Application is already ${applicationStatus}`
    );

  const job = await JobOpeningModel.findById(jobId);
  const {
    profile,
    location,
    company,
    jobPackage,
    status: jobStatus,
    deadline,
  } = job;

  if (jobStatus !== 'open' || new Date() > deadline)
    throw new CustomAPIError.BadRequestError(`Job is closed`);

  let { offerLetter, joiningLetter } = req?.files;
  const joiningDate = req?.body?.joiningDate;

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
    jobProfile: profile,
    location,
    company: company.name,
    package: jobPackage,
    isOnCampus: true,
    offerLetter,
    joiningDate,
    joiningLetter,
    studentId: applicantId,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'On-campus placement created!',
    id: placement._id,
  });

  application.status = 'hired';
  await application.save();

  const pastCandidatesArr =
    applicationStatus === 'pending' ? 'applicants' : 'selectedCandidates';

  job[pastCandidatesArr] = job[pastCandidatesArr].filter(
    (id) => id.toString() !== applicantId.toString()
  );
  job.selectedCandidates.push(applicantId);
  await job.save();

  const user = await UserModel.findById(applicantId);
  const pastJobsArr =
    application === 'pending' ? 'jobsApplied' : 'jobsShortlisted';
  user[pastJobsArr] = user[pastJobsArr].filter(
    (id) => id.toString() !== jobId.toString()
  );
  user.jobsSelected.push(jobId);
  user.placements.push(placement._id);
  await user.save();
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
  updateJobOpening,
  deleteJobOpening,
  getJobsForIncharge,
  getJobApplications,
  jobApplicationAction,
  createOnCampusPlacement,
};
