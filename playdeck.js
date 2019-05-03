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
        if(inventoryData.Inventory[item].ItemClass == "PlaybookPage") {
            if(gameDeck != [] || arrayContains(gameDeck,inventoryData.Inventory[item].ItemId)) {
                var cat = getCatalogItem(inventoryData.Inventory[item].ItemId);
                var cardData = JSON.parse(cat.CustomData);
                var probs = cardData.Probs.split(",");
                var yards = cardData.AvgYds;

                var usages = 0;
                if(inventoryData.Inventory[item].CustomData && inventoryData.Inventory[item].CustomData.UsagesLeft)
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
    if(array == undefiuned || array == []) return undefined;

    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.key === string) return element.value;        
    }
    return undefined;
}

function mergePlaybook(){
    var	inventoryData = server.GetUserInventory({PlayFabId: currentPlayerId});
    var foundItems = [];
    for(var x in inventoryData.Inventory)    
    {    
        var item = inventoryData.Inventory[x];
        if(item.ItemClass == "PlaybookPage") {
            var mv = dictGetValue(foundItems,item.ItemId)
            if(mw != undefined) {
                var usages = 0;
                if(item.CustomData && item.CustomData.UsagesLeft) {
                    var usages = parseInt(item.CustomData.UsagesLeft);
                }
                else {
                    var cat = getCatalogItem(item.ItemId);
                    var cardData = JSON.parse(cat.CustomData);
                    if(cardData.Usages) {
                        usages = parseInt(cardData.Usages);                  
                }

                if(mv.CustomData && mv.CustomData.UsagesLeft)
                    mv.CustomData.UsagesLeft += usages;
                else
                    mv.CustomData.UsagesLeft = usages;
                }
                var updateUserDataResult = server.UpdateUserInventoryItemCustomData({
                    PlayFabId: currentPlayerId,
                    ItemInstanceId: mv.ItemInstanceId,
                    Data: {
                        UsagesLeft: mv.CustomData.UsagesLeft
                    }
                });
                var updateUserDataResult = server.ConsumeItem({
                    PlayFabId: currentPlayerId,
                    ItemInstanceId: item.ItemInstanceId,
                    ConsumeCount: 1
                });
            }
            else {
                foundItems.push({key: item.ItemId, value: item});
                if(!(item.CustomData && item.CustomData.UsagesLeft) {
                    var cat = getCatalogItem(item.ItemId);
                    var cardData = JSON.parse(cat.CustomData);
                    if(cardData.Usages) {
                        var updateUserDataResult = server.UpdateUserInventoryItemCustomData({
                            PlayFabId: currentPlayerId,
                            ItemInstanceId: item.ItemInstanceId,
                            Data: {
                                UsagesLeft: parseInt(cardData.Usages)
                            }
                        });
                    }
                }
            }
        }

    }
}