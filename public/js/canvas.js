var colour = "#FF0000";
var messages = [
  [],
]; 
var colours = [
  "rgb(255, 0, 0)",
  "rgb(0, 255, 0)",
  "rgb(0, 0, 255)",
  "rgb(255, 255, 0)",
  "rgb(255, 0, 255)",
  "rgb(0, 255, 255)",
  "rgb(255, 255, 255)",
  "rgb(0, 0, 0)",
  "rgb(74, 65, 42)",
  "rgb(1, 50, 32)",
];

var lastPlaced = 0;

async function interpretClick() {
  const canvas = document.getElementById("canvas");
  const canvasCtx = canvas.getContext("2d");
  var rect = canvas.getBoundingClientRect();
  var c = 0;

  posY = event.clientY - rect.top;
  posX = event.clientX - rect.left;
  posX = Math.floor(posX / 20);
  posY = Math.floor(posY / 20); 

  for (var i = 0; i < 10; i++) {
    if (colours[i] == colour) {
      c = i;
    }
  }

  var response = await fetch("/canvas/placepixel", {
    method: "POST",
    body: JSON.stringify({ x: posX, y: posY, c: c }), 
  });
  if(response.ok){
  	startTimeout(await response.text());
  }
}

function updateColour() {
  var selection = document.querySelectorAll(":hover");
  selection = selection[selection.length - 1];
  colour = window.getComputedStyle(selection).backgroundColor;
}

async function establishPixelConn() {
  var p_sock = new WebSocket("/canvas/updatestream");
  getCanvas();
  p_sock.addEventListener("message", (event) => {
    var newPixel = event.data;
    newPixel = JSON.parse(event.data);
    drawPixel(newPixel.x, newPixel.y, newPixel.c);
  });
}

async function establishChatConn() {
  getMessages(); 
  var c_sock = new WebSocket("/chat/messagestream");
  c_sock.addEventListener("message", (event) => {
    var fullMsg = event.data;
    var usernameLen = parseInt(fullMsg.slice(0, 1));

    if (fullMsg.slice(1, 2) != ";") {
      usernameLen = usernameLen * 10;
      usernameLen = usernameLen + parseInt(fullMsg.slice(1, 2));
      console.log(usernameLen);
      var username = fullMsg.slice(3, 3 + usernameLen);
      var message = fullMsg.slice(3 + usernameLen);
    } else {
      var username = fullMsg.slice(2, 2 + usernameLen);
      var message = fullMsg.slice(2 + usernameLen);
    }

    messages.splice(0, 0, [username, message]); 
    refreshMessages(); 
  });
}

async function getMessages() {
  const response = await fetch("/chat/getmessages");
  messages = JSON.parse(await response.text());
  refreshMessages();
}

function refreshMessages() {
  var messageBox = document.getElementById("messageBox");
  messageBox.innerHTML = "";
  for (let i = 0; i < messages.length; i++) {
    if (messages[i][0] == "") {
      break;
    }
    textNode = document.createTextNode(messages[i][0] + " : " + messages[i][1]);
    messageBox.insertBefore(
      document.createElement("br"),
      messageBox.firstChild,
    );
    messageBox.insertBefore(textNode, messageBox.firstChild);
  }
}

async function sendMessage() {
  var message = document.getElementById("textInput");
  message = message.value;
  if (message.length > 300) {
    alert("Message length above 300, be more concise"); 
    return;
  }
  var messageData = new FormData();

  messageData.append("message", message);

  const response = await fetch("/chat/postmessage", {
    method: "POST",
    body: messageData,
  });

  if (response.ok) {
    document.getElementById("textInput").value = ""; 
  }
}

function keyPress(event) {
  if (event.keyCode == 13) {
    sendMessage();
  }
}

async function getCanvas() {
  pixelsY = window.screen.width / 20; 
  pixelsX = window.screen.height / 20;

  var response = await fetch("canvas/fullcanvas/0/0/819/819");
  var screenPixels = await response.json();
  for (var i = 0; i < screenPixels.length; i++) {
    drawPixel(screenPixels[i].x, screenPixels[i].y, screenPixels[i].c);
  }
}

