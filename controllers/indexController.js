/**
 * showing index page
 * @response /
 */
exports.getIndex = (req, res, next) => {
  res.render("index");
};
