function runPlaySimulation(args) {
    var oc = getCatalogItem(args.OffensiveCard);
    var cardData = JSON.parse(oc.CustomData);
    var probs = cardData.Probs.split(",");
    var probsSum = parseInt(probs[0]) + parseInt(probs[1]) + parseInt(probs[2]) + parseInt(probs[3]);
    var resultValue = Math.round((Math.random() * probsSum) + 1);
    var result = "missextra";
    var resultType = 3;
    if(resultValue <=  parseInt(probs[0])) {
        result = "win";
        resultType = 0;
    }
    else if(resultValue <= ( parseInt(probs[0]) +  parseInt(probs[1]))) {
        result = "winextra";
        resultType = 1;
    }
    else if(resultValue <=  ( parseInt(probs[0]) +  parseInt(probs[1]) +  parseInt(probs[2]))) {
        result = "miss";
        resultType = 3;
    }

    var r = {
        probabilities : {
                win : probs[0],
                winX : probs[1],
                miss : probs[2],
                missX : probs[3]
        },
        resultValue : resultValue,
        result : result,
        resultType : resultType,
        yards : getYards(resultType, parseInt(cardData.AvgYds)),
        outcome : getOutcome(resultType, parseInt(cardData.AvgYds)),
        returnLength : 0
    }

    return r;
}

function getYards(resultType, avgYds){
    if(resultType < 3)
        return avgYds;
    else
        return 0;
}

function getOutcome(resultType, avgYds){
    if(resultType < 3)
        return {
            type : 1,
            text : "",
            haveReturn : false
        };
    else 
        return {
            type : 2,
            text : "STOP",
            haveReturn : false
        };
}

