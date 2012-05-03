require(["event", "draw", "debug", "config"], function() {
    var exports = this;
    // TODO LIST:
    // 1 every cmd will exec series of handle
    // 2 All the althorithm if based on timer
    // 3 重构的时候改写所有的类
    function Process(id, priority) {
        var cmdQuene = []; //exec cmd in turn

        this.isIdle = false;


        this.runCmd = function(eventAggregator) {
            var cmd = cmdQuene.shift();
            if(this.isIdle){
                return true;
          http://www.maydayplus.com/  }

            ihttp://www.maydayplus.com/f (cmd) {
                eventAggregator.emit(cmd, {processId: id});
                return true;
            }
            return false;
        };

        this.testCmd = function() {
            return !!cmdQuene[0];
        };

        this.addCmd = function(cmdName, repeatTime) {
            if (repeatTime === undefined) {
                repeatTime = 1;
            }
            for (var i = 0; i < repeatTime; i++) {
                cmdQuene.push(cmdName);
            }
        };

        this.getId = function() {
            if (id === undefined) {
                return -1;
            }
            return id;
        };


        this.getPriority = function(){
            if(typeof priority == "number" && priority <= config.MAX_PRIORITY){
                return priority;
            }
            return config.MAX_PRIORITY;
        }
    }

    /* ProcessSet for processes storage and clear
     * creator: houkanshan */
    function ProcessSet() {
        var set = {
            //execing proceses
            exec: (function(){
                      var process = new Process();
                      process.isIdle = true;
                      return process;
                  }()),
            //ready processes
            ready: [],
            //blocked proceses
            block: [],
            //completed processes
            comp: [] 
        };

        this.getList = function(listName) {
            return set[listName];
        };

        //move process of execing to processList, and set a process to exec
        // @processListName: exec要移动到的目的地, 如果空，返回错误
        // @newExec: 新的exec, 如果空，创建idle进程插入
        this.execChangeTo = function(processListName, newExec) {
            if (set[processListName] === undefined) {
                console.log('[err]execToReady:', arguments);
                return false;
            }
            if ( !!set.exec && set.exec.testCmd()) {
                //do change
                set[processListName].push(set.exec);
                debug('execChangeTo', 'switch exec and', processListName);
            } else {
                //ignore List, move to completed
                set.comp.push(set.exec);
                this.clearProcess();
                debug('execChangeTo', 'push exec to complete');
            }

            if (!(newExec instanceof Process)) {
                //if no new nexec, push a idle process 
                newExec = new Process();
                newExec.isIdle = true;
            }
            set.exec = newExec;
            return true;
        };

        this.addProcess = function(process) {
            if (!process) {
                console.log('[debug]addProcess', process);
                return;
            }
            set.ready.push(process);
        };

        this.clearProcess = function() {
            //clear comp
            while (set.comp.length !== 0) {
                set.comp.shift();
            }
            return set.comp.length;
        };
    }

    var sampOpt = {
        processTime: 10 //for count
    };

    function TimeFrame(option) {
        var count = 0; // count for processTime;
        return function(processSet) {
            if (++count < option.processTime) {
                return;
            }
            count = 0;
            var ready = processSet.getList('ready');
            processSet.execChangeTo('ready', ready.shift());
        };
    }

    function Priority(option){
        var count = 0;
        var curPriority = 0;
        var priorityList;
        var target;

        function nextPriority(){
            curPriority = ++curPriority % config.MAX_PRIORITY;
            return curPriority;
        }

        return function(processSet){
            var ready = processSet.getList('ready');
            if(!priorityList){
                priorityList = [];
                //将ready放入优先级队列
                for(var i = 0; i < ready.length; ++i){
                    priorityList[ready[i].getPriority()] ||
                        (priorityList[ready[i].getPriority()] = []);
                    priorityList[ready[i].getPriority()].push(ready[i]);
                    debug('priority', 'priority', ready[i].getPriority(), 'added');
                }
                //将ready的进程清空
                ready.splice(0, ready.length);
            }

            //检查程序是否执行完成
            if(processSet.getList('exec').testCmd()){
                target = 'ready';
                var runningTime = 
                    (config.MAX_PRIORITY*config.MAX_PRIORITY -
                     curPriority*curPriority + 1) * option.processTime;
                //时间片增加，继续执行此进程
                if(++count < runningTime){
                    debug('priority', '执行优先级为', curPriority - 1, '的进程');
                    debug('priority', priorityList[curPriority - 1]);
                    return;
                }
            }
            else{
                target = 'comp';
            }

            //时间片归零，切换进程
            count = 0;
            //找到下一个非undefine的优先级的队列
            while(!(curPriority in priorityList)/* ||*/
                    /*priorityList[curPriority].length == 0*/){
                //如果是undefine，跳过，如果是[]，也跳过
                //delete priorityList[curPriority];
                nextPriority();
            }

            //curPriority = (curPriority) % config.MAX_PRIORITY;
            debug('priority', '切换到优先级为', curPriority, '的进程');
            debug('priority', priorityList);
            //切换
            processSet.execChangeTo(target, priorityList[curPriority].shift());
            while(ready.length){
                var p = ready.shift();
                priorityList[p.getPriority()].push(p);
            }
            //到下一个优先级
            nextPriority();
        };
    }


    /**
     *  @option.intervalTime: 500 // for setInterval
     *  @option.eventAggregator: eventAggregator // for setProcessLine
     *  **/
    function ProcessController(option) {
        var processSet = new ProcessSet();
        var algorithm;
        var timer;

        this.addProcess = function(proc){
            processSet.addProcess(proc);
            option.eventAggregator.emit('addProc');
        }

        this.setAlgorithm = function(algorithmFun) {
            if (typeof algorithmFun !== 'function') {
                console.log('[debug]setAlgorithm:', arguments);
                return;
            }
            algorithm = algorithmFun;
        };

        this.run = function() {
            if (typeof algorithmFun == 'function') {
                console.log('[debug]stateChange: not function');
                return;
            }
            timer = setInterval(function() {
                algorithm(processSet);
                var exec = processSet.getList('exec');
                if (typeof exec != 'undefined') {
                    exec.runCmd(option.eventAggregator);
                } else {
                    console.log('[err]stateChange: no exec');
                }
            }, option.intervalTime);
        };

        this.end = function() {
            if (!timer) {
                console.log('[debug]end: did\'t start');
                return;
            }
            clearTimer(timer);
            timer = null;
        };
    }

    (function(){
        exports.Process = Process;
        exports.ProcessSet = ProcessSet;
        exports.TimeFrame = TimeFrame;
        exports.ProcessController = ProcessController;
        exports.Priority = Priority;
    }());
});
