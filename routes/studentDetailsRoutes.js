const router = require("express").Router();

const {
  updateEducationData,
  getEducationData
} = require("../controllers/studentDetailsController");

router.patch("/education", updateEducationData);
router.get("/education", getEducationData);

module.exports = router;
