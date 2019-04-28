const winston=require("winston");
const mongoose=require("mongoose");
const config = require('config');

module.exports= function()
{
    var db_connection=config.get('db_connection');
    if (!db_connection)
        var db_connection="mongodb://localhost/findel";
    mongoose.connect(db_connection)
    .then (()=> console.log("connected to mongodb"))
    
}
