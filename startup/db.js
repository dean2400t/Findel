const winston=require("winston");
const mongoose=require("mongoose");

//"mongodb://dean2400t:Dm135135@ds147946.mlab.com:47946/heroku_b3ckh1g4"
//'mongodb://localhost/findel'
module.exports= function()
{
    mongoose.connect('mongodb://dean2400t:Dm135135@ds147946.mlab.com:47946/heroku_b3ckh1g4')
    .then (()=> console.log("connected to mongodb"))
    
}
