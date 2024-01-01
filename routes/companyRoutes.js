const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getCompanies,
  createJobOpening,
  getJobsForIncharge,
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.post('/:id/job', authorizeRoles('company_admin'), createJobOpening);
router.get('/:id/jobs', authorizeRoles('company_admin'), getJobsForIncharge);

module.exports = router;
