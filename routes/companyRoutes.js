const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getCompanies,
  createJobOpening,
  getJobsForIncharge,
  getJobApplications,
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.post('/jobs', authorizeRoles('company_admin'), createJobOpening);
router.get('/jobs', authorizeRoles('company_admin'), getJobsForIncharge);
router.get(
  '/applications',
  authorizeRoles('company_admin'),
  getJobApplications
);

module.exports = router;
