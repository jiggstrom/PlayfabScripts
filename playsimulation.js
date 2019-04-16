function runPlaySimulation(args) {
    var r = new simulationResult();
    r.outcome.win = 25;
    r.outcome.winX = 25;
    r.outcome.miss = 25;
    r.outcome.missX = 25;

    r.resultValue = Math.round((Math.random() * 100) + 1);
    r.result = "win";
    r.resultType = 0;

    r.yards = Math.round((Math.random() * 10) + 1);

    r.outcome.type = -1;
    r.outcome.text = "";
    r.outcome.haveReturn = false;
    r.returnLength = 0;

    return r;
}

class simulationResult {
    resultProbabilities = class {
        win = 0;
        winX = 0;
        miss = 0;
        missX = 0;
    };
    resultValue = 0;
    result = "win";
    resultType = 0;
    
    yards = 0;
    outcome = class {
        type = 0;
        text = "";
        haveReturn = false;
        returnLength = 0;
    }
}

