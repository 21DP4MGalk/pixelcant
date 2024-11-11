async function sendReport() {
  var username = document.getElementById("username");
  var description = document.getElementById("description");

  var requestData = new FormData();
  requestData.append("username", username.value);
  requestData.append("description", description.value);

  if (username.value == "") {
    alert(
      "A username is obligatory for us to ban or take some kind of action.",
    );
    return;
  }
  if (description.value == "") {
    alert("Come on, surely you can at least tell us what they did.");
    return;
  }
  if (description.value.length > 500) {
    alert("Not this verbosely");
    return;
  }
  if (username.value.length > 16) {
    alert("Such a username cannot exist");
    return;
  }
  var response = await fetch("/user/reportuser", {
    method: "POST",
    body: requestData,
  });

  if (!response.ok) {
    alert("Error!" + (await response.text()));
    return;
  }
  alert("Your report was succesful, now scram");
}
