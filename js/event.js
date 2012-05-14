//represent a specified cmd in a process
function Event(name){
    var handers = [];

    this.getName = function(){
        return name;
    };

    this.addHandler = function(handler){
        handers.push(handler);
    };

    this.removeHandler = function(handler){
        for(var i = 0; i < handlers.length; i++) {
            if(handlers[i] == handler) {
                handlers.splice(i, 1);
            }
        }
    };

    this.fire = function (arg) {
        handers.forEach(function (hander) {
            hander(arg);
        });
    };
}

// needed by a event proccesser
function EventAggregator(){
    var events = [];

    function getEvent(eventName){
        // return $.grep(events, function(event){
        //     return event.getName() === eventName;
        // })[0];
        return (function(){
            for (var i = 0; i < events.length; i++) {
                if(events[i].getName() === eventName){
                    return events[i];
                }
            }
            //default return undefined
        }());
    }

    this.emit = function(eventName, eventArgs){
        var event = getEvent(eventName);

        if(!event){
            console.info('[err]event fired before subscribe');
            return;
            //event = new Event(eventName);
            //events.push(event);
        }

        event.fire(eventArgs);
    };

    this.on = function(eventName, handle){
        var event = getEvent(eventName);

        if(!event){
            event = new Event(eventName);
            events.push(event);
        }

        event.addHandler(handle);
    };
}
