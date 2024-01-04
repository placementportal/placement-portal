const router = require('express').Router();

const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  createCourse,
  getAllCourses,
  createBatch,
  getBatches,
  createDepartment,
  getDepartments,
} = require('../controllers/batchDeptController');

router.post('/course', authorizeRoles('admin'), createCourse);
router.get('/course', authorizeRoles('admin', 'company_admin'), getAllCourses);

router.post('/batch', authorizeRoles('admin'), createBatch);
router.get('/batch', authorizeRoles('admin', 'company_admin'), getBatches);

router.post('/dept', authorizeRoles('admin'), createDepartment);
router.get('/dept', authorizeRoles('admin', 'company_admin'), getDepartments);

module.exports = router;
