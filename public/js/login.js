async function sendLoginForm(){
    
    var loginForm = new FormData();



    const response = await fetch("auth/login", {
        method: "POST",
        body: loginForm
    });
}