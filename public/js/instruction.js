let stepsCompleted = 0;
const totalSteps = document.querySelectorAll('.step').length;
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');

// Set initial visibility and percentage
progressPercent.textContent = '0%';

// Function to toggle step completion
function toggleStep(stepIndex) {
    const stepElement = document.querySelectorAll('.step')[stepIndex];

    if (!stepElement.classList.contains('completed')) {
        // Mark the step as completed
        stepsCompleted++;
        stepElement.classList.add('completed');
        updateCheckmarks(stepIndex);
    } else {
        // Remove the step completion
        stepsCompleted--;
        stepElement.classList.remove('completed');
        removeCheckmarks(stepIndex);
    }

    // Update progress bar and percentage
    const progress = (stepsCompleted / totalSteps) * 100;
    progressBar.style.width = progress + '%';
    progressPercent.textContent = Math.round(progress) + '%';

    // If all steps are completed, show the modal and block further interactions
    if (stepsCompleted === totalSteps) {
        openModal(); // Trigger modal display
        blockSteps(); // Disable further step interactions
    }
}

// Function to update checkmarks
function updateCheckmarks(stepIndex) {
    const stepTitle = document.querySelectorAll('.step')[stepIndex].querySelector('h3');
    let checkmark = stepTitle.querySelector('.checkmark');
    
    if (!checkmark) {
        checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.textContent = ' ✔️';
        stepTitle.appendChild(checkmark);
    }
}

// Function to remove checkmarks
function removeCheckmarks(stepIndex) {
    const stepTitle = document.querySelectorAll('.step')[stepIndex].querySelector('h3');
    const checkmark = stepTitle.querySelector('.checkmark');

    if (checkmark) {
        stepTitle.removeChild(checkmark);
    }
}

// Function to open the modal
function openModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex'; // Show the modal with flex to center content
}

// Function to close the modal and start the confetti
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    celebrate(); // Trigger confetti celebration when the modal is closed
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

// Function to block further step interactions
function blockSteps() {
    document.querySelectorAll('.step').forEach(step => {
        step.removeEventListener('click', step._toggleStepHandler);
    });
}

// Add click event listeners to each step
document.querySelectorAll('.step').forEach((step, index) => {
    const handler = () => toggleStep(index);
    step._toggleStepHandler = handler; // Store reference to the handler for later removal
    step.addEventListener('click', handler);
});
