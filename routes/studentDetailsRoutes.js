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
  createTraining,
  getTrainings,
  createAward,
  getAwards,
} = require("../controllers/studentDetailsController");

router.get("/personal", getPersonalData);

router.patch("/education", updateEducationData);
router.get("/education", getEducationData);

router.get("/experience", getExperiences);
router.post("/experience", createExperience);
router.patch("/experience/:id", updateExperience);

router.post("/placement", createPlacement);
router.get("/placement", getPlacements);

router.post("/training", createTraining);
router.get("/training", getTrainings);

router.post("/award", createAward);
router.get("/award", getAwards);

module.exports = router;
