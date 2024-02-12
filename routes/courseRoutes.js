const router = require('express').Router();

const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  createCourse,
  getAllCourses,
  createBatch,
  getBatches,
  createDepartment,
  getDepartments,
  getCourseOptions,
} = require('../controllers/courseController');

router.post('/', authorizeRoles('admin'), createCourse);
router.get('/', authorizeRoles('admin'), getAllCourses);
router.get(
  '/options',
  authorizeRoles('admin', 'company_admin'),
  getCourseOptions
);

router.post('/:courseId/batches', authorizeRoles('admin'), createBatch);
router.get('/:courseId/batches', authorizeRoles('admin'), getBatches);

router.post(
  '/:courseId/departments',
  authorizeRoles('admin'),
  createDepartment
);
router.get('/:courseId/departments', authorizeRoles('admin'), getDepartments);

module.exports = router;
