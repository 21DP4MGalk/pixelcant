function hideDisclaimer(){
	var disclaimer = document.getElementById("disclaimer");
	var hideDisclaimer = document.getElementById("hideDisclaimer");
	disclaimer.style.backgroundColor = "rgb(0, 0, 0, 0)";
	hideDisclaimer.style.display = "none";

	setTimeout(function(){
		disclaimer.style.display = "none";
	}, 1000)
}

async function getInfo(){
	var response = await fetch("/user/status");
	var user = JSON.parse(await response.text());
	
	var nameElement = document.getElementById("currentName");
	var adminElement = document.getElementById("currentAdmin");
	var bannedElement = document.getElementById("currentBanned");
	var nameField = document.getElementById("nameField");

	nameElement.innerText += user.username
	adminElement.innerText += user.admin
	bannedElement.innerText += user.banned
	nameField.value = user.username

	updateUserMessage(user.username, user.admin, user.banned);
}

async function submitNameChange(){
	var newName = document.getElementById("nameField");
	var password = document.getElementById("nameChangePass");
	
	if(nameField.value == ""){
		alert("Please enter some name!");
		return;
	}
	if(password.value == ""){
		alert("Please enter a password first!");
		return;
	}

	await submitChanges(newName.value, password.value);

}

async function submitPassChange(){
	var oldPass = document.getElementById("oldPass");
	var newPass = document.getElementById("newPass");
	var confirmPass = document.getElementById("confirmPass");

	if(oldPass.value == "" || newPass.value == "" || confirmPass.value == ""){
		alert("Please fill out all the fields!");
		return;
	}

	await submitChanges(newPass.value, oldPass.value, true, confirmPass.value);

}

async function submitChanges(newData, password, isPass = false, confirmPass = password){
		
	console.log(newData, password, isPass, confirmPass)
	if(isPass && confirmPass != newData){
		alert("Passwords are different! RETYPE pls");
		return;
	}
	requestData = new FormData();
	requestData.append("password", password);
	requestData.append("newData", newData);
	requestData.append("isPass", isPass);
	
	var response = await fetch("/user/modifyself", {
		method: "POST",
		body: requestData
	});


	if(!response.ok){
		alert("Something went wrong" + response.text());
		return
	}
	alert("IT WORKED YAYE");
}

function updateUserMessage(username, admin, banned){
	console.log(username, admin, banned)
	var userMessage = document.getElementById("userMessage");
	if(!admin && !banned){
		userMessage.innerText = "Not banned yet, an impressive achievement! \nKeep it up, or else.";
	}
	else if(banned && !admin){
		userMessage.innerText = "Wether you drew swastikas or \nadvocated for raisin enjoyer genocide, \nthe ban was probably earned. \nUnless we did \nit for fun.\nFun fact: there's no way to get unbanned";
	}
	else if(banned && admin){
		userMessage.innerText = "You cheeky debugging bastard, enjoy this clipping text, I'm not placing newlines, you're not my dad";
	}
	else if(!banned && admin){
		userMessage.innerText = "One of our famously GOODtm \nadministrators, the backbone of the \nsystem and the fabric of this \nlocalized reality. \nStill bald though";
	}
}
