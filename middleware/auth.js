const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  var token;
  if (req.cookies!=null)
    token = req.cookies.auth;
  if (!token)  
  {
    res.redirect(`/authPage`);
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded; 
    next();
  }
  catch (ex) {
    res.redirect(`/authPage`);
    return res.status(400).send('Invalid token.');
  }
}