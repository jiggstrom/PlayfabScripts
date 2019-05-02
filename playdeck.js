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
                var cardData = JSON.parse(oc.CustomData);
                var probs = cardData.Probs.split(",");
                var yards = cardData.AvgYds;
                var usages = inventoryData.Inventory[item].CustomData.UsagesLeft;
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