var colour = "#FF0000";			 // Globally accessible colour set by the user. Defaults to black for convenience.
var messages = [[]];			/* A two dimensional array for storing messages. With [x][y], x signifies the order (most recent one at 0)
							      and y signifies the data, 0 is username, 1 is message. Magic numbers! */
colours = ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)", "rgb(255, 255, 0)", "rgb(255, 0, 255)", "rgb(0, 255, 255)", "rgb(255, 255, 255)", "rgb(00, 0, 0)", "rgb(153, 170, 187)", "rgb(1, 50, 32)"];
// Stores all the colours available as a pallet. Could be updated, should be updated. 


async function interpretClick(){			/* Function for gathering and sending all necessary information for placing pixels.
	Gets the colour in int form, saves the cursor coordinates at the time of the click. Sends a request to /canvas/placepixel and
	draws the pixels once the response is recieved and confirmed to be okay. */
	const canvas = document.getElementById("canvas");
	const canvasCtx = canvas.getContext("2d");
	var rect = canvas.getBoundingClientRect();
	var c = 0;

	posY = event.clientY - rect.top;
	posX = event.clientX - rect.left;
	posY = posY - posY%20;			// one database pixel corresponds to 20 screen pixels, we wouldn't want to place 1x1 pixels manually.
	posX = posX - posX%20;
	
	for(var i = 0; i < 8; i++){			// for determining the int associated with the colour
		console.log(colours[i])
		console.log(colour)
		if(colours[i] == colour){
			c = i;
		}
	}

	var response = await fetch("/canvas/placepixel", {
		method: "POST",
		body: JSON.stringify({ x: (posX/20), y: (posY/20), c: c })			// the endpoint recieves 3 variables - x, y and c. Not sure why it's not an object
	});

	if(response.ok){			// probably replace it with drawPixel once you're not too lazy
		canvasCtx.fillStyle = colour;
		canvasCtx.fillRect(posX, posY, 20, 20);
	}
}

function updateColour(){			// gets the colour straight from the parameters in the element by checking what the mouse is hovering over
	var selection = document.querySelectorAll(":hover"); 
	selection = selection[selection.length-1]; 
	colour = window.getComputedStyle(selection).backgroundColor;
}

async function establishPixelConn(){			// establishes a websocket connection for the pixels, does not close ever, need to discard on server side
	var p_sock = new WebSocket("/canvas/updatestream");
	getCanvas();			// gets the canvas, as it is only called once and we need some pixels loaded in at first
	p_sock.addEventListener("message", (event) => {
		var newPixel = event.data;
		newPixel = JSON.parse(event.data);
		drawPixel(newPixel.x, newPixel.y, newPixel.c);
	});
}

