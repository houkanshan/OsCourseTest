var debug = function(){};
if(DEBUG && DEBUG == true){
    debug = function(nameSpace){
        var args = Array.prototype.slice.call(arguments, 1);
        var msg = [('[debug]' + nameSpace + ': ')]
            .concat(args);
        console.debug(msg);
    };
}
