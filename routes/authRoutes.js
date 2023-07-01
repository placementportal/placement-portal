const router = require("express").Router();

const { login, logout } = require("../controllers/authController");

router.post("/login/:role", login);
router.get("/logout", logout);

module.exports = router;
