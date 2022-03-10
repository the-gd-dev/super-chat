const Conversation = require("../models/Conversation");
exports.postConversations = (req, res, next) => {
  var senderId = req.body.sender;
  var receiverId = req.body.receiver;
  Conversation.find({ members: { $all: [senderId, receiverId] } })
    .then((result) => {
      if (result.length > 0) {
        return result;
      } else {
        return Conversation.create({ members: [senderId, receiverId] });
      }
    })
    .then((convos) => {
      res.status(200).json({ message: "conversation created", data: convos });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getConversations = (req, res, next) => {
  var currentLoggedInUserId = req.session.user._id;
  Conversation.find({ members: { $in: [currentLoggedInUserId] } })
    .populate({ path: "members", select: ["name", "display_picture"] })
    .exec()
    .then((convos) => {
      let finalConvos = [];
      convos.map((con) => {
        let member1 = con.members[0];
        let member2 = con.members[1];
        if (member1._id.toString() !== currentLoggedInUserId.toString()) {
          finalConvos.push({
            conversation_id: con._id,
            user: member1,
          });
        } else {
          finalConvos.push({
            conversation_id: con._id,
            user: member2,
          });
        }
      });
      res.status(200).json({ conversations: finalConvos });
    })
    .catch((err) => {
      console.log(err);
    });
};
