function runPlaySimulation(args) {
    if(decrementUsageIfPossible(args.OffensiveCard)) {
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
            resultType = 2;
        }
        var res = getOutcome(resultType, parseInt(cardData.AvgYds));
        
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
            yards : res.yds,
            outcome : res.outcome,
            returnLength : 0
        }

        return r;
    }
    else {
        return {error: "Playbook page has no usages left."};
    }
}

function decrementUsageIfPossible(CardItemId) {    
    var x = getInventoryItemInstanceFromItemId(CardItemId);
    if(x != undefined) {
        if(x.ItemClass == "PlaybookBasicPage") return true;
        if(x.CustomData && x.CustomData.UsagesLeft) {
            log.debug("Custom data exists.");
            var curUsages = parseInt(x.CustomData.UsagesLeft);
            if(curUsages > 0){
                curUsages--;
                log.debug("Tot usage is now " + curUsages);
                var updateUserDataResult = server.UpdateUserInventoryItemCustomData({
                    PlayFabId: currentPlayerId,
                    ItemInstanceId: x.ItemInstanceId,
                    Data: {
                        UsagesLeft: parseInt(curUsages)
                    }
                });
                return true;
            }
        }
    }
    return false;
}

function getYards(resultType, avgYds){
    if(resultType < 3)
        return avgYds;
    else
        return 0;
}

function getOutcome(resultType, avgYds){
    var data = server.GetTitleInternalData({
        Keys: ["GameEngineParams"]        
    });

    var gamEngineParams = JSON.parse(data.Data["GameEngineParams"]);

    if(resultType == 0) {  //WinX
        var p = gamEngineParams.winextra;
        var rand1 = Math.random();
        var yds =  (p.max-avgYds-p.fixedextra)*Math.pow(rand1,p.slope)+avgYds+p.fixedextra;
        return {
            yds:yds,
            outcome: {
                type : 1,
                text : "",
                haveReturn : false
            }
        };
    }
    if(resultType == 1) {  //Win
        var p = gamEngineParams.win;
        var rand1 = Math.random();
        var yds = avgYds + rand1 * ((p.in*Math.pow(p.decrease,avgYds))*avgYds)-(((p.in*Math.pow(p.decrease, avgYds))*avgYds)*p.offset)
        return {
            yds:yds,
            outcome: {
                type : 1,
                text : "",
                haveReturn : false
            }
        };
    }
    if(resultType >= 2) {  //Miss
        var p = gamEngineParams.miss;
        var rand1 = Math.random();
        var rand2 = Math.random();

        if(rand1>=(1*p.stop)){ //Stop
            return {
                yds:0,
                outcome: {
                    type : 2,
                    text : "STOP",
                    haveReturn : false
                }
            };
        }
        else { //loss
            var yds = -((p.maxloss-1)*Math.pow(rand2,p.slope)+1);
            return {
                yds:yds,
                outcome: {
                    type : 0,
                    text : "",
                    haveReturn : false
                }
            };
        }
    }
    //Overridden by miss f.n
    if(resultType == 3) {  //MissX
        var p = gamEngineParams.missextra;
        var rand1 = Math.random();
        var rand2 = Math.random();

        if(rand1>=(1*p.turnover)){ //turnover
            return {
                yds:0,
                outcome: {
                    type : 3,
                    text : "TURNOVER",
                    haveReturn : false
                }
            };
        }
        else { //loss
            var yds = -((p.maxloss-p.minloss)*Math.pow(rand2,p.slope)+p.minloss);
            return {
                yds:yds,
                outcome: {
                    type : 0,
                    text : "",
                    haveReturn : false
                }
            };
        }

    }

    return {};
}

