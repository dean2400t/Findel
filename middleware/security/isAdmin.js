module.exports = function (req, res, next) { 
    // 401 Unauthorized
    // 403 Forbidden 
    
    if (!req.user.position=="Admin") 
      return res.status(403).send('Access denied.');
    next();
  }