//loader.js
//author: KrazyLee,( __kk__ )
//modified: houkanshan

(function(window){
    var queue = {},
    head = document.head || document.getElementsByTagName("head")[0];


    function require(scripts,callback,context){
        var group = [].concat(scripts);
        var loadedCnt = 0;
        context = context || this;

        function stateChangeForIE(){
            var readyState  =  this.readyState;
            if(readyState == "loaded" || readyState == "complete"){
                this.onreadystatechange = null;
                if(++loadedCnt){
                    loadedCnt = 0;
                    callback.call(context);
                }
            }
        }

        for( var i = 0 ; i < group.length ; i++){
            var script  = document.createElement("script");
            var loaded = false;
            script.type = "text/javascript";
            if(queue[group[i]]){
               console.log( '[info]'+group[i] + " has loaded");
               loaded = true;
            }
            if(callback){
                if(script.readyState){
                    // for IE
                    script.onreadystatechange = stateChangeForIE;
                }else{
                    script.onload = script.onerror = function(){
                        if(++loadedCnt == group.length){
                            callback.call(context);
                        }
                    };
                }
            }
            else{
                if(script.readyState){
                    script.onreadystatechange = function(){++loadedCnt;}
                }
                else{
                    script.onload = script.onerror = function(){
                        ++loadedCnt;
                    }
                }
            }
            if(!loaded){
                loaded = false;
                queue[group[i]] = true;
                script.src = group[i] + ".js";
                head.appendChild(script);
            }
        }
    }
    window.require = require;
})(this);
