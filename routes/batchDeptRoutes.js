const router = require("express").Router();

const {
  createCourse,
  getAllCourses,
  createBatch,
  getBatches,
  createDepartment,
  getDepartments,
} = require("../controllers/batchDeptController");

router.post("/course", createCourse);
router.get("/course", getAllCourses);

router.post("/batch", createBatch);
router.get("/batch", getBatches);

router.post("/dept", createDepartment);
router.get("/dept", getDepartments);

module.exports = router;
