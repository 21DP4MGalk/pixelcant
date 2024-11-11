async function establishChatConn() {
  getMessages();
  var cSock = new WebSocket("/chat/messagestream");
  cSock.addEventListener("message", async (event) => {
    var msg = JSON.parse(event.data);
    var username = msg.username;
    var data = msg.data;
    if (msg.msgType == "post") {
      messages.splice(0, 0, [username, data]);
    } else if (msg.msgType == "delete") {
      for (var i = 0; i < messages.length; i++) {
        if (messages[i][0] == username && messages[i][1] == data) {
          messages.splice(i, 1);
        }
      }
    } else if (msg.msgType == "namechange") {
      if (sessionStorage.getItem("username") == username) {
        alert("Your name was changed! Your new name is " + data);
        sessionStorage.setItem("username", data);
      }
      for (var i = 0; i < messages.length; i++) {
        if (messages[i][0] == username) {
          messages[i][0] = data;
        }
      }
    }
    refreshMessages();
  });
  var pingMessages = [
    "AAAAAAAAAAAA OH GOD HELP",
    "AAAAA IT BURNS IT BURNS AAA",
    "OH FUCK PLEASE HELP SAVE OUR SOULS PLEASE",
    "...---...   ...---.../",
    "MAYDAY MAYDAY WE ARE GOING DOWN",
    "HI MY NAME IS JERRY WHY IS EVERYONE SCREAMING",
  ];
  setInterval(() => {
    cSock.send(
      pingMessages[Math.floor(Math.random * (pingMessages.length - 1))],
    );
  }, 45000);
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
