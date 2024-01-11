const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
} = require('./studentJob');

const { jobApplicationsAgg } = require('./jobApplications');
const { studentProfileDetailsAgg } = require('./studentDetails');

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  jobApplicationsAgg,
  studentProfileDetailsAgg,
};
