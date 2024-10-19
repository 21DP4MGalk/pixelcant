let stepsCompleted = 0;
const totalSteps = document.querySelectorAll('.step').length;
const progressBar = document.getElementById('progress-bar');

// Function to complete a step
function completeStep(stepIndex) {
    if (!document.querySelectorAll('.step')[stepIndex].classList.contains('completed')) {
        stepsCompleted++;
        progressBar.style.width = (stepsCompleted / totalSteps) * 100 + '%';
        
        // Mark the step as completed
        document.querySelectorAll('.step')[stepIndex].classList.add('completed');
        updateCheckmarks(stepIndex);
        
        // Check if all steps are completed
        if (stepsCompleted === totalSteps) {
            alert('Congratulations! You have completed all the steps.');
            celebrate(); // Trigger confetti celebration
            disableSteps();
        }
    }
}

// Function to update checkmarks
function updateCheckmarks(stepIndex) {
    const steps = document.querySelectorAll('.step');
    const checkmark = document.createElement('span');
    checkmark.textContent = ' ✔️';
    
    steps[stepIndex].querySelector('h3').appendChild(checkmark);
}

// Function to celebrate with confetti
function celebrate() {
    const duration = 2 * 1000; // Duration in milliseconds
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        gravity: 1,
        scalar: 1,
        colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb']
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return; // Stop the animation when duration is over
        const particleCount = 50 * (timeLeft / duration); // Calculate particle count based on remaining time
        confetti(Object.assign({}, defaults, { particleCount: Math.floor(particleCount) }));
        requestAnimationFrame(frame);
    })();
}

// Function to disable further clicking
function disableSteps() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.style.pointerEvents = 'none'; // Disable clicking
        step.style.opacity = '0.5'; // Change opacity for visual effect
    });
}

// Add click event listeners to each step
document.querySelectorAll('.step').forEach((step, index) => {
    step.addEventListener('click', () => completeStep(index));
});
