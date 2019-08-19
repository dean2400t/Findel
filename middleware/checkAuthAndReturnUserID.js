const jwt = require('jsonwebtoken');
const config = require('config');
module.exports=function checkAuthAndReturnUserID(token)
{
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    return decoded._id;
  }
  catch (ex) {
    return null;
  }
}