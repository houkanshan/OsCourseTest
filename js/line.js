require(['./js/lib/kinetic', './js/config'], function(){
    var exports = window;

    function Line(canvas){
        var stage = new Kinetic.Stage({
            container: canvas,
            height: 400,
            width: 400
        });
        var layer = null;
        var line = null;
        var step = -1;

        this.init = function(){
            step = config.axisLen;
            stage.clear();

            layer = new Kinetic.Layer();
            line = new Kinetic.Line({
                points: [{x: 0, y: 0}],
                stroke: 'black',
                strokeWidth: 1,
                lineCap: 'round',
                lineJoin: 'round'
            });
            line.getPoints().push({x: 0, y: 0});
            layer.add(line);
            stage.add(layer);
            stage.draw();
        };
        this.addX = function(){
            var lineAsix = line.getPoints();
            var x = lineAsix[lineAsix.length - 1].x += step;
            var y = lineAsix[lineAsix.length - 1].y;
            lineAsix.push({x: x, y: y});
            stage.draw();
        };
        this.addY = function(){
            var lineAsix = line.getPoints();
            var x = lineAsix[lineAsix.length - 1].x;
            var y = lineAsix[lineAsix.length - 1].y += step;
            lineAsix.push({x: x, y: y});
            stage.draw();
        };
        this.addForbidRect = function(start, end){
            start.x *= step;
            start.y *= step;
            end.x *= step;
            end.y *= step;
            var rect = new Kinetic.Rect({
                //x: (start.x + end.x) / 2,
                //y: (start.y + end.y) / 2,
                x: start.x,
                y: start.y,
                width: end.x - start.x,
                height: end.y - start.y,
                fill: '#00D2FF',
                alpha: 0.5,
                strock: 'blue',
                strockWidth: 0
            });
            layer.add(rect);
            stage.draw();
        }
    }

    exports.Line = Line;
});
