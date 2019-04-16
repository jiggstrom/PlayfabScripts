handlers.startUnlockTimedContainer = function (args) {
    var instanceId = args.id;
  	log.debug("instanceId is " + instanceId);
    
  	var inventoryItem = getInventoryItemInstance(instanceId);
  	var catalogItem = getCatalogItem(inventoryItem.ItemId);
  	
  	var data = JSON.parse(catalogItem.CustomData);
  	log.debug("UnlockTime is " + data.UnlockTime);
  	var newDateObj = new Date(Date.now() + parseInt(data.UnlockTime) *1000);
  
    var updateUserDataResult = server.UpdateUserInventoryItemCustomData({
        PlayFabId: currentPlayerId,
		ItemInstanceId: instanceId,
        Data: {
            opensAt: newDateObj.toUTCString()
        }
    });

};

handlers.getTimedContainerKey = function (args) {
    var instanceId = args.id;
  	log.debug("instanceId is " + instanceId);
    
  	var inventoryItem = getInventoryItemInstance(instanceId);
  	var data = inventoryItem.CustomData;
  	log.debug("instanceId opensAt " + data.opensAt);
  	log.debug("parsedAs " + new Date(Date.parse(data.opensAt)).toUTCString());
  	log.debug("now is " + new Date(Date.now()).toUTCString());
  	if(new Date(Date.parse(data.opensAt)) < new Date(Date.now()))
    {
      log.debug("Try to grant" + inventoryItem.ItemId + "_KEY to player");
      var itms = server.GrantItemsToUser({
      	PlayFabId: currentPlayerId,
		"Annotation": "Negotiation Ready",
  		"ItemIds": [
    		inventoryItem.ItemId + "_KEY"   		
 		]
      });
      
      return getInventoryItemInstance(itms.ItemGrantResults[0].ItemInstanceId, true);
    }
};

handlers.executeTraining = function (args) {
    var instanceId = args.id;
  	log.debug("instanceId is " + instanceId);
    
  	var inventoryItem = getInventoryItemInstance(instanceId);
  	var catalogItem = getCatalogItem(inventoryItem.ItemId);
  	
  	var data = JSON.parse(catalogItem.CustomData);
  	//{"Training":[{"Attribute":"Speed","Value":10}],"Price":{"Currency":"PC","Amount":100}}
  	log.debug("Training gives " + data.Training[0].Attribute + " with " + data.Training[0].Value + " for " + data.Price.Amount + " " + data.Price.Currency);
  
  	if(reduceCurrencyIfPossible(data.Price))
	{
        updatePlayerAttributes(data.Training[0]);

        var bundleId = inventoryItem.BundleParent;
      	var updateUserDataResult = server.ConsumeItem({
              PlayFabId: currentPlayerId,
              ItemInstanceId: inventoryItem.ItemInstanceId,
              ConsumeCount: 1
        });
        log.debug("Training has bundleId " + bundleId );
        var items = getBundleItemInstances(bundleId);
        log.debug("Found " + items.length + " items to consume.");
        for(var i in items)
        {
          log.debug("Consuming item " + items[i].ItemInstanceId);
          var updateUserDataResult = server.ConsumeItem({
              PlayFabId: currentPlayerId,
              ItemInstanceId: items[i].ItemInstanceId,
              ConsumeCount: 1
          });
        }
    }
};

handlers.runPlaySimulation = function (args) {
  if(args.seecret == "fluffo"){
    return runPlaySimulation(args);
  }  
}

handlers.getBalancedPlaydeck = function (args) {
  if(args.seecret == "fluffo"){
    return getBalancedPlaydeck(args);
  }  
}

function getCatalogItem(itemId) {
  var catalogData = server.GetCatalogItems({CatalogVersion: null});
  for(var item in catalogData.Catalog)
  {
    if(catalogData.Catalog[item].ItemId == itemId) return catalogData.Catalog[item];
  }
}

function getInventoryItemInstance(itemInstanceId, doRefresh) {
  	var inventoryData = server.GetUserInventory({PlayFabId: currentPlayerId});
  
  for(var item in inventoryData.Inventory)
  {
    log.debug("found " + inventoryData.Inventory[item].ItemInstanceId);
    if(inventoryData.Inventory[item].ItemInstanceId == itemInstanceId) return inventoryData.Inventory[item];
  }
}

function getVCBalance(vc)
{
  	var	inventoryData = server.GetUserInventory({PlayFabId: currentPlayerId});

  	if(inventoryData.VirtualCurrency.hasOwnProperty(vc))    
    {
      return inventoryData.VirtualCurrency[vc];
    }
  	else
    {
      return 0;
    }  
}

function getBundleItemInstances(bundleId) {
  var retarr = new Array();
  if(bundleId != null && bundleId != "")
  {
    var inventoryData = server.GetUserInventory({PlayFabId: currentPlayerId});

    for(var item in inventoryData.Inventory)
    {
      log.debug("found " + inventoryData.Inventory[item].ItemInstanceId + " with bundleparentid " + inventoryData.Inventory[item].BundleParent);
      if(inventoryData.Inventory[item].BundleParent == bundleId) retarr.push(inventoryData.Inventory[item]);
    }
  }
  return retarr;
}

function updatePlayerAttributes(obj)
{
  var getUserDataRequest = {
        PlayFabId: currentPlayerId,
        Keys: ["Attributes"]
    };
    var charDataResult = server.GetUserReadOnlyData(getUserDataRequest);
    log.debug(charDataResult);
    var attributes;
    if (charDataResult.Data.hasOwnProperty("Attributes"))
        attributes = JSON.parse(charDataResult.Data["Attributes"].Value);
    else
        attributes = []; // no attributes
  
  	var found = false;
    for (var index = 0; index < attributes.length; ++index) 
    {      
    	if(attributes[index].Name == obj.Attribute)
        {
        	attributes[index].Value += obj.Value;
          	found = true;
        }      
    }
  	if(found == false)
      attributes.push({Name: obj.Attribute, Value: obj.Value});

    log.debug(attributes);
 
	var updateDataRequest = {
		PlayFabId: currentPlayerId,
		Data: {Attributes : JSON.stringify(attributes) },
		Permission: "Public"
	};
  log.debug(updateDataRequest);
	log.debug(server.UpdateUserReadOnlyData(updateDataRequest));
}

function reduceCurrencyIfPossible (args) {
	log.debug("reduceCurrencyIfPossible " + args);
  
    if(args.Amount >= 0) return true;
  
	var bal = getVCBalance(args.Currency);
  	if(bal >= args.Amount)
    {
      	var subtractUserVirtualCurrencyRequest = {
			PlayFabId: currentPlayerId,
			VirtualCurrency: args.Currency,
			Amount: args.Amount
        };
      
		log.debug(server.SubtractUserVirtualCurrency(subtractUserVirtualCurrencyRequest));      
    	return true;      
    }
  	else
    {
      return false;
    }
};
