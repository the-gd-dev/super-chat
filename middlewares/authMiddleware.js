/**
 * Check if user logged in
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
    if(!req.session.user) return res.redirect('/login')
    next();
};
