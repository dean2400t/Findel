const config= require('config');

module.exports=function()
{
    if (!config.get('jwtPrivateKey')){
         console.log('Fatal Error: jwtPrivateKey is not defined.');
    }
    if (!config.get('db_connection')){
        console.log('Fatal Error: db_connection is not defined.');
   }
}