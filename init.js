function ProcessCtrl(){
    var processQueue = {
        ready: [], //就绪队列
        exec: null,  //执行进程
        block: [], //阻塞进队列
        comp: []   //完成队列
    }
}

function ProcessQueue(){
    var ready = [], //ready processes
        exec = null,  //execing proceses
        block = [],  //blocked proceses
        comp = [];   //completed processes

    
}