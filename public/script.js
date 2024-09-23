const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Логика отправки данных на сервер
  console.log("Username:", username);
  console.log("Password:", password);

  // Эффект после входа (например, сообщение)
  alert("Welcome, " + username + "!");
});
