// Handling the login form
//document.querySelector('form').addEventListener('submit', submitLoginForm);

async function submitLoginForm(event) {
  //event.preventDefault(); // Prevents default form submission

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  if (username === "" || password === "") {
    errorMessage.textContent = "Please fill in all fields.";
    return;
  }
    // Here we handle login logic, such as sending a request to the server
    var requestData = new FormData();
    requestData.append("username", username);
    requestData.append("password", password);
    var response = await fetch("/auth/login", {
      method: "POST",
      body: requestData,
    });

    if (!response.ok) {
      errorMessage.textContent = await response.text();
      return;
    }
    startConfetti();
    document.getElementById("container").style.display = "none";
    setTimeout(function () {
      window.location.replace("/canvas.html");
    }, 2000);
}
/*document.getElementById("signInButton").addEventListener("click", function(event) {
    event.preventDefault();
    startConfetti();
});
*/
function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  canvas.style.display = "initial";
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 300;
  const confettis = [];

  for (let i = 0; i < confettiCount; i++) {
    confettis.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * confettiCount,
      color: randomColor(),
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
    });
  }

  function randomColor() {
    const colors = ["#FFC107", "#FF3D00", "#4CAF50", "#03A9F4", "#E91E63"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettis.forEach((confetti, index) => {
      confetti.tiltAngle += confetti.tiltAngleIncremental;
      confetti.y += (Math.cos(confetti.d) + 3 + confetti.r / 2) / 2;
      confetti.x += Math.sin(confetti.d);
      confetti.tilt = Math.sin(confetti.tiltAngle) * 15;

      if (confetti.y > canvas.height) {
        confettis[index] = {
          ...confetti,
          x: Math.random() * canvas.width,
          y: -10,
          tilt: Math.random() * 10 - 10,
        };
      }

      ctx.beginPath();
      ctx.lineWidth = confetti.r / 2;
      ctx.strokeStyle = confetti.color;
      ctx.moveTo(confetti.x + confetti.tilt + confetti.r / 4, confetti.y);
      ctx.lineTo(
        confetti.x + confetti.tilt,
        confetti.y + confetti.tilt + confetti.r / 4,
      );
      ctx.stroke();
    });

    requestAnimationFrame(drawConfetti);
  }

  drawConfetti();
}
