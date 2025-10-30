document.addEventListener('DOMContentLoaded', () => {
    // Defined a specific set of distinct colors (using hex for precision)
    const COLORS = ['#FF0000', '#0000FF', '#008000', '#FFFF00', '#800080', '#FFA500']; // Red, Blue, Green, Yellow, Purple, Orange
    const DURATION = 60; // Game duration in seconds

    const startButton = document.getElementById('startButton');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const feedback = document.getElementById('feedback');
    const gameArea = document.getElementById('game-area'); 
    const boxA = document.getElementById('boxA');
    const boxB = document.getElementById('boxB');
    const sameButton = document.getElementById('sameButton');
    const differentButton = document.getElementById('differentButton');

    let score = 0;
    let timeLeft = DURATION;
    let gameActive = false;
    let currentMatch = false; // True if BoxA and BoxB colors are the same
    let timerInterval = null;

    // --- Core Game Functions ---

    function getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    function generateTrial() {
        if (!gameActive) return;

        // 50/50 chance for same or different colors
        currentMatch = Math.random() < 0.5; 
        
        const color1 = getRandomColor();
        let color2;

        if (currentMatch) {
            color2 = color1;
        } else {
            do {
                color2 = getRandomColor();
            } while (color2 === color1);
        }

        // Apply colors to the boxes
        boxA.style.backgroundColor = color1;
        boxB.style.backgroundColor = color2;

        // Clear previous feedback and reset any animation
        feedback.textContent = '';
        feedback.classList.remove('correct', 'incorrect');
    }

    function handleResponse(isSame) {
        if (!gameActive) return;

        let isCorrect = (isSame === currentMatch);
        
        if (isCorrect) {
            // Reward: +1 point
            score++;
            feedback.textContent = 'Correct! (+1)';
            feedback.classList.add('correct');
        } else {
            // PENALTY: -1 point
            score--; 
            feedback.textContent = 'Incorrect! (-1)';
            feedback.classList.add('incorrect');
        }
        
        scoreDisplay.textContent = score;

        // Move to the next trial after a brief moment for feedback
        // Disable buttons briefly to prevent spamming
        sameButton.disabled = true;
        differentButton.disabled = true;
        setTimeout(() => {
            if (gameActive) {
                generateTrial();
                sameButton.disabled = false;
                differentButton.disabled = false;
            }
        }, 300); // Short delay (0.3 seconds)
    }

    function startGame() {
        if (gameActive) return;

        // Reset game state
        score = 0;
        timeLeft = DURATION;
        gameActive = true;
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timeLeft;
        feedback.textContent = ''; 

        // Show game elements and disable start button
        gameArea.classList.remove('hidden'); 
        startButton.disabled = true;
        sameButton.disabled = false;
        differentButton.disabled = false;

        // Start timer and first trial
        timerInterval = setInterval(updateTimer, 1000);
        generateTrial();
    }

    function updateTimer() {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        startButton.disabled = false;
        sameButton.disabled = true;
        differentButton.disabled = true;

        // Hide game elements
        gameArea.classList.add('hidden');
        
        // Final score message
        feedback.textContent = `Time's Up! Final Score: ${score} points.`;
        feedback.classList.add('correct'); 
	
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    sameButton.addEventListener('click', () => handleResponse(true));
    differentButton.addEventListener('click', () => handleResponse(false));

    // Initially hide game area, show start button
    gameArea.classList.add('hidden'); 
    sameButton.disabled = true;
    differentButton.disabled = true;
});