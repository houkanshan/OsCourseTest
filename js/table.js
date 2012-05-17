(function(exports){
    var doc = window.document;
    var $id = function(id){
        return doc.getElementById(id);
    }
    var $c = function(className){
        return doc.getElementsByClassName(className);
    }

    function Table(){
        var table = $id('table');
        var phil = table.getElementsByClassName('phil')[0];
        var fork = table.getElementsByClassName('fork')[0];

        this.phils = phil.getElementsByTagName('li');
        this.forks = fork.getElementsByTagName('li');
    }
    Table.prototype.startEatting = function(id){
        var i = parseInt(id);
        var thisPhil = this.phils[i];

        if(thisPhil.className.match("eatting")){return;}

        thisPhil.className += " eatting";
        if(i === 0){
            this.phils[5].className += " eatting";
        }
    };
    Table.prototype.endEatting = function(id){
        var i = parseInt(id);

        var thisPhil = this.phils[i];

        thisPhil.className = thisPhil.className.replace(/eatting/g, '');
        if(i === 0){
            this.phils[5].className = this.phils[5].className.replace(/eatting/g, '');
        }
    }
    Table.prototype.getFork = function(id){
        debugger;
        var i = parseInt(id);

        var thisForkA = this.forks[i % 5];
        var thisForkB = this.forks[(i+1) % 5];

        if(thisForkA.className.match("eatting")){return;}

        thisForkA.className += " eatting";
        thisForkB.className += " eatting";
    }
    Table.prototype.putFork = function(id){
        var i = parseInt(id);

        var thisForkA = this.forks[i % 5];
        var thisForkB = this.forks[(i+1) % 5];

        thisForkA.className = thisForkA.className.replace(/eatting/g, '');
        thisForkB.className = thisForkB.className.replace(/eatting/g, '');
    }

    exports.Table = Table;
}(window));
