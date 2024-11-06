async function establishChatConn() {
    getMessages(); 
    var cSock = new WebSocket("/chat/messagestream");
    cSock.addEventListener("message", (event) => {
      /*var fullMsg = event.data;
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
      //messages.push([username, message]);
      */
     
      var msg = JSON.parse(event.data);
      var username = msg.username;
      var data = msg.data;
      if(msg.msgType == "post"){
        messages.splice(0, 0, [username, data]); 
      }
      else if(msg.msgType == "delete"){
        for(var i = 0; i < messages.length; i++){
          if(messages[i][0] == username && messages[i][1] == data){
            messages.splice(i, 1)
          }
        }
      }
      else if(msg.msgType == "namechange"){
        if(sessionStorage.getItem("username") == username){
          alert("Your name was changed! Your new name is " + data);
          sessionStorage.setItem("username", data)
        }
        for(var i = 0; i < messages.length; i++){
          if(messages[i][0] == username){
            messages[i][0] = data;
          }
        }
      }
      refreshMessages(); 
    });
  }
  
  async function getMessages() {
    const response = await fetch("/chat/getmessages");
    messages = JSON.parse(await response.text());
    console.log(messages)
    refreshMessages();
  }
  
  function refreshMessages() {
    var messageBox = document.getElementById("messageBox");
    messageBox.innerHTML = "";
    for (let i = 0; i < messages.length; i++) {
      if (messages[i][0] == "") {
        continue;
      }
      textNode = document.createTextNode(messages[i][0] + ": " + messages[i][1]);
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