module.exports = function (req, res, next) { 
    // 401 Unauthorized
    // 403 Forbidden 
    
    if (req.user.position!="Admin" && req.user._id!=req.body.id) 
      return res.status(403).send('Access denied.');
    next();
  }