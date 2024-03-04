const router = require('express').Router();

const {
  getStudents,
  addCompany,
  addCompanyAdmin,
  addSingleStudent,
  updateSingleStudent,
  getCompanies,
  getSingleCompany,
  updateCompany,
} = require('../controllers/adminController');

router.get('/students', getStudents);
router.post('/students/single', addSingleStudent);
router.patch('/students/single/:id', updateSingleStudent);

router.post('/companies', addCompany);
router.get('/companies', getCompanies);
router.post('/companies/:companyId/admins', addCompanyAdmin);
router.get('/companies/:companyId', getSingleCompany);
router.patch('/companies/:companyId', updateCompany);

module.exports = router;
