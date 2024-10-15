var colour = "#000000";
var messages = [];

function interpretClick(){
	const canvas = document.getElementById("canvas");
	const canvasCtx = canvas.getContext("2d");
	var rect = canvas.getBoundingClientRect();
	
	posY = event.clientY - rect.top;
	posX = event.clientX - rect.left;
	posY = posY - posY%20;
	posX = posX - posX%20;
	
	//send request to websocket, if it works and returns true then continue

	canvasCtx.fillStyle = colour;
	canvasCtx.fillRect(posX, posY, 20, 20);
}

function updateColour(){
	var selection = document.querySelectorAll(":hover"); 
	selection = selection[selection.length-1]; 
	colour = window.getComputedStyle(selection).backgroundColor;
}

async function startMessageFetching(){
	setInterval(await getMessages(), 5000);
}

async function getMessages(){
	var messageBox = document.getElementById("messageText");
	var text = "";
	const response = await fetch("chat/getmessages");
	messages = JSON.parse(await response.text());
	for(let i = 0; i < messages.length; i++){
		if(messages[i][0] == ""){
			break;
		}
		text = "<b>" + messages[i][0] + "<b> : " + messages[i][1];
		messageBox.innerHTML = text + "<br><br>";
	}
}

async function sendMessage(){
	var message = document.getElementById("textInput");
	message = message.value;
	if(message.length > 300){
		alert("Message length above 300, be more concise");
		return;
	}
	var messageData = new FormData();
	
	messageData.append("message", message);


	const response = await fetch("chat/postmessage", {
		method: "POST",
		body: messageData
	});

}