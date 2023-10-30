const router = require('express').Router();

const {
  getStudents,
  addCompany,
  addCompanyAdmin,
} = require('../controllers/adminController');

router.get('/students', getStudents);
router.post('/company', addCompany);
router.post('/company/admin', addCompanyAdmin);

module.exports = router;
