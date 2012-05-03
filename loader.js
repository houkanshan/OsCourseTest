//loader.js
//author: KrazyLee, __kk__

(function(window){
    var queue = {},
    head = document.head || document.getElementsByTagName("head")[0];


    function require(scripts,callback,context){
        var group = [].concat(scripts);
        context = context || this;

        function stateChangeForIE(){
            var readyState  =  this.readyState;
            if(readyState == "loaded" || readyState == "complete"){
                this.onreadystatechange = null;
                callback.call(context);
            }
        }

        for( var i = 0 ; i < group.length ; i++){
            var script  = document.createElement("script");
            script.type = "text/javascript";
            if(queue[group[i]]){
               console.log( '[info]'+group[i] + " has loaded");
               continue;
            }
            if(callback){
                if(script.readyState){
                    // for IE
                    script.onreadystatechange = stateChangeForIE;
                }else{
                    script.onload = script.onerror = function(){
                        callback.call(context);
                    };
                }
            }
            queue[group[i]] = true;
            script.src = group[i] + ".js";
            head.appendChild(script);
        }
    }
    window.require = require;
})(this);