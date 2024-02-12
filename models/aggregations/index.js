const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  companyInchargeJobsAgg,
} = require('./studentJob');

const { jobApplicationsAgg } = require('./jobApplications');
const { studentProfileDetailsAgg } = require('./studentDetails');

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  companyInchargeJobsAgg,
  jobApplicationsAgg,
  studentProfileDetailsAgg,
};
