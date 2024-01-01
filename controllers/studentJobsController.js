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

  const student_id = req.user.userId;
  const student = await UserModel.findById(student_id);

  const { batchId, departmentId, courseId } = student;

  let jobs;
  if (status === 'open') {
    jobs = await JobOpeningModel.aggregate(
      studentJobOpeningsAgg({
        batchId,
        courseId,
        departmentId,
        student_id: student._id,
      })
    );
  } else {
    jobs = await UserModel.aggregate(
      studentJobsByStatusAgg({ userId: req.user.userId, status })
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Jobs found!',
    jobs,
  });

  student.lastJobFetched = new Date();
  await student.save();
};

const createJobApplication = async (req, res) => {
  const { portfolio, coverLetter } = req?.body;
  const resumeFile = req?.files?.resumeFile;
  const jobId = req?.params?.id;
  const applicantId = req.user?.userId;

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  if (!portfolio?.trim() || !coverLetter?.trim() || !resumeFile)
    throw new CustomAPIError.BadRequestError(
      'Portfolio, Cover letter & Resume are required!'
    );

  /* VALIDATE JOB & APPLICANT */

  const job = await JobOpeningModel.findOne({ _id: jobId, status: 'open' });
  if (!job) throw new CustomAPIError.BadRequestError('Invalid job id!');

  if (
    job.applicants.includes(applicantId) ||
    job.rejectedCandidates.includes(applicantId) ||
    job.shortlistedCandidates.includes(applicantId) ||
    job.selectedCandidates.includes(applicantId)
  )
    throw new CustomAPIError.BadRequestError(
      'You have already applied for this job!'
    );

  const applicant = await UserModel.findById(applicantId);
  if (
    String(job.receivingCourse) != String(applicant.courseId) ||
    !job.receivingBatches.includes(applicant.batchId) ||
    !job.receivingDepartments.includes(applicant.departmentId)
  )
    throw new CustomAPIError.BadRequestError("You can't apply for this job!");

  /* END VALIDATION */

  const fileUploadResp = await fileUpload(resumeFile, 'resumes', 'document');
  const resume = fileUploadResp?.fileURL;

  const jobApplication = await JobApplicationModel.create({
    jobId,
    applicantId,
    coverLetter,
    portfolio,
    resume,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Job Application Created!',
    id: jobApplication._id,
  });

  job.applicants.push(applicantId);
  job.applications.push(jobApplication._id);
  await job.save();

  applicant.jobsApplied.push(jobId);
  applicant.jobApplications.push(jobApplication._id);
  await applicant.save();
};

module.exports = {
  getJobsForStudent,
  createJobApplication,
};
