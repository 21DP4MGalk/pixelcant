function interpretClick(){
	const canvas = document.getElementById("canvas");
	const canvasCtx = canvas.getContext("2d");
	var rect = canvas.getBoundingClientRect();
	
	posY = event.clientY - rect.top;
	posX = event.clientX - rect.left;
	posY = posY - posY%20;
	posX = posX - posX%20;
	//posX = Math.floor(posX / 100);
	//posY = Math.floor(posY / 100);
		
	canvasCtx.fillStyle = getColorSelection();
	canvasCtx.fillRect(posX, posY, 20, 20);
}
function getColorSelection(){
	const selection = document.getElementById("color");
	
	return selection.value;
}
