require(["./js/lib/kinetic", "./js/config"], function() {
  var exports = window;

  function ProcessLineStage(canvas) {
    var stage = new Kinetic.Stage({
      container: canvas,
      height: 400,
      width: 1000 
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
    var baseStyle = {
      fill: "#00D2FF",
      height: option.height
    };
    var curRect;
    var step = option.step || 5;
    var stage = option.stage;

    //画一个时间帧
    this.drawTimeline = function(xPoint, style) {
      var targetXPos = xPoint * step;
      var styleChanged = false;

      if (style) {
        //baseStyle.fill = style.fill || baseStyle.fill;
        style.fill = (style.fill || baseStyle.fill);
        style.fill || (style.fill = baseStyle.fill); //same

        style.alpha && (style.alpha = 1);
        style.heightRate && (style.height = style.heightRate*baseStyle.height);

        //curStyle.height = style.height || curStyle.height;
        //如果没有height, (包含heightRate), 则用baseheight
        style.height || (style.height = baseStyle.height);

        styleChanged = true;
      }

      if (targetXPos == curXPos + step && curRect && !styleChanged) {
        // continually & rect exist & style exist & style same
        // only set width
        curRect.setWidth(curRect.getWidth() + step);
        stage.draw();
      } else {
        curRect = new Kinetic.Rect({
            x: targetXPos,
            y: option.row * baseStyle.height, // align to the process
            width: option.step,
            height: style.height,
            alpha: style.alpha,
            fill: style.fill
        });
        try {
          stage.addObj(curRect);
        } catch (e) {
          concole.log('[err]drawTimeline:', e);
        }
      }
      //if(style.top){
          //curRect.moveToTop();
          //stage.draw();
      //}
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
    this.timeRun = function(processIndex, style) {
      var processLine = processLines[processIndex];
      if (!processLine) {
        console.log('[info]timeRun: ', arguments);
        return;
      }
      processLine.drawTimeline(timePoint++, style);
    };

    this.timeOver = function(processIndex, style) {
      var processLine = processLines[processIndex];
      if (!processLine) {
        console.log('[info]timeRun: ', arguments);
        return;
      }
      style.alpha = 0.8;
      style.top = true;
      processLine.drawTimeline((timePoint-1), style);
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
