/**
 * Main application routes
 */
'use strict';

var path = require('path');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var exec = require('child_process').exec;
var fs = require('fs');

var io = require('socket.io')(9090);

module.exports = function(app){
    app.post('/api/newVideoJob', upload.single('video'), newVideoJob);
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

io.on('connection', function(socket){
    var timeHander;
    socket.emit('notice', { msg: 'ok', code: 1 });
    socket.on('startVideoJob', function(data){
        delete data.W;
        delete data.H;
        data.compressedRate = data.compressedRate ? data.compressedRate : 15;
        data.overlap = data.overlap ? data.overlap : 1;
        var outputVideoName = ['out', (new Date()).getTime()].join('_') + '.avi';

        var cmd = 'docker run  -i --rm --volumes-from inputdb --volumes-from outputdb --name ' + data.containerName + ' gyyzyp/videosynopsis';
        cmd = [cmd, data.compressedRate, data.overlap, data.x1, data.y1 , data.x2, data.y2, data.x3, data.y3, data.x4, data.y4, outputVideoName].join(' ');
        socket.emit('notice', { msg: 'JobStart', code: 2});
        var option={
            maxBuffer: 40000*1024
        }
        exec(cmd, option, function(error, stdout, stderr){
            if(error){
                console.log("exec error: " + error);
                socket.emit('notice', { msg: 'error', code: 0, err_message: error.msg});
            }else{
                socket.emit('notice', { msg: 'ok', code: 5, outputVideoName: outputVideoName.replace(/\.avi/,'.mp4') }); //完成

            }
        });

    })
})
