var reports;

async function getReports(){
    var response = await fetch("/user/seereports");
    reports = JSON.parse(await response.text());
}

function refreshReports(){
    var reportsElement = document.getElementById("reports")
    var username;
    var description;
    console.log()
    for(var i = 0; i < reports.length; i++){
        username = document.createElement("h2");
        username.appendChild(document.createTextNode(reports[i].id + ": " + reports[i].username));
        description = document.createTextNode(reports[i].description);
        console.log(reports[i])
        
        username.innerHTML += " <button onclick='deleteReport(" + reports[i].id +  ")'>X</button>"

        reportsElement.appendChild(username);
        reportsElement.appendChild(description);
    }
}

async function deleteReport(reportID){
    console.log("deletion called");
    var requestData = new FormData();
    requestData.append("reportID", reportID);
    var response = await fetch("/user/deletereport", {
        method: "POST",
        body: requestData
    });
    if(response.ok){
        alert("YAAAAAAY");
    }
    location.reload()
}

async function init(){
    var status = await fetch("/user/status");
    status = JSON.parse(await status.text());
    if(!status.admin){
        var content = document.getElementById("container");
        content.innerHTML = "<h1 align='center'>401, you're a cunt</h1> <hr> <p align='center'> try better next time </p>";
        return
    }
    await getReports();
    refreshReports();
}