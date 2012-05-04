//run.js
//draw init
require(["./init"], function() {
    window.onload = function(){
        //创建时间线画布
        processLineStage = new ProcessLineStage("container");
        //创建时间线控制器
        processLineController = new ProcessLineController(processLineStage, 
            {step: 2});
        text = new DrawDom();

        (function(exports) {
            var runStyle = {
                normal: {},
                waiting: {
                    fill: "#222222"
                },
                execRun: {
                    fill: "#4286F4"
                }
            };

            //event init
            eventAggregator = new EventAggregator();
            //注册事件
            for(var i in runStyle){
                if(runStyle.hasOwnProperty(i)){
                    eventAggregator.on(i, function(args) {
                        processLineController.timeRun(args.processId,
                            runStyle[i]);
                    });
                }
            }

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
            processController.setAlgorithm(priority);

        }(window));

        //TODO: 创建进程及进程指令序列
        (function(exports){
            for(var i = 0; i < 15; ++i){
                var process = new Process(i, i%config.MAX_PRIORITY);
                for(var j = 0; j < 25; ++j){
                    process.addCmd('execRun', 1);
                }
                processController.addProcess(process);
            }
        }(window));

        (function(exports){
            
        }(window));

        (function(exports) {
            //启动进程
            processController.run();
        }(window));
    }
});
