// TODO LIST:
// 1 every cmd will exec series of handle
// 2

function TimeLine(){

}

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
}

function EventAggregator(){
    var events = [];

    function getEvent(){
        return $.grep(events, function(event){
            return event.getName() === eventName;
        })[0];
    }

    this.emit = function(eventName, eventArgs){
        var event = getEvent(eventName);

        if(!event){
            console.info('[err]event fired before subscribe');
            event = getEvent(eventName);
            events.push(event);
        }
    };

    this.on = function(eventName, handle){
        var event = getEvent(eventName);

        if(!event){
            event = new Event(eventName);
            events.push(event);
        }

        event.addHandler(handler);
    };
}

function Process(){
    var cmdQuene = []; //exec cmd in turn
}

function ProcessSet(){
    var ready = [], //ready processes
        exec = null,  //execing proceses
        block = [],  //blocked proceses
        comp = [];   //completed processes
}

function ProcessController(){
    var processSet = new ProcessSet();
}


