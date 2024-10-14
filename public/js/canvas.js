var colour = "#000000";

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
