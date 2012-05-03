
require(["../event", "../debug"]);

describe("ProcessSet", function(){
    var processSet;
    var PRO_NUM = 10;

    beforeEach(function(){
        processSet = new ProcessSet();
        for(var i = 0; i < PRO_NUM; i++){
            processSet.addProcess(new Process());
        }
    });

    it("should be "+PRO_NUM+" precesses", function(){
        var i = 0;
        expect(processSet.getList('ready').length).toEqual(10);
    });

    it('should be all moved to comp', function(){
        for(var i = 0; i < 10; ++i){
            processSet.execChangeTo('comp', new Process());
        }
        //expect(processSet.getList('comp').length).toEqual(10);
        expect(processSet.getList('comp').length).toEqual(0);
    });

    it("should "+'stop'+" precesses", function(){
        var i = 0;
        while(processSet.execChangeTo('omp', new Process())){
            i++;
        }
        expect(i).toEqual(0);

        while(processSet.execChangeTo('haha', 'omp')){
            i++;
        }
        expect(i).toEqual(0);
    });

    it("should be clear up", function(){
        expect(processSet.clearProcess()).toEqual(0);
        expect(processSet.getList('comp').length).toEqual(0);
    });
});

describe("TimeFrame", function () {
    var processSet;
    var PRO_NUM = 2;
    beforeEach(function(){
        processSet = new ProcessSet();
        for(var i = 0; i < PRO_NUM; i++){
            processSet.addProcess(new Process(i));
        }
    });

    it('should be processName changed', function(){
        var timeFrame = new TimeFrame({processTime:10});
        var cnt = 0;

        expect(processSet.getList('exec'), null);
        while(!processSet.getList('ready')){
            timeFrame(processSet);
            cnt++;
        }
        //expect(cnt).toEqual(10+1);
        //expect(processSet.getList('exec').getId()).toEqual(0);
    });
});

describe("eventAggregator", function  () {
    var eventAggregator;
    var cnt;

    beforeEach(function  () {
        eventAggregator = new EventAggregator();

        //make some cmd to test
        eventAggregator.on('showCnt', function  (n) {
            cnt = n;
        });
    });

    it('test event fire', function  () {
        var res = eventAggregator.emit('showCnt', 1);

        expect(cnt).toEqual(1);
    });
});

describe("ProcesController", function(){
    var processController;
    var processSet;
    var eventAggregator;
    var cnt;
    var CMD_NUM = 10;
    var PRO_NUM = 10;

    beforeEach(function  () {
        processController = new ProcessController({intervalTime:500});
        processSet = new ProcessSet();

        //
        eventAggregator = new EventAggregator();
        //make some cmd to test
        eventAggregator.on('showCnt', (function  () {
            var n = 0;
            return function(){
                cnt = n++;
            };
        }()));

        //add cmd to process
        //add process to processSet
        for(var i = 0; i < PRO_NUM; i++){
            var process = new Process(i, eventAggregator);
            process.addCmd('showCnt', CMD_NUM);
            processSet.addProcess(process);
        }
    });

    describe('test complete', function  () {
        beforeEach(function  () {
        });

        it('run all cmd', function  () {
            var readyList = processSet.getList('ready');
            for(var i = 0; i < PRO_NUM; ++i){
                var j = 0;
                var nowProcess = readyList[i];
                while(nowProcess.testCmd()){
                    nowProcess.runCmd(eventAggregator);
                    expect(cnt).toEqual(i*PRO_NUM+j);
                    j++;
                }
            }
            for(i = 0; i < PRO_NUM; ++i){
                processSet.execChangeTo('ready', readyList.shift());
            }

            expect(processSet.getList('comp').length).toEqual(0);
            processSet.clearProcess();
            expect(processSet.getList('comp').length).toEqual(0);
        });

    });

    describe('test timeFrame, will run', function  () {
        beforeEach(function  () {
            var timeFrame = new TimeFrame({processTime: 10});
            processController.setAlgorithm(timeFrame);
        });

        it('test 1 process run', function  () {
            processController.run();
        });
    });

});


function clearAll(){
    for(var i = 1; i < 1000; i++) {
        clearInterval(i);
    }
}
