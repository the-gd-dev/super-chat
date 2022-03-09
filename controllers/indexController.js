const User = require("../models/User");

/**
 * Render Index Page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getIndex = (req, res, next) => {
  User.find({ _id: { $ne: req.session.user._id } })
    .then((users) => {
      res.render("home/index", {
        users: users,
      });
    })
    .catch((err) => console.log(err));
};
