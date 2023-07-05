const router = require("express").Router();
const { authorizeRoles } = require("../middleware/authentication-middleware")

const {
  createNotice,
  getAllNotices,
  getMyNotices,
} = require("../controllers/noticeController");

router.post("/", authorizeRoles("admin"), createNotice);
router.get("/", authorizeRoles("admin"), getAllNotices);

router.get("/student", authorizeRoles("student"), getMyNotices);

module.exports = router;
