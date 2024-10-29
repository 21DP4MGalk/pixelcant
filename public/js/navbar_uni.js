async function logout() {
  await fetch("/auth/logout");
  checkStatus();
}

async function checkStatus() {
  let resp = await fetch("/user/status");
  const logoutElement = document.getElementById("navLogout");
  const loginElement = document.getElementById("navLogin");
  const registerElement = document.getElementById("navRegister");
  const usernameMsg = document.getElementById("usernameMsg");
  if (!resp.ok) {
    logoutElement.style.display = "none";
    loginElement.style.display = "initial";
    registerElement.style.display = "initial";
    usernameMsg.innerText = "";
    return;
  }
  logoutElement.style.display = "initial";
  loginElement.style.display = "none";
  registerElement.style.display = "none";
  let status = JSON.parse(await resp.text());
  let greeting = "";
  if (status.banned) {
    greeting = "ew, ";
  } else if (status.admin) {
    greeting = "HELLO, you're bald, ";
  } else {
    greeting = "WELCOME, HIGHLY REGARDED ";
  }
  usernameMsg.innerText = greeting + status.username + "!";
}

checkStatus();
