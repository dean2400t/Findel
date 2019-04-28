const winston=require("winston");
const mongoose=require("mongoose");
const config = require('config');

//"mongodb://dean2400t:Dm135135@ds147946.mlab.com:47946/heroku_b3ckh1g4"
//'mongodb://localhost/findel'
module.exports= function()
{
    const db_connection=config.get('db_connection');
    mongoose.connect(db_connection)
    .then (()=> console.log("connected to mongodb"))
    
}
