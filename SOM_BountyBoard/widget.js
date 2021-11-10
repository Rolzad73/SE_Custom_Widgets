let channel = "";
let users = [];
let nicknames = [];
let bountyMap = new Map();
let addCommand, removeCommand, purgeCommand;

function addToBountyMap(orcname, type) {
  console.log("-- addToBountyMap --");
  bountyMap.set(orcname, type);
  saveState([bountyMap]);
  console.log(bountyMap);
} 

function removeFromBountyMap(orcname) {
  console.log("-- removeFromBountyMap --");
  bountyMap.delete(orcname);
  saveState([bountyMap]);
  console.log(bountyMap);
}

function purgeBountyMap() {
  console.log("-- purgeBountyMap --");
  bountyMap.clear();
  saveState([bountyMap]);
  console.log(bountyMap);
}

function drawBountyMap() {
  console.log("-------------------===================== DRAW =====================-------------------");
    $("#bounties").empty();
    for (let [orcname, type] of  bountyMap.entries()) {
        $("#bounties").append(`<li>${orcname}: ${type}</li>`);
    }

    //for(i = 0; i < bountyMap.size; i++) {
    //    $("#bounties").append(`<li>name: type</li>`);
        //$("#bounties").append(`<li>${bountyMap[i][0]}: ${bountyMap[i][1]}</li>`);
        //$("#bounties").append(`<li>${users[i]}: ${nicknames[i]}</li>`)
     //}
}


////////////////////////////////////////////////////////////////

function addToQueue(user, nickname) {
  console.log("-------------------===================== ADD =====================-------------------");
    if (users.indexOf(user) !== -1) return false;
    users.push(user);
    nicknames.push(nickname);
    saveState([users, nicknames]);
    return true;
}

function removeFromQueue(user, nickname) {
  console.log("-------------------===================== REMOVE =====================-------------------");
    if (users.indexOf(user) !== -1) return false;
    arrayRemove(users, user);
    arrayRemove(nicknames, nickname);
    saveState([users, nicknames]);
    return true;
}

function drawFromQueue(amount) {
  console.log("-------------------===================== DRAW =====================-------------------");
    for (i = 0; i < Math.min(nicknames.length, amount); i++) {
        $("#bounties").append(`<li>${users[i]}: ${nicknames[i]}</li>`)
    }
    users = users.slice(amount);
    nicknames = nicknames.slice(amount);
    saveState([users, nicknames]);
}

function list() {
  console.log("-------------------===================== LIST =====================-------------------");
    // not sure if I can do this
}

function clearScreen() {
  console.log("-------------------===================== CLEAR =====================-------------------");
    $("#bounties").empty();
}

function purge() {
  console.log("-------------------===================== PURGE =====================-------------------");
    users = [];
    nicknames = [];
    saveState([users, nicknames]);
}

function saveState(value) {
  console.log("-------------------===================== SAVE =====================-------------------");
    SE_API.store.set('bountyMap', value);
}

function loadState() {
  console.log("-------------------===================== LOAD =====================-------------------");
    SE_API.store.get('bountyMap').then(obj => {

        if (obj !== null) {
            orcname = obj[0];
        } else SE_API.store.set('bountyMap', [bountyMap])
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
  console.log(data);
  console.log(message);
  console.log(user);
    if (message.indexOf(addCommand) === 0) {
        message = message.split(" ");
        let orcname = message[1];
        let type = message[2];
        if (bountyMap.has(orcname)) {
            console.log("Error, name already exists");
            return;
        }
        addToBountyMap(orcname, type);
        return;
    }
    // Broadcaster commands only below
    if (user.toLowerCase() !== channel) return;
    if (message.indexOf(removeCommand) === 0) {
        message = message.split(" ");
        let orcname = message[1];
        removeFromBountyMap(orcname);
        return;
    }
    if (message === purgeCommand) {
        purgeBountyMap();
        return;
    }
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