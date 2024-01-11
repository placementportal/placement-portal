const router = require('express').Router();

const {
  getEducationData,
  updateEducationData,

  getPersonalData,
  updatePersonalData,
  getStudentProfile,

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
} = require('../controllers/studentDetailsController');

const {
  getJobsForStudent,
  createJobApplication,
} = require('../controllers/studentJobsController');

router.get('/profile', getStudentProfile);

router.get('/personal', getPersonalData);
router.post('/personal', updatePersonalData);

router.post('/education/:update', updateEducationData);
router.get('/education', getEducationData);

router.get('/experience/:id', getExperienceById);
router.get('/experience', getExperiences);
router.post('/experience', createExperience);
router.patch('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

router.get('/placement/:id', getPlacementById);
router.post('/placement', createPlacement);
router.get('/placement', getPlacements);
router.patch('/placement/:id', updatePlacement);
router.delete('/placement/:id', deletePlacement);

router.get('/training/:id', getTrainingById);
router.post('/training', createTraining);
router.get('/training', getTrainings);
router.patch('/training/:id', updateTraining);
router.delete('/training/:id', deleteTraining);

router.get('/jobs?', getJobsForStudent);
router.post('/jobs/:id/apply', createJobApplication);

module.exports = router;
