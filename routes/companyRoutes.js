const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getCompanies,
  createJobOpening,
  getJobsForIncharge,
  getJobApplications,
  jobApplicationAction,
  updateJobOpening,
  deleteJobOpening,
  createOnCampusPlacement,
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.post('/jobs', authorizeRoles('company_admin'), createJobOpening);
router.patch('/jobs/:jobId', authorizeRoles('company_admin'), updateJobOpening);
router.delete(
  '/jobs/:jobId',
  authorizeRoles('company_admin'),
  deleteJobOpening
);
router.get('/jobs', authorizeRoles('company_admin'), getJobsForIncharge);

router.get(
  '/applications',
  authorizeRoles('company_admin'),
  getJobApplications
);

router.patch(
  '/applications/:id/action/:action',
  authorizeRoles('company_admin'),
  jobApplicationAction
);

router.post(
  '/applications/:id/placement',
  authorizeRoles('company_admin'),
  createOnCampusPlacement
);

module.exports = router;
