const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getCompanies,
  createJobOpening,
  getJobsForIncharge,
  getJobApplications,
  jobApplicationAction,
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.post('/jobs', authorizeRoles('company_admin'), createJobOpening);
router.get('/jobs', authorizeRoles('company_admin'), getJobsForIncharge);
router.get(
  '/applications',
  authorizeRoles('company_admin'),
  getJobApplications
);
router.patch(
  '/applications/:id?',
  authorizeRoles('company_admin'),
  jobApplicationAction
);

module.exports = router;
