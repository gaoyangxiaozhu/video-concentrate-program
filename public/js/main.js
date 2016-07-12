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

            return element; //支持链式调用
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

    //点击创建视频浓缩任务 显示创建面板
    var creatNewJob = document.getElementsByClassName('create-new-job')[0];

    EventUtil.addHandler(creatNewJob, 'click', function(event){
        var that = EventUtil.getTarget(event);
        EventUtil.addClass(document.body, 'show');
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

            var xhr = new XMLHttpRequest();
            var videoFormData = new FormData(forms[0]);
            var progressBar = document.getElementsByClassName('progress-bar')[0];
            xhr.open("POST", "/api/newVideoJob");

            EventUtil.addHandler(xhr.upload, 'progress', uploadProgress(progressBar));
            EventUtil.addHandler(xhr, 'load', uploadComplete(progressBar, function(event){

                function showSelectedCoords(c){
                    document.getElementById('x1').value = c.x;
                    document.getElementById('x2').value = c.x2;
                    document.getElementById('y1').value = c.y;
                    document.getElementById('y2').value = c.y2;
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
    var startVideoEnrichJobBtn = document.getElementById('startVideoEnrichJobBtn');
    EventUtil.addHandler(startVideoEnrichJobBtn, 'click', function(event){
        var data = new FormData(document.getElementsByClassName('set-parameter-form')[0]);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/startVideoJob");
        EventUtil.addHandler(xhr, 'load', uploadComplete(null, function(event){

        }));
        xhr.send(data);




    });
});
