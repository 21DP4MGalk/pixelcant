async function sendReport(){
	var username = document.getElementById("username");
	var description = document.getElementById("description");
	
	var requestData = new FormData();
	requestData.append("useruname", username.value);
	requestData.append("description", description.value);

	if(username.value == ""){
		alert("A username is obligatory for us to ban or take some kind of action.");
		return;
	}
	if(description.value == ""){
		alert("Come on, surely you can at least tell us what they did.");
		return;
	}

	var response = await fetch("/user/resportuser", {
		method: "POST",
		body: requestData
	});
	
	if(!response.ok){
		alert("Error!" + await response.text());
		return;
	}
	alert("Your report was succesfully ignoed");
}
