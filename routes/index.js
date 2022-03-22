const express = require("express");
const { getIndex } = require("../controllers/indexController");
const {
  getMessages,
  sendMessage,
  readMessages,
} = require("../controllers/messageController");
const messageRules = require("../validations/message");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getConversations,
  postConversations,
} = require("../controllers/conversationController");
const { getUsers } = require("../controllers/usersController");
const router = express.Router();

router.get("/", authMiddleware, getIndex);
router.get("/users", authMiddleware, getUsers);
router.get("/messages", authMiddleware, getMessages);
router.post("/messages/send", authMiddleware, messageRules, sendMessage);
router.post("/messages/read", authMiddleware, messageRules, readMessages);
router.get("/conversations", authMiddleware, getConversations);
router.post("/conversations", authMiddleware, postConversations);

module.exports = router;
