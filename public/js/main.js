$(function(){
    //跨浏览器事件绑定接口
    var EventUtil = {
        addHandler: function(element, type, handler){
            if (element.addEventListener){
                element.addEventListener(type, handler, false);
            } else if(element.attachEvent){
                element.attachEvent("on" + type, handler);
            } else {
                element['on' + type] = handler;
            }
        },
        removeHandler: function(element, type, handler){
            if (element.removeEventListener){
                element.removeEventListener(type, handler, false);
            } else if(element.detachEvent){
                element.detachEvent("on" + type, handler);
            } else {
                element['on' + type] = null;
            }
        },
        getEvent: function(event){
            return event ? event : window.event; //在使用DOM0级的事件对象时，event是作为window对象的一个属性存在
        },
        getTarget: function(event){
            return event.target || event.srcElement;
        },
        preventDefault: function(event){
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue = false;
            }
        },
        stopPropagation: function(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble = true;
            }
        },
        removeClass: function(element, className){
            var classNames = element.className.split(/\s+/);

            //找到要删除的类名
            var pos = -1,
                i,
                len;
            for(i = 0, len = classNames.length; i < len ; i++){
                if(classNames[i] == className){
                    pos = i;
                    break;
                }
            }
            if(pos >= 0){
                classNames.splice(i, 1);
                element.className = classNames.join(" ");
            }

            return element;
        },
        addClass: function(element, className){
            var classNames = element.className.split(/\s+/);

            var pos = -1,
                i,
                len;
            for(i = 0, len = classNames.length; i< len; i++){
                if(classNames[i] == className){
                    pos = i;
                    break;
                }
            }
            if(pos == -1){
                classNames.push(className);
                element.className = classNames.join(" ");
            }
            return element; //支持链式调用
        }
    };


    //移除form submit默认行为
    var forms = document.forms; //HTMLCollection对象
    forms = Array.prototype.slice.call(forms, 0);

    forms.forEach(function(item, index){
        EventUtil.addHandler(item, 'submit', function(event){
            var _event = EventUtil.getEvent(event);
            EventUtil.preventDefault(_event);
        });
    });

    /*
     * @description 表单重置功能函数
     */
    function resetForms(){
        document.getElementsByClassName('progress-bar')[0].style = "width:0%";
        EventUtil.removeClass(document.body, 'show'); // 移除表单面板以及遮罩效果
        //重置表单
        forms[0].reset();
        forms[1].reset();
        EventUtil.removeClass(forms[0], 'hide');
        EventUtil.addClass(forms[1], 'hide');
    }

    //点击创建视频浓缩任务 显示创建面板
    var creatNewJob = document.getElementsByClassName('create-new-job')[0];

    EventUtil.addHandler(creatNewJob, 'click', function(event){
        var that = EventUtil.getTarget(event);
        EventUtil.addClass(document.body, 'show');
    });

    //点击面板阴影遮罩 重置表单状态 并隐藏面板
    EventUtil.addHandler(document.getElementsByClassName('create-new-video-form-container')[0], 'click', function(event){
        resetForms();
    });

    var selectVideoBtn = document.getElementsByClassName ? document.getElementsByClassName('select-video')[0] : document.querySelector('.selectVideo');
    var videoInput = document.getElementById('video');
    var videoSelect = document.getElementById('videoSelect');

    EventUtil.addHandler(videoInput, 'change', function(event){
        var that = this; //应该是EventUtil.getTarget(event);
        var filePath = that.value; //获取文件路径
        var fileType=filePath.substr(filePath.lastIndexOf("\.")).toLowerCase();
        var regx = /^\.(mp4|avi|mp5)$/;

        var noticeSpanForVideoFormat = forms[0].getElementsByClassName('err-notice')[1];
        if(fileType.match(regx)){
            EventUtil.addClass(noticeSpanForVideoFormat, 'hide');
            videoSelect.value = filePath;
        }else{
            EventUtil.removeClass(noticeSpanForVideoFormat, 'hide');
        }


    });
    //点击selectVideoBtn 触发 文件选择按钮
    EventUtil.addHandler(selectVideoBtn, 'click', function(event){
        var that =this;
        var _event = EventUtil.getEvent(event);
        EventUtil.stopPropagation(_event);
        EventUtil.preventDefault(_event);

        videoInput.click();//触发file input click事件  选取视频文件
    });


    //提交表单
    var videoFormSubmitBtn = document.getElementsByClassName('submit-form-btn')[0];
    EventUtil.addHandler(videoFormSubmitBtn, 'click', function(event){
        var that = this;

        var videoJobName = document.getElementById('videoJobName').value;
        var noticeSpanForVideoName = forms[0].getElementsByClassName('err-notice')[0];
        if(!videoJobName){
            EventUtil.removeClass(noticeSpanForVideoName, 'hide');
        }else{
            EventUtil.addClass(noticeSpanForVideoName, 'hide');
            forms[1].elements.videoJobName.value = [videoJobName, (new Date()).getTime()].join('_');

            var xhr = new XMLHttpRequest();
            var videoFormData = new FormData(forms[0]);
            var progressBar = document.getElementsByClassName('progress-bar')[0];
            xhr.open("POST", "/api/newVideoJob");

            EventUtil.addHandler(xhr.upload, 'progress', uploadProgress(progressBar));
            EventUtil.addHandler(xhr, 'load', uploadComplete(progressBar, function(event){

                function showSelectedCoords(c){
                    document.getElementById('x1').value = c.x;
                    document.getElementById('y1').value = c.y;
                    document.getElementById('w').value = c.w;
                    document.getElementById('h').value = c.h;
                }
                document.getElementById('imgForInterest').src="images/temp.jpg";
                var _currentJcrop;
                $('#imgForInterest').Jcrop({
                    onChange: showSelectedCoords,
                    onSelect: showSelectedCoords,
                    onRelease: showSelectedCoords
                }, function(){
                    _currentJcrop = this;
                });
                EventUtil.addClass(forms[0], 'hide');
                EventUtil.removeClass(forms[1], 'hide');
                progressBar.style.width = '0%';
            }));
            xhr.send(videoFormData);

        }

    });
    //进度条渲染
    function uploadProgress(progressBar){
        return function(event){
            if(event.lengthComputable){
                 var percentComplete = Math.round(event.loaded * 100 / event.total);
                 console.log(percentComplete);
                 progressBar.style.width = percentComplete + '%';
            }
        };
    }
    function uploadComplete(progressBar, cb){
        cb = cb || function(){};
        return function(event){
            var that = EventUtil.getTarget(event);
            if(progressBar){
                progressBar.style.width = "100%";
            }
            if(that.status >= 200 && that.status < 300 || that.status == 304){
                cb(event);//执行回调
            }
        };
    }


    EventUtil.addHandler(document.getElementsByClassName('parameter-container')[0], 'change', function(event){
    });
    // #startVideoEnrichJobBtn 功能
    //设置点击play-video显示模态框
    $(document).on('click', '.play-video', function(){
        $("#videoModel").modal();
    });

    var startVideoEnrichJobBtn = document.getElementById('startVideoEnrichJobBtn');
    var socket = io.connect("http://0.0.0.0:9090");

    socket.on('notice', function(data){
        if(data && data.code){
            switch (parseInt(data.code)) {
                case 0: //error
                    alert(data.err_message);
                    break;
                case 1: //连接成功
                console.log('socket connect successfully');
                    break;
                case 2: //视频浓缩任务容器开启
                    break;
                case 5://完成
                    var currentVideoName = data.outputVideoName;
                    var button = document.createElement('button');
                    button.className="btn btn-primary play-video";
                    button.appendChild(document.createTextNode("播放"));
                    var parent = document.getElementsByTagName('tbody')[0].lastElementChild;
                    var btnParent = parent.getElementsByClassName('action')[0];
                    btnParent.appendChild(button);
                    var link = document.createElement('a');
                    link.setAttribute("href", "http://0.0.0.0:8888/" + currentVideoName.replace(/\.mp4/, '.avi'));
                    var spanInLink = document.createElement('span');
                    var i = document.createElement('i');
                    i.className="fa fa-download";
                    spanInLink.appendChild(i);
                    link.appendChild(spanInLink);
                    var downParent = parent.getElementsByClassName('download')[0];
                    downParent.appendChild(link);
                    var progressJob = parent.getElementsByClassName('progress-job')[0];
                    progressJob.innerHTML ="完成";
                    EventUtil.removeClass(progressJob, 'progress-job');
                    EventUtil.addClass(progressJob, 'done');
                    EventUtil.addHandler(btnParent.getElementsByClassName('play-video')[0], 'click', function(event){
                        document.getElementById('playVideo').setAttribute("src", "http://0.0.0.0:8888/" + currentVideoName);
                    });

                    break;
            }
        }
    });
    socket.on('readStatus', function(status){

    });
    EventUtil.addHandler(startVideoEnrichJobBtn, 'click', function(event){
        var data = {};

        data.containerName = forms[1].elements.videoJobName.value;
        data.compressedRate = parseInt(document.getElementById('compressedRate').value);
        data.overlap = document.getElementById('overlap').value;

        data.x1 = parseInt(document.getElementById('x1').value);
        data.y1 = parseInt(document.getElementById('y1').value);

        data.x2 = parseInt(document.getElementById('x1').value) + parseInt(document.getElementById('w').value);
        data.y2 = parseInt(document.getElementById('y1').value);
        data.x3 = parseInt(document.getElementById('x1').value) + parseInt(document.getElementById('w').value);
        data.y3 = parseInt(document.getElementById('y1').value) +parseInt(document.getElementById('h').value);
        data.x4 = parseInt(document.getElementById('x1').value);
        data.y4 = parseInt(document.getElementById('y1').value) + parseInt(document.getElementById('h').value);

        socket.emit('startVideoJob', data); //开启任务
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.appendChild(document.createTextNode(document.getElementById('videoJobName').value));
        tr.appendChild(td1);
        var td2 = document.createElement('td');
        td2.appendChild(document.createTextNode("视频浓缩"));
        var td3 = document.createElement('td');
        td3.className="status";
        var span = document.createElement('span');
        span.className = "progress-job";
        span.appendChild(document.createTextNode('正在处理'));
        var ul = document.createElement('ul');
        ul.appendChild(document.createElement('li'));
        ul.appendChild(document.createElement('li'));
        ul.appendChild(document.createElement('li'));
        ul.appendChild(document.createElement('li'));
        ul.className = "clearfix";
        td3.appendChild(span);
        td3.appendChild(ul);
        var td4 = document.createElement('td');
        td4.className = "action";
        var td5 = document.createElement('td');
        td5.className = "download";

        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        var tbody = document.getElementsByClassName('video-list-table')[0].getElementsByTagName('tbody')[0];
        tbody.appendChild(tr);
        resetForms();//进行表单重置
    });



});