async function establishChatConn(){			// establishes connection to chat websocket, does not close either
	getMessages();			// gets the most recent 25 messages so the chat is not empty
	var c_sock = new WebSocket("/chat/messagestream");
	c_sock.addEventListener("message", (event) => {
		var fullMsg = event.data;
		var usernameLen = parseInt(fullMsg.slice(0,1));		// gets the first character, part of the info about username length
		
		if(fullMsg.slice(1,2) != ";"){		// if the second character is not the seperator, then the username is longer than 9 characters
										   // meaning we need to change where the reading of the username and the message starts and ends
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

		messages.splice(0, 0, [username, message] );	// splice with (0, 0) parameters inserts the value into the beginning, which is necessary
													   // as our content is flipped, for the convenience of having the scrollbar at the bottom.
		refreshMessages();			// update the UI to match the changes in the messages array 
	});

}

async function getMessages(){			// updates the messages array with the 25 of the most recent ones stored in the databse
	const response = await fetch("/chat/getmessages");
	messages = JSON.parse(await response.text());
	refreshMessages();	
}

function refreshMessages(){			// updates the UI to match the array
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

async function sendMessage(){			// Gets the necessary data and builds the request to post a message in chat. Capped at 300 chars.
	var message = document.getElementById("textInput");
	message = message.value;
	if(message.length > 300){
		alert("Message length above 300, be more concise");			// Replace with a popup if time allows, alerts are fugly
		return;
	}
	var messageData = new FormData();
	
	messageData.append("message", message);

	const response = await fetch("/chat/postmessage", {
		method: "POST",
		body: messageData
	});

	if(response.ok){
		document.getElementById("textInput").value = "";			// clear what you wrote if everything went well
	}
}

function keyPress(event) {			// For allowing the user to just press enter when typing a message instead of having to mouse over the "send" button
    if(event.keyCode == 13){			// 13 is the code for the enter key
		sendMessage();
	}
}

async function getCanvas(){			// Currently fetches the entire canvas, horrible idea, but works for now
	pixelsY = window.screen.width / 20;			// Gets the screen width and height in database pixels so we know how many to ask for
	pixelsX = window.screen.height / 20;

	var response = await fetch("canvas/fullcanvas/0/0/819/819"); // + (pixelsX+50).toString() + "/" + (pixelsY+50).toString());
	var screenPixels = await response.json();
	for(var i = 0; i < screenPixels.length; i++){			// draw all recieved pixels
		drawPixel(screenPixels[i].x, screenPixels[i].y, screenPixels[i].c);
	}
}

function drawPixel(x,y,c){			// name is self explanatory, draws the required pixels, takes in database pixels and integer colours
	const canvas = document.getElementById("canvas");
	const canvasCtx = canvas.getContext("2d");
	canvasCtx.fillStyle = colours[c];
	canvasCtx.fillRect(x*20, y*20, 20, 20);
}

async function init(){			// function for use in onload parameter, just starts everything and moves the user to the middle of the canvas
	
	document.getElementById("jsBeggingScreen").style.display = "none";
	var fadeoutElement = document.getElementById("fadeoutElement")
	fadeoutElement.style.backgroundColor = "rgb(0,0,0,0)";

	var msgDialog = document.getElementById("adminDialogContainer");
	msgDialog.style.display = "none";
	
	if(await adminCheck() == "false"){
		document.getElementById("adminPanel").style.display = "none";
	}

	establishChatConn();
	establishPixelConn();

	setTimeout(function () {
		window.scrollTo(8000, 8000);
	},2);

	
}

async function adminCheck(){
	var response = await fetch("/user/admincheck");
	var result = await response.text();
	return result;
}

async function banUser(){
	var username = document.getElementById("username");
	var requestData = new FormData();
	requestData.append("username", username.value);
	var response = await fetch("/user/banuser",{
		method: "POST",
		body: requestData
	})
	if(!response.ok){
		alert("Something went wrong!");
	}
	else{
		username.value = "";
	}
}

async function modifyUser(){
	var newName = document.getElementById("newName");
	var oldName = document.getElementById("username");
	var requestData = new FormData();
	requestData.append("oldName", oldName.value);
	requestData.append("newName", newName.value);
	var response = await fetch("/user/modifyuser",{
		method: "POST",
		body: requestData
	});
}

async function openMsgDialog(){
	var username = document.getElementById("username");
	var msgDialog = document.getElementById("adminDialogContainer");
	var msgListElement = document.getElementById("adminMsgList");
	var requestData = new FormData();
	var textNode;
	var messageList;

	requestData.append("username", username.value);
	
	var messageHistory = await fetch("/chat/getuserhistory", {
		method: "POST",
		body: requestData
	});
	
	messageList = JSON.parse(await messageHistory.text());
	
	msgDialog.style.display = "block";

	for(var i = 0; i < messageList.length; i++){
		textNode = document.createTextNode(messageList[i].slice(0,13) + ": " + messageList[i].slice(13))
		msgListElement.appendChild(textNode);
		msgListElement.appendChild(document.createElement("br"), messageBox.firstChild);
	}
}

function closeMsgDialog(){
	var msgDialog = document.getElementById("adminDialogContainer");
	msgDialog.style.display = "none";
}

async function deleteByTimestamp(){
	var username = document.getElementById("username");
	var msgTimestamp = document.getElementById("msgTimestamp");
	var requestData = new FormData();
	requestData.append("username", username.value);
	requestData.append("timestamp", msgTimestamp.value);
	var response = await fetch("/chat/deletemessage",{
		method: "POST",
		body: requestData
	});
	if(!response.ok){
		alert("Something went wrong");
	}
}