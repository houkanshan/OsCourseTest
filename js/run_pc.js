//run.js
//draw init
require(["./js/init", "./js/table", "./js/line"], function() {
    window.onload = function(){
        //创建时间线画布
        processLineStage = new ProcessLineStage("container");
        //创建时间线控制器
        processLineController = new ProcessLineController(processLineStage, 
            {step: 2});
        text = new DrawDom();
        table = new Table();
        line = new Line("line");

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
            eventAggregator.on('execRun', function(args){
                switch(args.processId){
                    case 0: 
                        line.addX();
                        break;
                    case 1:
                        line.addY();
                        break;
                    default: break;
                }
            });
            line.init();
            var forbidStart = {};
            var forbidEnd = {};

            var process = new Process(0, 0);
            process.addCmd('execRun', 15);
            forbidStart.x = process.getCmdLength();
            process.addCmd('wait', 0);
            process.addCmd('execRun', 10);
            forbidEnd.x = process.getCmdLength();
            process.addCmd('wait', 1);
            process.addCmd('execRun', 15);
            process.addCmd('signal', 0);
            process.addCmd('signal', 1);
            processController.addProcess(process);
            process.getCmdLength();


            var process = new Process(1, 0);
            process.addCmd('execRun', 15);
            forbidStart.y = process.getCmdLength();
            process.addCmd('wait', 1);
            process.addCmd('execRun', 10);
            forbidEnd.y = process.getCmdLength();
            process.addCmd('wait', 0);
            process.addCmd('execRun', 15);
            process.addCmd('signal', 1);
            process.addCmd('signal', 0);
            processController.addProcess(process);

            line.addForbidRect(forbidStart, forbidEnd);
            
        }(window));


        (function(exports) {
            //启动进程
            processController.run();
        }(window));
    }
});
