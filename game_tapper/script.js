document.addEventListener('DOMContentLoaded', () => {
    const DURATION = 60; // Game duration in seconds
    const TARGET_KEY = ' '; // Spacebar
    
    const startButton = document.getElementById('startButton');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const feedback = document.getElementById('feedback');
    const gameArea = document.getElementById('game-area'); 
    
    let score = 0;
    let timeLeft = DURATION;
    let gameActive = false;
    let timerInterval = null;
    let isKeyDown = false; // Tracks if the key is currently held down

    // Ensure the game area can receive focus for keyboard input
    if (gameArea) {
        gameArea.setAttribute('tabindex', 0); // Make it focusable
    }
    
    function setFocus() {
        if (gameArea) {
            gameArea.focus();
        }
    }
    
    // --- Core Game Functions ---

    function startGame() {
        if (gameActive) return;

        // Reset game state
        score = 0;
        timeLeft = DURATION;
        gameActive = true;
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timeLeft;
        feedback.textContent = 'Press the Spacebar repeatedly!';

        startButton.disabled = true;

        // Ensure the game area can receive keyboard input
        setFocus(); 

        // Start timer
        timerInterval = setInterval(updateTimer, 1000);
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
        
        // Final score message
        feedback.textContent = `Time's Up! Final Score: ${score} taps.`;
        
        // *** CRITICAL STEP: Send the score to the parent window (the launcher) ***
        window.parent.postMessage({
            type: 'GAME_SCORE',
            gameId: 'tapper', // Must match the folder name 'game_tapper'
            score: score
        }, '*'); 
    }

    // --- Key Event Handlers (Press-and-Release Logic) ---

    // Handles key press DOWN (keydown)
    window.addEventListener('keydown', (event) => {
        if (!gameActive) return;
        if (event.key !== TARGET_KEY) return;
        
        // Prevent default action (like page scrolling)
        event.preventDefault(); 

        // CRITICAL FIX: Only count the tap if the key was previously UP
        if (!isKeyDown) {
            score++;
            scoreDisplay.textContent = score;
            isKeyDown = true; // Key is now down
            
            // Visual feedback
            feedback.textContent = `Tap: ${score}`; 
        }
    });

    // Handles key release UP (keyup)
    window.addEventListener('keyup', (event) => {
        if (!gameActive) return;
        if (event.key !== TARGET_KEY) return;
        
        // Allow the next tap to be counted
        isKeyDown = false; 
    });


    // --- Initialization ---
    startButton.addEventListener('click', startGame);
});