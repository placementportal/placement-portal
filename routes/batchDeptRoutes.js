const router = require("express").Router();

const {
  createBatch,
  createDepartment,
  getAllBatches,
  getDepartments,
} = require("../controllers/batchDeptController");

router.get("/batch", getAllBatches);
router.post("/batch", createBatch);

router.get("/dept/:batchId", getDepartments);
router.post("/dept", createDepartment);

module.exports = router;
