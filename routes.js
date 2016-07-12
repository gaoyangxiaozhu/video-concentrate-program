/**
 * Main application routes
 */
'use strict';

var path = require('path');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var exec = require('child_process').exec;
var fs = require('fs');

module.exports = function(app){
    app.post('/api/newVideoJob', upload.single('video'), newVideoJob);
    app.post('/api/startVideoJob', upload.any(), startVideoJob);
}

function newVideoJob(req, res){
    var videoFilePath = req.file.path;
    var cmd = 'ffmpeg -i ' + videoFilePath + ' -y -ss 0 -vframes 1 public/images/temp.jpg';

    exec(cmd, function(error, stdout, stderr){
        if(error){
            console.log("exec error: " + error);
            res.send({err_message : '提取第一帧出错..'})
        }else{
            var count = 0;
            var timeHandler = setInterval(function(){
                if(fs.existsSync('public/images/temp.jpg')){
                    clearInterval(timeHandler);
                    res.send({ msg: 'ok'});
                }else{
                    if(count > 10){
                        count = 0;
                        clearInterval(timeHandler);
                        res.send({ err_message: '提取第一帧出错....'});
                        return;
                    }
                    count++;
                }
            }, 1000);
        }
    });
}

function startVideoJob(req, res){
    console.log(req.body);
    res.send({data: 'ok'});
}
