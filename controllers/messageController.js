const express = require("express");
const { validationResult } = require("express-validator");
const extractErrors = require("../helpers/extractErrors");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const app = express();
/**
 * sending message to another user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.sendMessage = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return res.status(500).json({ errors: extractErrorsArr });
  }
  let sender = req.session.user._id.toString();
  let reciever = req.body.sender_id;
  let conversationObj = { sender: sender, reciever: reciever };
  Conversation.findOne({ members: { $all: [sender, reciever] } })
    .then((result) => {
      if (result) {
        return result;
      } else {
        return Conversation.create({ members: [sender, reciever] });
      }
    })
    .then((convo) => {
      return Message.create({
        message: req.body.message,
        conversationId: convo._id,
        senderId: conversationObj.sender,
      });
    })
    .then((msg) => {
      return Message.findById(msg._id)
        .populate({ path: "senderId", select: "display_picture" })
        .exec();
    })
    .then((message) => {
      res.status(200).json({
        message: message,
        msg: "Message has been sent!!",
        status: 200,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * fetch all messages
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getMessages = (req, res, next) => {
  let reciever = req.query.user;
  let sender = req.session.user._id.toString();
  Conversation.findOne({ members: { $all: [sender, reciever] } })
    .then((convo) => {
      if (convo) {
        return Message.find({ conversationId: convo._id })
          .populate({ path: "senderId", select: "display_picture" })
          .exec();
      } else {
        return [];
      }
    })
    .then((messages) => {
      res.status(200).json({ msg: "messages fetched.", messages: messages });
    })
    .catch((err) => {
      console.log(err);
    });
};
