function runPlaySimulation(args) {
    
    var r = new {
        probabilities : {
                win : 25,
                winX : 25,
                miss : 25,
                missX : 25
        },
        resultValue : Math.round((Math.random() * 100) + 1),
        result : "win",
        resultType : 0,
        yards : Math.round((Math.random() * 10) + 1),
        outcome : {
            type : -1,
            text : "",
            haveReturn : false
        },
        returnLength : 0
    }

    return r;
}

