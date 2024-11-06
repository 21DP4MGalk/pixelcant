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
  var pSock = new WebSocket("/canvas/updatestream");
  getCanvas();
  pSock.addEventListener("message", (event) => {
    var newPixel = event.data;
    newPixel = JSON.parse(event.data);
    drawPixel(newPixel.x, newPixel.y, newPixel.c);
  });
  var pingMessages = ["AAAAAAAAAAAA OH GOD HELP", "AAAAA IT BURNS IT BURNS AAA", "OH FUCK PLEASE HELP SAVE OUR SOULS PLEASE", "...---...   ...---.../", "MAYDAY MAYDAY WE ARE GOING DOWN", "HI MY NAME IS JERRY WHY IS EVERYONE SCREAMING"];
  setInterval(() => {
    pSock.send(pingMessages[ Math.floor(Math.random*(pingMessages.length-1)) ]);
  }, 45000)
}

async function getCanvas() {
  //pixelsY = window.screen.width / 20; 
  //pixelsX = window.screen.height / 20;

  var response = await fetch("canvas/fullcanvas/0/0/1000/1000");
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
  
  if ((await adminCheck()) == "true") {
    document.getElementById("adminPanel").style.display = "block";
  }

  establishChatConn();
  establishPixelConn();

  setTimeout(function () {
    window.scrollTo(10000, 10000);
  }, 2);
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
	var timeoutText = document.getElementById("timeout_p");  // ( ͡° ͜ʖ ͡°)
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

