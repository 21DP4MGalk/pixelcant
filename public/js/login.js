// Listen for form submission
document.querySelector('form').addEventListener('submit', submitLoginForm);

// Function to handle form submission
async function submitLoginForm(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if fields are empty
    if (username === '' || password === '') {
        alert('Please fill in all fields!');
        return; // Exit the function if fields are empty
    }

    // Create FormData object
    const loginInfo = new FormData();
    loginInfo.append("username", username);
    loginInfo.append("password", password);

    try {
        // Send a POST request to the server
        const response = await fetch("auth/login", {
            method: "POST",
            body: loginInfo
        });

        if (!response.ok) {
            // Handle error response
            alert('Login failed. Please check your credentials.');
            return;
        }

        // Successful login, start confetti animation
        startConfetti();

        // Stop confetti after 3 seconds and redirect
        setTimeout(function() {
            stopConfetti(); // Stop confetti animation
            window.location.href = "index.html"; // Redirect to the main page
        }, 3000); // Перенаправление происходит через 3 секунды после успешного входа
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Confetti animation functions
let animationFrameId; // Variable to store animation ID

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
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
}
