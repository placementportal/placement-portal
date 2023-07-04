const router = require("express").Router();

const {
  getPersonalData,
  updateEducationData,
  getEducationData,
  getExperiences,
  createExperience,
  updateExperience,
  createPlacement,
  getPlacements,
} = require("../controllers/studentDetailsController");

router.get("/personal", getPersonalData);

router.patch("/education", updateEducationData);
router.get("/education", getEducationData);

router.get("/experience", getExperiences);
router.post("/experience", createExperience);
router.patch("/experience/:id", updateExperience);

router.post("/placement", createPlacement);
router.get("/placement", getPlacements);

module.exports = router;
