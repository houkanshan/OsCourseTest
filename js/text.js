require(["./js/config", "./js/debug"], function(){
    $g = function(idName){
        return document.getElementById(idName);
    }

    var exports = this;
    function DrawDom(){
        this.listHeight = config.P_HEIGHT;
        this.processUl = document.getElementById('processlist');
        this.timeUl = document.getElementById('processtime');
        this.timeList = [];
    }
    DrawDom.prototype.addLi = function(text, ul){
        var processLi = document.createElement('li');
        processLi.innerText = text;
        processLi.style.lineHeight = this.listHeight + 'px';

        ul.appendChild(processLi);

        return processLi;
    };
    //DrawDom.prototype.drawTime = function(ul){
        //return timeLi;
    //};
    DrawDom.prototype.updateTime = function(t, dt){
        var timeDiv = $g('time');
        var tSpan = timeDiv.getElementsByClassName('t')[0]
            .getElementsByTagName('dd')[0];
        var dtSpan = timeDiv.getElementsByClassName('dt')[0]
            .getElementsByTagName('dd')[0];

        if(!time){
            debug('updateTime', 'process not found');
            return;
        }
        tSpan.innerText = t;
        dt && (dtSpan.innerText = dt);
    }

    DrawDom.prototype.addProcess = function(id, priority){
        var text = 'process ' + id + 
            '(' + priority + ')';
        this.addLi(text, this.processUl).setAttribute('data-id', id);
    };

    DrawDom.prototype.highLight = function(id){
        var lis = this.processUl.getElementsByTagName('li');
        for(var i = lis.length; i--;){
            if(lis[i].getAttribute('data-id') == String(id)){
                lis[i].className += ' run';
            }else{
                lis[i].className = '';
            }
        }
    };

    exports.DrawDom = DrawDom;
});
