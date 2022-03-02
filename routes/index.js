const express = require("express");
const { getIndex } = require("../controllers/indexController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/", authMiddleware, getIndex);
module.exports = router;
