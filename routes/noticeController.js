const router = require("express").Router();

const { createNotice } = require("../controllers/noticeController");

router.post("/", createNotice);

module.exports = router;
