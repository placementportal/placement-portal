const JobOpeningModel = require('../models/JobOpenings');
const UserModel = require('../models/User');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const { fileUpload } = require('../utils/fileUpload');

const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
} = require('../models/aggregations/');
const JobApplicationModel = require('../models/JobApplication');

const getJobsForStudent = async (req, res) => {
  const status = req?.query?.status?.toLowerCase() || 'open';
  const validStatus = ['open', 'applied', 'shortlisted', 'rejected', 'hired'];

  if (!status?.trim() || !validStatus.includes(status)) {
    throw new CustomAPIError.BadRequestError('Invalid job status');
  }

  const { batchId, departmentId, courseId, userId } = req.user;

  let jobs;
  if (status === 'open') {
    jobs = await JobOpeningModel.aggregate(
      studentJobOpeningsAgg({
        batchId,
        courseId,
        departmentId,
        userId,
      })
    );
  } else {
    jobs = await UserModel.aggregate(
      studentJobsByStatusAgg({ userId, status })
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Jobs found!',
    jobs,
  });

  const student = await UserModel.findById(userId);
  student.lastJobFetched = new Date();
  await student.save();
};

const createJobApplication = async (req, res) => {
  const { portfolio, coverLetter } = req?.body;
  const resumeFile = req?.files?.resumeFile;
  const jobId = req?.params?.id;
  const {
    userId: applicantId,
    name: applicantName,
    courseId,
    departmentId,
    batchId,
  } = req.user;

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  if (!portfolio?.trim() || !coverLetter?.trim() || !resumeFile)
    throw new CustomAPIError.BadRequestError(
      'Portfolio, Cover letter & Resume are required!'
    );

  /* VALIDATE JOB & APPLICANT */

  const job = await JobOpeningModel.findById(jobId);
  if (!job) throw new CustomAPIError.BadRequestError('Invalid job id!');

  if (job.status !== 'open')
    throw new CustomAPIError.BadRequestError("This job isn't open anymore!");

  if (
    job.applicants.includes(applicantId) ||
    job.rejectedCandidates.includes(applicantId) ||
    job.shortlistedCandidates.includes(applicantId) ||
    job.selectedCandidates.includes(applicantId)
  )
    throw new CustomAPIError.BadRequestError(
      'You have already applied for this job!'
    );

  const validDeptIds = job.receivingDepartments.map((dept) =>
    dept.id.toString()
  );

  if (
    job.receivingCourse.id.toString() !== courseId ||
    job.receivingBatch.id.toString() !== batchId ||
    !validDeptIds.includes(departmentId)
  )
    throw new CustomAPIError.BadRequestError("You can't apply for this job!");

  /* END VALIDATION */

  const fileUploadResp = await fileUpload(resumeFile, 'resumes', 'document');
  const resume = fileUploadResp?.fileURL;

  const jobApplication = await JobApplicationModel.create({
    jobId,
    applicantId,
    applicantName,
    coverLetter,
    portfolio,
    resume,
    companyId: job.company.id,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Job Application Created!',
    id: jobApplication._id,
  });

  job.applicants.push(applicantId);
  job.applications.push(jobApplication._id);
  await job.save();

  const applicant = await UserModel.findById(applicantId);
  applicant.jobsApplied.push(jobId);
  applicant.jobApplications.push(jobApplication._id);
  await applicant.save();
};

module.exports = {
  getJobsForStudent,
  createJobApplication,
};
