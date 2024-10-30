username = ""
admin = false;
banned = false;

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
}

async function submitNameChange(){
	var newName = document.getElementById("nameField");
	var password = document.getElementById("nameChangePass");
	
	await submitChanges(newName.value, password.value);

}

async function submitPassChange(){
	var oldPass = document.getElementById("oldPass");
	var newPass = document.getElementById("newPass");
	var confirmPass = document.getElementById("confirmPass");

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
