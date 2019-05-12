var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

router.get('/findelTheme', function(req, res, next) {
    var appDir = path.dirname(require.main.filename);
    fs.readFile(appDir + '/public/Findel theme.png', function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such image");    
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200,{'Content-type':'image/jpg'});
            res.end(content);
        }
    });
});
module.exports = router;