function drawPixel(x, y, c) {
  const canvas = document.getElementById("canvas");
  const canvasCtx = canvas.getContext("2d");
  canvasCtx.fillStyle = colours[c];
  canvasCtx.fillRect(x, y, 1, 1);
}

async function init() {
  
  document.getElementById("jsBeggingScreen").style.display = "none"; 
  var fadeoutElement = document.getElementById("fadeoutElement"); 
  fadeoutElement.style.backgroundColor = "rgb(0,0,0,0)";

  //var msgDialog = document.getElementById("adminDialogContainer");
  //msgDialog.style.display = "none";

  if ((await adminCheck()) == "true") {
    document.getElementById("adminPanel").style.display = "block";
  }

  establishChatConn();
  establishPixelConn();

  setTimeout(function () {
    window.scrollTo(8000, 8000);
  }, 2);
}

async function adminCheck() {
  var response = await fetch("/user/admincheck");
  var result = await response.text();
  return result;
}

async function banUser() {
  var username = document.getElementById("username");
  var requestData = new FormData();
  requestData.append("username", username.value);
  var response = await fetch("/user/banuser", {
    method: "POST",
    body: requestData,
  });
  if (!response.ok) {
    alert("Something went wrong!");
  } else {
    username.value = "";
  }
}

async function modifyUser() {
  var newName = document.getElementById("newName");
  var oldName = document.getElementById("username");
  var requestData = new FormData();
  requestData.append("oldName", oldName.value);
  requestData.append("newName", newName.value);
  var response = await fetch("/user/modifyuser", {
    method: "POST",
    body: requestData,
  });
  if (!response.ok) {
    alert("Something went wrong!");
  } else {
    username.value = "";
    newName.value = "";
  }
}

async function openMsgDialog() {
  var username = document.getElementById("username");
  var msgDialog = document.getElementById("adminDialogContainer");
  var msgListElement = document.getElementById("adminMsgList");
  var requestData = new FormData();
  var textNode;
  var messageList;

  requestData.append("username", username.value);

  var messageHistory = await fetch("/chat/getuserhistory", {
    method: "POST",
    body: requestData,
  });

  messageList = JSON.parse(await messageHistory.text());

  msgDialog.style.display = "block";

  msgListElement.innerHTML = "";

  for (var i = 0; i < messageList.length; i++) {
    textNode = document.createTextNode(
      messageList[i].slice(0, 13) + ": " + messageList[i].slice(13),
    );
    msgListElement.appendChild(textNode);
    msgListElement.appendChild(
      document.createElement("br"),
      messageBox.firstChild,
    );
  }
}

function closeMsgDialog() {
  var msgDialog = document.getElementById("adminDialogContainer");
  msgDialog.style.display = "none";
}

async function deleteByTimestamp() {
  var username = document.getElementById("username");
  var msgTimestamp = document.getElementById("msgTimestamp");
  var requestData = new FormData();
  requestData.append("username", username.value);
  requestData.append("timestamp", msgTimestamp.value);
  var response = await fetch("/chat/deletemessage", {
    method: "POST",
    body: requestData,
  });
  if (!response.ok) {
    alert("Something went wrong");
  }
}

function updateCoords(event) {
  rect = document.getElementById("canvas").getBoundingClientRect();

  posY = event.clientY - rect.top;
  posX = event.clientX - rect.left;
  posX = Math.floor(posX / 20);
  posY = Math.floor(posY / 20);
  document.getElementById("coords").innerText =
    "X: " + posX + "; Y: " + posY + ";";
}

function startTimeout(newTime){
	x = 5; // amount of seconds of timeout
	var timeoutText = document.getElementById("timeout_p");
	timeoutText.innerText = x;
	for(var i = 0; i < x; i++){
		setTimeout(function(){
			timeoutText.innerText = x;
			x -= 1;
		},1000 *i)
	}
	setTimeout(function(){
		timeoutText.innerText = "READY";
	}, 1000* x+1)
}

function countdown(){}
