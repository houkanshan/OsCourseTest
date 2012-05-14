require(["event", "draw", "debug", "config", "text"], function() {
    var exports = this;
    // TODO LIST:
    // 1 every cmd will exec series of handle
    // 2 All the althorithm if based on timer
    // 3 重构的时候改写所有的类
    function Process(id, priority) {
        var cmdQuene = []; //exec cmd in turn
        var runTime = 0;
        var cmdLib;
        //TODO 不确定是否public
        var holdCmd = [];

        this.startTime = 0;
        this.endTime = 0;
        this.isIdle = false;

        this.setLib = function(lib){
            cmdLib = lib;
        };

        this.getCmd = function(){
            return cmdQuene;
        }

        this.runCmd = function(uiEvent) {
            var cmd = cmdQuene.shift();
            var res = true;
            if(this.isIdle){
                return true;
            }

            if (cmd) {
                if(cmdLib){
                    cmdLib.emit(cmd.name, {
                        cmd: cmd, 
                        processId: id, 
                        holdCmd: holdCmd
                    });
                }
                uiEvent.emit(cmd.name, {
                    cmd: cmd,
                    holdCmd: holdCmd,
                    processId: id
                });
                if(cmd.value != -1){
                    runTime ++;
                }

                //for holdCmd
                switch(cmd.name){
                    case 'signal':
                        holdCmd.splice(del, 1);
                        break;
                    case 'wait':
                        var del = holdCmd.indexOf(cmd.value);
                        holdCmd.push(cmd.value);
                        break;
                    default:break;
                }

                return true;
            }

            return false;
        };

        this.testCmd = function() {
            return !!cmdQuene[0];
        };

        this.addCmd = function(cmdName, cmdValue) {
            if (cmdValue === undefined) {
                cmdValue = 1;
            }
            var cmd = {name: cmdName, value: cmdValue};
            if(cmd.name == 'execRun'){
                for (var i = 0; i < cmd.value; i++) {
                    cmdQuene.push(cmd);
                }
            }
            else{
                cmdQuene.push(cmd);
            }
        };

        this.getId = function() {
            if (id === undefined) {
                return -1;
            }
            return id;
        };

        this.getPriority = function() {
            if(typeof priority == "number" && priority <= config.MAX_PRIORITY) {
                return priority;
            }
            return config.MAX_PRIORITY;
        };

        this.getRunTime = function() {
            return runTime;
        };
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
                //this.clearProcess();
                debug('execChangeTo', 'push exec to complete');
            }

            //没有可执行进程必须让外部知道
            //if (!(newExec instanceof Process)) {
                ////if no new nexec, push a idle process 
                //newExec = new Process();
                //newExec.isIdle = true;
            //}
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
        var prevPriocessId;
        return function(processSet) {
            var curProcessId = -1;
            var exec = processSet.getList('exec');
            if(typeof exec == 'object' &&
                    exec instanceof Process){
                curProcessId = processSet.getList('exec').getId();
            }
            if(prevPriocessId != curProcessId){
                count = 0;
                prevPriocessId = curProcessId;
            }
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

            //初始化优先队列
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
                //放入第一个进程
                processSet.execChangeTo('comp', priorityList[curPriority].shift());
            }

            //检查程序是否执行完成
            if(processSet.getList('exec').testCmd()){
                target = 'ready';
                var runningTime = 
                    (config.MAX_PRIORITY*config.MAX_PRIORITY -
                     curPriority*curPriority + 1) * option.processTime;
                //时间片增加，继续执行此进程
                if(++count < runningTime){
                    debug('priority', '执行优先级为', curPriority, '的进程');
                    debug('priority', priorityList[curPriority]);
                    return;
                }
            }
            else{
                target = 'comp';
            }

            //到下一个优先级
            nextPriority();

            //时间片归零，切换进程
            count = 0;
            //找到下一个非undefine的优先级的队列
            var i = 0;
            while(!(curPriority in priorityList)||
                    priorityList[curPriority].length == 0){
                //如果是undefine，跳过，如果是[]，也跳过
                delete priorityList[curPriority];
                if(++i > config.MAX_PRIORITY){
                    return;
                }
                nextPriority();
            }

            //curPriority = (curPriority) % config.MAX_PRIORITY;
            debug('priority', '切换到优先级为', curPriority, '的进程');
            debug('priority', priorityList[curPriority]);
            //切换
            processSet.execChangeTo(target, priorityList[curPriority].shift());
            while(ready.length){
                var p = ready.shift();
                priorityList[p.getPriority()].push(p);
            }
        };
    }

    function CmdLib(processSet, signal){
        var reader = [];
        EventAggregator.call(this);
        this.on('test', function(){
            alert('test ok');
        });

        //signal cmd
        this.on('signal', function(args){
            var signalId = args.cmd.value;
            var processId = args.processId;
            var block = processSet.getList('block');
            var ready = processSet.getList('ready');

            if(typeof signal[signalId] != "object"){
                debug('signal', 'signal for none', signalId, processId);
                return false;
            }

            if(signal[signalId].length != 0){
                //只要还有信号wait, from block to ready[head]
                var wakeup;
                //删掉signal里的第一项，并将signal的第二项从block中弄出来
                signal[signalId].shift();
                for(var i = 0; i < block.length; ++i){
                    if(block[i].getId() == signal[signalId][0]){
                        //找到第一个被block进程, 删掉
                        wakeup = block.splice(i, 1)[0];
                        break;
                    }
                }
                if(typeof wakeup == 'object'){
                    //TODO 到底是放前还是放后, 目前放到最前
                    ready.unshift(wakeup);
                }
            }
            if(signal[signalId].length == 0){
                debugger;
                if(typeof reader[signalId] == 'object'){
                    //没有wait信号时,释放reader
                    for(var j = 0; j < block.length; ++j){
                        for(var i = 0; i < reader[signalId].length; ++i){
                            if(block[j].getId() == reader[signalId][i]){
                                ready.push(block.splice(j, 1)[0]);
                            }
                        }
                    }
                    reader[signalId] = [];
                }
            }
        });

        //wait cmd
        this.on('wait', function(args){
            var signalId = args.cmd.value;
            var processId = args.processId;

            if(typeof signal[signalId] != "object"){
                signal[signalId] = [];
            }
            if(signal[signalId].length > 0){
                //信号被占用, block
                var newExec = processSet.getList('ready').shift();
                processSet.execChangeTo('block', newExec);
            }
            signal[signalId].push(processId);
        });

        this.on('read', function(args){
            var readId = args.cmd.value;
            var processId = args.processId;

            if(typeof signal[readId] == "object" &&
                signal[readId].length > 0){
                //信号被占用, block
                var newExec = processSet.getList('ready').shift();
                processSet.execChangeTo('block', newExec);
                //修改value改变uiEvent行为
                args.cmd.value = -1;
                return false;
            }
            //push到reader里，因为它不排他，但恤啊哟被唤醒
            if(typeof reader[readId] != "object"){
                reader[readId] = [];
            }
            reader[readId].push(processId);
            return true;
        });
    }

    /**
     *  @option.intervalTime: 500 // for setInterval
     *  @option.eventAggregator: eventAggregator // for setProcessLine
     *  **/
    function ProcessController(option) {
        var processSet = new ProcessSet();
        var signal = [];
        var totalProcessCnt = 0;  //所有进程数
        var finishedCnt = 0;  //结束的进程数
        var processTime = 0; //cpu执行时间
        var t = 0;              //平均周转时间
        var dt = 0;             //带权周转时间
        var signal = [];
        var algorithm;
        var timer;

        var cmdLib = new CmdLib(processSet, signal);
        //var cmdLib = new EventAggregator();
        //cmdLib.on('test', function(){
            //alert('test ok');
        //});

        function countTime(proc){
            var runTime = proc.getRunTime();
            var liveTime = proc.endTime - proc.startTime;
            if(!liveTime){
                return;
            }

            finishedCnt ++;
            //t = processTime / finishedCnt;
            t = t * (finishedCnt - 1) + runTime;
            t = t / finishedCnt;

            dt = dt * (finishedCnt - 1) + runTime / liveTime;
            dt = dt / finishedCnt;

            option.eventAggregator.emit('updateTime', {t: t, dt: dt});
        }

        this.addProcess = function(proc){
            totalProcessCnt ++;
            proc.setLib(cmdLib);
            processSet.addProcess(proc);
            proc.startTime = processTime;
            option.eventAggregator.emit('addProc', {
                id: proc.getId,
                priority: proc.getPriority
            });
        };

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
                //run algorithm
                algorithm(processSet);

                //update running time
                var compProc = processSet.getList('comp');
                if(compProc){
                    for(var i = 0; i < compProc.length; ++i){
                        if(!compProc[i]){
                            compProc.splice(i, 1);
                            continue;
                        }
                        compProc[i].endTime = processTime;
                        countTime(compProc[i]);
                    }
                    processSet.clearProcess();
                }
                
                //run exec
                var exec = processSet.getList('exec');
                processTime ++;
                if (typeof exec != 'undefined') {
                    exec.runCmd(option.eventAggregator);
                } else {
                    console.log('[info]stateChange: no exec');
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
