const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  companyInchargeJobsAgg,
  singleJobCompanyAgg,
  singleJobStudentAgg,
} = require('./studentJob');

const {
  jobApplicationsAgg,
  singleJobApplicationsAgg,
  studentJobApplicationsAgg,
} = require('./jobApplications');
const { studentProfileDetailsAgg } = require('./studentDetails');

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  companyInchargeJobsAgg,
  jobApplicationsAgg,
  studentProfileDetailsAgg,
  singleJobCompanyAgg,
  singleJobStudentAgg,
  singleJobApplicationsAgg,
  studentJobApplicationsAgg,
};
