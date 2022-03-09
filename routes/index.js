const express = require("express");
const { getIndex } = require("../controllers/indexController");
const {
  getMessages,
  sendMessage,
} = require("../controllers/messageController");
const messageRules = require("../validations/message");
const authMiddleware = require("../middlewares/authMiddleware");
const { getConversations } = require("../controllers/conversationController");
const router = express.Router();

router.get("/", authMiddleware, getIndex);
router.get("/messages", authMiddleware, getMessages);
router.post("/messages/send", authMiddleware, messageRules, sendMessage);
router.get("/conversations", authMiddleware, getConversations);
module.exports = router;
