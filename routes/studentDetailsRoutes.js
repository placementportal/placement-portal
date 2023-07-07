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
  deleteAward,
  deletePlacement,
  deleteExperience,
  deleteTraining
} = require("../controllers/studentDetailsController");

router.get("/personal", getPersonalData);

router.patch("/education", updateEducationData);
router.get("/education", getEducationData);

router.get("/experience", getExperiences);
router.post("/experience", createExperience);
router.patch("/experience/:id", updateExperience);
router.delete("/experience/:id", deleteExperience);

router.post("/placement", createPlacement);
router.get("/placement", getPlacements);
router.delete("/placement/:id", deletePlacement);

router.post("/training", createTraining);
router.get("/training", getTrainings);
router.delete("/training/:id", deleteTraining);

router.post("/award", createAward);
router.get("/award", getAwards);
router.delete("/award/:id", deleteAward);

module.exports = router;
