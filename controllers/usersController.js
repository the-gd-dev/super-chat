const User = require("../models/User");

/**
 * Render Index Page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getUsers = (req, res, next) => {
  let queryName = req.query.name;
  User.find({ name: { $regex: queryName }, _id: { $ne: req.session.user._id } })
    .select("display_picture name email")
    .then((users) => {
      res.status(200).json({ users: users });
    })
    .catch((err) => console.log(err));
};
