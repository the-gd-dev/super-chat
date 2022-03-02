/**
 * Render Index Page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getIndex = (req, res, next) => {
  res.render("home/index");
};
