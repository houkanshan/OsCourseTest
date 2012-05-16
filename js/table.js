(function(exports){
    var doc = window.document;
    var $id = function(id){
        return doc.getElementById(id);
    }
    var $c = function(className){
        return doc.getElementsByClassName(className);
    }

    function Table(){
        this.table = $id('table');
        this.phil = this.table.getElementsByClassName('phils')[0];
        this.fork = this.table.getElementsByClassName('fork')[0];
    }
    Table.prototype.startEatting(id){

    }
    Table.prototype.endEatting(id){
    }
    Table.prototype.getFork(id){
    }
    Table.prototype.putFork(id){
    }

    exports.Table = Table;
}(window));
