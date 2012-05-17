//run.js
//draw init
require(["./js/init"], function() {
    window.onload = function(){
        //创建时间线画布
        processLineStage = new ProcessLineStage("container");
        //创建时间线控制器
        processLineController = new ProcessLineController(processLineStage, 
            {step: 2});
        text = new DrawDom();

        (function(exports) {
            var runStyle = {
                execRun: {
                    fill: "#4286F4"
                },
                signal: {
                    fill: "#111111"
                },
                wait: {
                    fill: "#333333"
                },
                read: {
                    fill: "#aeaeae"
                }

            };

            var signalStyle = [
                {fill: "#E24B39"},
                {fill: "#863C83"},
                {fill: "#4BB449"},
                {fill: "#024D92"},
                {fill: "#800000"},
                {fill: "#863C83"},
                {fill: "#4BB449"},
                {fill: "#024D92"},
                {fill: "#800000"},
                {fill: "#863C83"},
                {fill: "#4BB449"},
                {fill: "#024D92"},
                {fill: "#800000"},
                {fill: "#863C83"},
                {fill: "#4BB449"},
                {fill: "#024D92"}
            ];

            //event init
            eventAggregator = new EventAggregator();
            //注册命令事件
            for(var i in runStyle){
                if(runStyle.hasOwnProperty(i)){
                    eventAggregator.on(i, (function(i){
                        return function(args) {
                            if(args.cmd.value == -1){
                                return;
                            }
                            processLineController.timeRun(args.processId,
                                runStyle[i]);
                            text.highLight(args.processId);
                            if(typeof args.holdCmd == "object" && 
                                args.holdCmd.length !== 0){
                                for(var j = 0; j < args.holdCmd.length; ++j){
                                    var cmdStyle = {
                                        fill: signalStyle[args.holdCmd[j].value].fill,
                        heightRate: 1-((j+1)/(args.holdCmd.length+1))
                                    };
                                    processLineController.timeOver(args.processId, 
                                        cmdStyle);
                                }
                            }
                        };
                    }(i)));
                }
            }

            //注册进程管理事件
            eventAggregator.on('addProc', function(args){
                processLineController.addProcessLine();
                text.addProcess(args.id(), args.priority());
            });

            eventAggregator.on('updateTime', function(args){
                text.updateTime(args.t, args.dt);
            });
        }(window));

        (function(exports) {
            //process init
            //创建进程管理
            processController = new ProcessController({
                intervalTime: 5,
                eventAggregator: eventAggregator
            });
            //创建时间片算法
            var timeFrame = new TimeFrame({
                //每次执行的时间片长度
                processTime: 5
            });

            var priority = new Priority({
                processTime: 1
            });
            //进程管理加载算法
            //processController.setAlgorithm(priority);
            processController.setAlgorithm(timeFrame);

        }(window));

        (function(exports){
            //base signal
            //for(var i = 0; i < 5; ++i){
            //var process = new Process(i, i%config.MAX_PRIORITY);
            //for(var j = 0; j < 5; ++j){
            //process.addCmd('execRun', 1);
            //}
            //process.addCmd('wait', 1);
            //for(var j = 0; j < 15; ++j){
            //process.addCmd('execRun', 1);
            //}
            //process.addCmd('wait', 2);
            //for(var j = 0; j < 15; ++j){
            //process.addCmd('execRun', 1);
            //}
            //process.addCmd('signal', 2);
            //for(var j = 0; j < 5; ++j){
            //process.addCmd('execRun', 1);
            //}
            //process.addCmd('signal', 1);
            //for(var j = 0; j < 15; ++j){
            //process.addCmd('execRun', 1);
            //}
            //processController.addProcess(process);
            //}
        }(window));
        (function(exports){
            ////test signal conflic
            //for(var i = 0; i < 10; ++i){
            //var CMD_LENGTH = 40;
            //var MAX_WIRTE_LENGTH = 30;
            //var process = new Process(i, i%config.MAX_PRIORITY);
            //var isWriter = !!Math.round(Math.random());
            //var writeSignal;
            //var writeIn = 0;
            //var writeLength = 0;
            //if(isWriter){
            ////随机设置写入位置，写完位置
            //writeIn = Math.round(CMD_LENGTH * Math.random());
            //writeLength = Math.round(MAX_WIRTE_LENGTH * Math.random());
            //writeSignal = Math.round(3 * Math.random());
            //////debug
            //writeSignal = 2;
            ////writeLength = 0;


            ////加信号cmd
            //for(var j = 0; j < writeIn; ++j){
            //process.addCmd('execRun', 1);
            //}
            //process.addCmd('wait', writeSignal);
            //for(j = 0; j < writeLength; ++j){
            //process.addCmd('execRun', 1);
            //}
            //process.addCmd('signal', writeSignal);
            //}
            //for(var j = 0; j < (CMD_LENGTH - writeLength - writeIn); ++j){
            //process.addCmd('execRun', 1);
            //}
            //processController.addProcess(process);
            //}
        }(window));
        //TODO: 创建进程及进程指令序列
        (function(exports){
            //reader and writer
            for(var i = 0; i < 10; ++i){
                var CMD_LENGTH = 40;
                var MAX_WIRTE_LENGTH = 30;
                var process = new Process(i, i%config.MAX_PRIORITY);
                var isWriter = !!Math.round(Math.random());
                var writeSignal = 0;
                var writeIn = 0;
                var writeLength = 0;
                if(isWriter){
                    //随机设置写入位置，写完位置
                    writeIn = Math.round(CMD_LENGTH * Math.random());
                    writeLength = Math.round(MAX_WIRTE_LENGTH * Math.random());
                    writeSignal = Math.round(3 * Math.random());
                    ////debug
                    writeSignal = 0;

                    //加信号cmd
                    for(var j = 0; j < writeIn; ++j){
                        process.addCmd('execRun', 1);
                    }
                    process.addCmd('wait', writeSignal);
                    for(j = 0; j < writeLength; ++j){
                        process.addCmd('execRun', 1);
                    }
                    process.addCmd('signal', writeSignal);

                    for(var j = 0; j < (CMD_LENGTH - writeLength - writeIn); ++j){
                        process.addCmd('execRun', 1);
                    }
                }
                else{
                    for(var j = 0; j < CMD_LENGTH; ++j){
                        process.addCmd('read', writeSignal);
                    }
                }
                processController.addProcess(process);
            }
        }(window));

        (function(exports) {
            //启动进程
            processController.run();
        }(window));
    }
});
