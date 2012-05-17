//run.js
//draw init
require(["./js/init", "./js/table"], function() {
    window.onload = function(){
        //创建时间线画布
        processLineStage = new ProcessLineStage("container");
        //创建时间线控制器
        processLineController = new ProcessLineController(processLineStage, 
            {step: 2});
        text = new DrawDom();
        table = new Table();

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
                        //keep i
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

            var tableHoldList = [];
            //需要数组来存储座位信息
            eventAggregator.on('wait', function(args){
                var processId = args.processId;
                var signalId = args.cmd.value;
                //只要检查第二个信号即可
                //processId 是 signalId
                if(signalId !== (processId % 5)){
                    return;
                }
                tableHoldList[processId] = true;
            });
            eventAggregator.on('signal', function(args){
                var processId = args.processId;
                var signalId = args.cmd.value;

                if(signalId !== ((processId + 1) % 5)){
                    return;
                }
                tableHoldList[processId] = false;
            });
            eventAggregator.on('execRun', function(args){
                var processId = args.processId;

                if(tableHoldList[processId]){
                    table.startEatting(processId);
                    table.getFork(processId);
                }
                for(var i = tableHoldList.length; i--;){
                    if(!tableHoldList[i]){
                        table.endEatting(i);
                        table.putFork(i);
                    }
                }
            });

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
                intervalTime: 50,
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
            //init Philosopher class
            var mutex = 5;
            function Philosopher(id){
                Process.call(this, id, 0);

                this.processId = id;
                this.forkA = id;
                this.forkB = (id + 1) % 5;
            }
            (function(){
                var prototype = Object(Process.prototype);
                prototype.constructor = Philosopher;
                Philosopher.prototype = prototype;
            }());
            Philosopher.prototype.startEatting = function(){
                this.addCmd('wait', this.forkB);
                this.addCmd('wait', this.forkA);
            };
            Philosopher.prototype.endEatting = function(){
                this.addCmd('signal', this.forkA);
                this.addCmd('signal', this.forkB);
            };
            Philosopher.prototype.thinking = function(times){
                times = times || 1;
                this.addCmd('execRun', times);
            };
 
            // create philosophers
            var philosophers = [];

            for(var i = 0; i < 5; i++){
                philosophers[i] = new Philosopher(i);
            }

            //base signal
            //specific test for a and c (0 2)
            philosophers[0].thinking(3);
            philosophers[0].startEatting();
            philosophers[0].thinking(10);
            philosophers[0].endEatting();
            philosophers[0].thinking(5);

            philosophers[2].thinking(3);
            philosophers[2].startEatting();
            philosophers[2].thinking(10);
            philosophers[2].endEatting();
            philosophers[2].thinking(5);

            philosophers[1].thinking(6);
            philosophers[1].startEatting();
            philosophers[1].thinking(6);
            philosophers[1].endEatting();
            philosophers[1].thinking(6);


            philosophers[3].thinking(6);
            philosophers[3].startEatting();
            philosophers[3].thinking(6);
            philosophers[3].endEatting();
            philosophers[3].thinking(6);

            philosophers[4].thinking(18);

            var maxEattingTime = 30;
            for(var i = 0; i < 5; ++i){
                var thisPhil = philosophers[i];

                var eattingTimeA = maxEattingTime * Math.random();
                var eattingTimeB = maxEattingTime * Math.random();
                var eattingTimeA = Math.round(eattingTimeA);
                var eattingTimeB = Math.round(eattingTimeB);
                if(eattingTimeA > eattingTimeB){
                    var tmp = eattingTimeA;
                    eattingTimeA = eattingTimeB;
                    eattingTimeB = tmp;
                }

                thisPhil.thinking(eattingTimeA);
                thisPhil.startEatting();
                thisPhil.thinking(eattingTimeB);
                thisPhil.endEatting();
                thisPhil.thinking(maxEattingTime - eattingTimeB);
            }

            for(var i = 0; i < philosophers.length; i++){
                processController.addProcess(philosophers[i]);
            }

        }(window));


        (function(exports) {
            //启动进程
            processController.run();
        }(window));
    }
});
