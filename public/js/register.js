document.getElementById('registrationForm').addEventListener('submit', submitRegistrationForm);

async function submitRegistrationForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Проверка на совпадение паролей
    if (password !== confirmPassword) {
        //errorMessage.textContent = 'Passwords do not match. Please check!';
        //errorMessage.style.color = 'red';
    } else {
        var registrationInfo = new FormData();
        registrationInfo.append("username", username);
        registrationInfo.append("password", password);
        console.log(username);
        console.log(registrationInfo.get("username"));

        const response = await fetch("auth/register", {
            method: "POST",
            body: registrationInfo
        });

        if (!response.ok) {
            //errorMessage.textContent = 'Something went wrong.';
        }
    }
}

document.getElementById("RegisterButton").addEventListener("click", function(event) {
    event.preventDefault();
    startConfetti();
    
    // Остановка конфетти через 3 секунды и перенаправление
    setTimeout(function() {
        stopConfetti(); // Остановка анимации конфетти
        window.location.href = "index.html"; // Перенаправление на главную страницу
    }, 2000);
});

let animationFrameId; // Переменная для хранения ID анимации

function startConfetti() {
    const canvas = document.getElementById("confettiCanvas");
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
            tiltAngle: 0
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
                    tilt: Math.random() * 10 - 10
                };
            }

            ctx.beginPath();
            ctx.lineWidth = confetti.r / 2;
            ctx.strokeStyle = confetti.color;
            ctx.moveTo(confetti.x + confetti.tilt + confetti.r / 4, confetti.y);
            ctx.lineTo(confetti.x + confetti.tilt, confetti.y + confetti.tilt + confetti.r / 4);
            ctx.stroke();
        });

        animationFrameId = requestAnimationFrame(drawConfetti);
    }

    drawConfetti();
}

function stopConfetti() {
    cancelAnimationFrame(animationFrameId);
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст
}