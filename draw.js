require(["./lib/kinetic", "config"], function() {
  var exports = this;

  function ProcessLineStage(canvas) {
    var stage = new Kinetic.Stage({
      container: canvas,
      height: 400,
      width: 900 
    });
    var layer = new Kinetic.Layer();
    stage.add(layer);


    this.addObj = function(obj) {
      layer.add(obj);
      this.draw();
    };
    this.draw = function() {
      layer.draw();
    }

    // var rect = new Kinetic.Rect({
    //     x: 239,
    //     y: 75,
    //     width: 100,
    //     height: 50,
    //     fill: "#00D2FF",
    //     stroke: "black",
    //     strokeWidth: 4
    // });
    // this.addObj(rect);
    // layer.add(rect);
  }


  //option = {row, height, step}


  function ProcessLine(option) {
    var curXPos = 0;
    var curStyle = {
      fill: "#00D2FF"
    };
    var curRect;
    var step = option.step || 5;
    var stage = option.stage;

    //画一个时间帧
    this.drawTimeline = function(xPoint, style) {
      var targetXPos = xPoint * step;
      var styleChanged = false;
      if (style) {
        curStyle.fill = style.fill || curStyle.fill;
        styleChanged = true;
      }

      if (targetXPos == curXPos + step && curRect && !styleChanged) {
        //continually & rect exist & style exist & style same
        curRect.setWidth(curRect.getWidth() + step);
        stage.draw();
      } else {
        curRect = new Kinetic.Rect({
          x: targetXPos,
          y: option.row * option.height,
          width: option.step,
          height: option.height,
          fill: curStyle.fill
        });
        try {
          stage.addObj(curRect);
        } catch (e) {
          concole.log('[err]drawTimeline:', e);
        }
      }
      curXPos = targetXPos;
    };

    //清空所有时间线 TODO
    this.clearTimeline = function() {};
  }

  //时间线控制器
  function ProcessLineController(processLineStage, option) {
    var processLines = [];
    var timePoint = 0;
    var stepWidth = option ? (option.step || 10) : 10;

    //加一条时间线
    this.addProcessLine = function() {
      processLines.push(new ProcessLine({
        stage: processLineStage,
        row: processLines.length,
        height: config.P_HEIGHT,
        step: stepWidth
      }));
      return processLines.length - 1;
    }

    //时间线推进一帧
    this.timeRun = function(processNum, style) {
      var processLine = processLines[processNum];
      if (!processLine) {
        console.log('[info]timeRun: ', arguments);
        return;
      }
      processLine.drawTimeline(timePoint++, style);
    }
  }

  (function(){
    exports.ProcessLineStage = ProcessLineStage;
    exports.ProcessLine = ProcessLine;
    exports.ProcessLineController = ProcessLineController;
  }());
  // var processLineStage = new ProcessLineStage("container");
  // var processLineController = new ProcessLineController(processLineStage);
  // var p1 = processLineController.addProcessLine();
  // var p2 = processLineController.addProcessLine();
  // var p3 = processLineController.addProcessLine();
  // var p4 = processLineController.addProcessLine();
  // for(var i = 0; i < 10; i++){
  //   processLineController.timeRun(p1, {fill:"#222222"});
  // }
  // for(var i = 0; i < 10; i++){
  //   processLineController.timeRun(p2);
  // }
});