require("config", function(){
    var exports = this;
    function DrawDom(){
        this.listHeight = config.P_HEIGHT;
        this.ul = document.getElementById('label');
    }
    DrawDom.prototype.addLi = function(text){
        var li = document.createElement('li');
        li.innerText = text;
        li.style.lineHeight = this.listHeight + 'px';
        ul.appendChild(li);
    };
    DrawDom.prototype.addProcess = function(id, priority){
        var text = 'process ' + id + 
            '(' + priority + ')';
        this.prototype.addLi(text);
    };

    exports.DrawDom = DrawDom;
});
