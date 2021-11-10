let channel = "";
let bountyMap = new Map();
let addCommand, removeCommand, purgeCommand, drawCommand;

function addToBountyMap(orcname, type) {
  console.log("-- addToBountyMap --");
  bountyMap.set(orcname, type);
  saveState(bountyMap);
} 

function removeFromBountyMap(orcname) {
  console.log("-- removeFromBountyMap --");
  bountyMap.delete(orcname);
  saveState(bountyMap);
}

function purgeBountyMap() {
  console.log("-- purgeBountyMap --");
  bountyMap.clear();
  saveState(bountyMap);
}

function drawBountyMap() {
  console.log("-------------------===================== DRAW =====================-------------------");
    $("#bounties").empty();
    for (let [orcname, type] of  bountyMap.entries()) {
        $("#bounties").append(`<li>${orcname}: ${type}</li>`);
      console.log("entry");
    }
}

function saveState(value) {
  console.log("-------------------===================== SAVE =====================-------------------");
    let jsonObject = {};
    bountyMap.forEach((value, key) => {  
        jsonObject[key] = value  
    });  
    console.log(JSON.stringify(jsonObject));
    SE_API.store.set('bountyMap', JSON.stringify(jsonObject));
}

function loadState() {
  console.log("-------------------===================== LOAD =====================-------------------");
    SE_API.store.get('bountyMap').then(obj => {
        if (obj !== null) {
            bountyMap = new Map(Object.entries(JSON.parse(obj.value)));
            drawBountyMap();
        }
    });
}

window.addEventListener('onWidgetLoad', function (obj) {
    channel = obj["detail"]["channel"]["username"];
    const fieldData = obj.detail.fieldData;
    addCommand = fieldData["add"];
    removeCommand = fieldData["remove"];
    purgeCommand = fieldData["purge"];
    drawCommand = fieldData["draw"];

    loadState();

  console.log("-------------------===================== LOADED =====================-------------------");
});

window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.listener !== "message") return;
  console.log("-------------------===================== onEventReceived =====================-------------------");
    let data = obj.detail.event.data;
    let message = html_encode(data["text"]);
    let user = data["displayName"];
    let modstatus = data["tags"].mod;
  console.log(data);
  
    // Broadcaster and mod only access
    if (user.toLowerCase() !== channel && modstatus === "0") return;
    if (message.indexOf(addCommand) === 0) {
        message = message.split(" ");
        let orcname = message[1];
        let type = message[2];
        if (bountyMap.has(orcname)) {
            console.log("Error, name already exists");
            return;
        }
        addToBountyMap(orcname, type);
        drawBountyMap();
        return;
    }
    if (message.indexOf(removeCommand) === 0) {
        message = message.split(" ");
        let orcname = message[1];
        removeFromBountyMap(orcname);
        drawBountyMap();
        return;
    }
    if (message === purgeCommand) {
        purgeBountyMap();
        drawBountyMap();
        return;
    }
  
  	// for testing
    if (message === drawCommand) {
        drawBountyMap();
        return;
    }
    console.log("-------------------===================== COMMAND UNKNOWN =====================-------------------");
});

function html_encode(e) {
    return e.replace(/[\<\>\"\^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}