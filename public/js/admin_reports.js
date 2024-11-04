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
        reportsElement.appendChild(username);
        reportsElement.appendChild(description);
    }
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