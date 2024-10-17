var colour = "#000000";
var messages = [[]];
colours = ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)", "rgb(255, 255, 0)", "rgb(255, 0, 255)", "rgb(0, 255, 255)", "rgb(255, 255, 255)", "rgb(00, 0, 0)", "rgb(153, 170, 187)", "rgb(1, 50, 32)"];

async function interpretClick(){
	const canvas = document.getElementById("canvas");
	const canvasCtx = canvas.getContext("2d");
	var rect = canvas.getBoundingClientRect();
	var c = 0;

	for(var i = 0; i < 8; i++){
		console.log(colours[i])
		console.log(colour)
		if(colours[i] == colour){
			console.log("FOUNDIT")
			c = i;
		}
	}
	console.log(c);

	posY = event.clientY - rect.top;
	posX = event.clientX - rect.left;
	posY = posY - posY%20;
	posX = posX - posX%20;
	
	var response = await fetch("/canvas/placepixel", {
		method: "POST",
		body: JSON.stringify({ x: (posX/20), y: (posY/20), c: c })
	});
	if(response.ok){
		canvasCtx.fillStyle = colour;
		canvasCtx.fillRect(posX, posY, 20, 20);
	}
}

function updateColour(){
	var selection = document.querySelectorAll(":hover"); 
	selection = selection[selection.length-1]; 
	colour = window.getComputedStyle(selection).backgroundColor;
}

async function establishPixelConn(){
	var p_sock = new WebSocket("/canvas/updatestream");
	getCanvas();
	p_sock.addEventListener("message", (event) => {
		var newPixel = event.data;
		newPixel = JSON.parse(event.data);
		drawPixel(newPixel.x, newPixel.y, newPixel.c);
	});
}

async function establishChatConn(){
	getMessages();
	var c_sock = new WebSocket("/chat/messagestream");
	c_sock.addEventListener("message", (event) => {
		var fullMsg = event.data;
		var usernameLen = parseInt(fullMsg.slice(0,1));
		
		if(fullMsg.slice(2,3) == ";"){
			usernameLen = usernameLen * 10;
			usernameLen = usernameLen + parseInt(fullMsg.slice(1,2));
			console.log(usernameLen)
			var username = fullMsg.slice(3, 3+usernameLen);
			var message = fullMsg.slice(3+usernameLen);
		} 
		else{
			var username = fullMsg.slice(2, 2+usernameLen); 
			var message = fullMsg.slice(2+usernameLen);
		}

		messages.splice(0, 0, [username, message] );
		refreshMessages();
	});

}

async function getMessages(){
	const response = await fetch("/chat/getmessages");
	messages = JSON.parse(await response.text());
	refreshMessages();	
}

function refreshMessages(){
	var messageBox = document.getElementById("messageBox");
	messageBox.innerHTML = "";
	for(let i = 0; i < messages.length; i++){
		
		if(messages[i][0] == ""){
			break;
		}
		textNode = document.createTextNode(messages[i][0] + " : " + messages[i][1]);
		messageBox.insertBefore(document.createElement("br"), messageBox.firstChild);
		messageBox.insertBefore(textNode, messageBox.firstChild);
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


	const response = await fetch("/chat/postmessage", {
		method: "POST",
		body: messageData
	});
	if(response.ok){
		document.getElementById("textInput").value = "";
	}
}

function keyPress(event) {
    if(event.keyCode == 13){
		sendMessage();
	}
}

async function getCanvas(){
	pixelsY = window.screen.width / 20;
	pixelsX = window.screen.height / 20;

	var response = await fetch("canvas/fullcanvas/0/0/819/819"); // + (pixelsX+50).toString() + "/" + (pixelsY+50).toString());
	var screenPixels = await response.json();
	for(var i = 0; i < screenPixels.length; i++){
		drawPixel(screenPixels[i].x, screenPixels[i].y, screenPixels[i].c);
	}
}

function drawPixel(x,y,c){
	const canvas = document.getElementById("canvas");
	const canvasCtx = canvas.getContext("2d");
	canvasCtx.fillStyle = colours[c];
	canvasCtx.fillRect(x*20, y*20, 20, 20);
}

function init(){
	
	establishChatConn();
	establishPixelConn();
	setTimeout(function () {
		window.scrollTo(8000, 8000);
	},2);

}