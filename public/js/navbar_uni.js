async function logout(){
    await fetch("/auth/logout");
}