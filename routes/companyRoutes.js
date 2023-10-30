const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getCompanies,
  createJobOpening,
  getJobsForStudent,
  getJobsForIncharge,
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.post('/:id/job', authorizeRoles('company_admin'), createJobOpening);
router.get('/:id/job', authorizeRoles('company_admin'), getJobsForIncharge);
router.get('/jobs', authorizeRoles('student'), getJobsForStudent);

module.exports = router;
