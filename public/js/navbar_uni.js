async function logout(){
    await fetch("/auth/logout");
    alert("Logged out.");
}
