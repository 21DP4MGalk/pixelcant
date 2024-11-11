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

  async function openUserCanvas(){
	var username = document.getElementById("username");
	var userCanvasScreen = document.getElementById("userCanvasScreen");
	var userCanvas = document.getElementById("userCanvas");
	
	var userCanvasCtx = userCanvas.getContext("2d");
  userCanvasCtx.fillStyle = "#fff";
  userCanvasCtx.fillRect(0, 0, 1000, 1000);

	var requestData = new FormData();
	requestData.append("username", username.value);

	var response = await fetch("canvas/getusercanvas", {
		method: "POST",
		body: requestData
	});
	
	var userPixels = await response.json();

	for (var i = 0; i < userPixels.length; i++) {
  		userCanvasCtx.fillStyle = colours[userPixels[i].c];
  		userCanvasCtx.fillRect(userPixels[i].x, userPixels[i].y, 1, 1);
	}

	userCanvasScreen.style.display = "block";
}

function closeUserCanvas(){
	var userCanvasScreen = document.getElementById("userCanvasScreen");
	userCanvasScreen.style.display = "none";
}
