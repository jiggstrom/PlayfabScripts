function getBalancedPlaydeck(args) {

    var gameDeckConfig = server.GetUserData({PlayFabId: currentPlayerId, Keys: ["GameDeck"]})
    var gameDeck;
    if (gameDeckConfig.Data.hasOwnProperty("GameDeck"))
        gameDeck = gameDeckConfig.Data["GameDeck"].Value.split(",");
    else
        gameDeck = []; // no config

    var deck = {
        cards : []
    }

    var	inventoryData = server.GetUserInventory({PlayFabId: currentPlayerId});
    for(var item in inventoryData.Inventory)
    {    
        if(inventoryData.Inventory[item].ItemClass == "PlaybookPage" || inventoryData.Inventory[item].ItemClass == "PlaybookBasicPage") {
            if(gameDeck != [] || arrayContains(gameDeck,inventoryData.Inventory[item].ItemId)) {
                var cat = getCatalogItem(inventoryData.Inventory[item].ItemId);
                var cardData = JSON.parse(cat.CustomData);
                var probs = cardData.Probs.split(",");
                var yards = cardData.AvgYds;

                var usages = 0;
                if(inventoryData.Inventory[item].CustomData && inventoryData.Inventory[item].CustomData.UsagesLeft != undefined)
                    usages = parseInt(inventoryData.Inventory[item].CustomData.UsagesLeft);
                var card = {id : inventoryData.Inventory[item].ItemId, yards : yards, type : 1, win : parseInt(probs[0]), winX : parseInt(probs[1]), miss : parseInt(probs[2]), missX : parseInt(probs[3]), usagesremaining : usages}
                deck.cards.push(card);
            }
        }

    }

    return deck;
}

function arrayContains(array, string){
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element === string) return true;        
    }
    return false;
}

function dictGetValue(array, key){
    if(array == undefined || array == []) return undefined;

    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.key === key) return element.value;        
    }
    log.debug("key '" + key + "' not found in dictionary");
    return undefined;
}

function mergePlaybook(){
    var	inventoryData = server.GetUserInventory({PlayFabId: currentPlayerId});
    var foundItems = [];
    for(var x in inventoryData.Inventory)    
    {    
        var item = inventoryData.Inventory[x];
        if(item.ItemClass == "PlaybookPage" || item.ItemClass == "PlaybookBasicPage") {
            var mv = dictGetValue(foundItems,item.ItemId)
            if(mv != undefined) {
                var usages = 0;
                if(item.CustomData && item.CustomData.UsagesLeft != undefined) {
                    var usages = parseInt(item.CustomData.UsagesLeft);
                }
                else {
                    var cat = getCatalogItem(item.ItemId);
                    var cardData = JSON.parse(cat.CustomData);
                    if(cardData.Usages != undefined) {
                        usages = parseInt(cardData.Usages);  
                    }                
                }
                log.debug("Dupe " + item.ItemId + " has " + usages + " usages.");
                if(mv.CustomData && mv.CustomData.UsagesLeft != undefined) {
                    log.debug("Custom data exists.");
                    mv.CustomData.UsagesLeft = (parseInt(mv.CustomData.UsagesLeft) + parseInt(usages));
                }
                else {
                    log.debug("Custom doesnt exist.");
                    mv.CustomData = {UsagesLeft: parseInt(usages)};
                }
                log.debug("Tot usage is now " + mv.CustomData.UsagesLeft);
                var updateUserDataResult = server.UpdateUserInventoryItemCustomData({
                    PlayFabId: currentPlayerId,
                    ItemInstanceId: mv.ItemInstanceId,
                    Data: {
                        UsagesLeft: parseInt(mv.CustomData.UsagesLeft)
                    }
                });
                log.debug("currentPlayerId is " + currentPlayerId);
                log.debug("item.ItemInstanceId " + item.ItemInstanceId);
                var updateUserDataResult = server.ConsumeItem({
                    PlayFabId: currentPlayerId,
                    ItemInstanceId: item.ItemInstanceId,
                    ConsumeCount: 1
                });
            }
            else {
                foundItems.push({key: item.ItemId, value: item});
                if(!(item.CustomData && item.CustomData.UsagesLeft != undefined)) {
                    log.debug(item.ItemId + " had no custom usages.");
                    var cat = getCatalogItem(item.ItemId);
                    var cardData = JSON.parse(cat.CustomData);
                    if(cardData.Usages != undefined) {
                        log.debug(item.ItemId + " updating to " + cardData.Usages);
                        var updateUserDataResult = server.UpdateUserInventoryItemCustomData({
                            PlayFabId: currentPlayerId,
                            ItemInstanceId: item.ItemInstanceId,
                            Data: {
                                UsagesLeft: parseInt(cardData.Usages)
                            }
                        });
                    }
                    item.CustomData = {UsagesLeft: parseInt(cardData.Usages)};
                }
            }
        }

    }
}