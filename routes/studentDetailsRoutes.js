const router = require("express").Router();

const {
  getEducationData,
  updateEducationData,

  getPersonalData,

  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,

  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,

  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,

  createAward,
  getAwards,
  getAwardById,
  updateAward,
  deleteAward,
} = require("../controllers/studentDetailsController");

router.get("/personal", getPersonalData);

router.patch("/education", updateEducationData);
router.get("/education", getEducationData);

router.get("/experience/:id", getExperienceById);
router.get("/experience", getExperiences);
router.post("/experience", createExperience);
router.patch("/experience/:id", updateExperience);
router.delete("/experience/:id", deleteExperience);

router.get("/placement/:id", getPlacementById);
router.post("/placement", createPlacement);
router.get("/placement", getPlacements);
router.patch("/placement/:id", updatePlacement);
router.delete("/placement/:id", deletePlacement);

router.get("/training/:id", getTrainingById);
router.post("/training", createTraining);
router.get("/training", getTrainings);
router.patch("/training/:id", updateTraining);
router.delete("/training/:id", deleteTraining);

router.get("/award/:id", getAwardById);
router.post("/award", createAward);
router.get("/award", getAwards);
router.patch("/award/:id", updateAward);
router.delete("/award/:id", deleteAward);

module.exports = router;
