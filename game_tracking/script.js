document.addEventListener('DOMContentLoaded', () => {
    const DURATION = 60; // Game duration in seconds
    const TARGET_SPEED = 0.02; // Controls speed of movement along the circle
    const ACCURACY_THRESHOLD = 30; // Max distance (pixels) to score a point
    
    // RGB to control the target dot's color cycling
    let r = 255, g = 0, b = 0; 
    const colorCycleSpeed = 5; 

    const startButton = document.getElementById('startButton');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const trackingArea = document.getElementById('trackingArea');
    const playerCursor = document.getElementById('playerCursor');
    const targetDot = document.getElementById('targetDot');
    const progressBar = document.getElementById('progressBar');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const messageDisplay = document.getElementById('message');

    let score = 0;
    let timeLeft = DURATION;
    let gameActive = false;
    let startTime = 0;
    let lastTime = 0;
    let animationFrameId = null;
    let timerInterval = null;

    // Dimensions of the tracking area (crucial for movement logic)
    const AREA_W = 500;
    const AREA_H = 300;
    const RADIUS_X = 150; // Horizontal radius of the path
    const RADIUS_Y = 100; // Vertical radius of the path (making an oval)
    const CENTER_X = AREA_W / 2;
    const CENTER_Y = AREA_H / 2;

    // --- Utility Functions ---

    // Calculates distance between two points (Pythagorean theorem)
    function getDistance(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Updates the color of the target dot
    function cycleColor() {
        if (r > 0 && b === 0) { // R -> Y
            r--; g++;
        } else if (g > 0 && r === 0) { // Y -> G -> C
            g--; b++;
        } else if (b > 0 && g === 0) { // C -> B -> M
            b--; r++;
        }
        targetDot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }

    // --- Game Loop Functions ---

    function updateTargetPosition(time) {
        // Creates a predictable, slow oval/circular path
        const angle = time * TARGET_SPEED;
        
        // Use sin/cos for smooth elliptical movement
        const x = CENTER_X + RADIUS_X * Math.cos(angle);
        const y = CENTER_Y + RADIUS_Y * Math.sin(angle);
        
        // Update DOM position
        targetDot.style.left = `${x}px`;
        targetDot.style.top = `${y}px`;
        
        return { x: x + 10, y: y + 10 }; // Return center coordinates (add half width/height)
    }

    function checkAccuracy(targetCenter) {
        // Get player cursor's actual center position relative to the tracking area
        const playerRect = playerCursor.getBoundingClientRect();
        const areaRect = trackingArea.getBoundingClientRect();
        
        // Calculate player center relative to the tracking area
        const playerCenterX = (playerRect.left + playerRect.right) / 2 - areaRect.left;
        const playerCenterY = (playerRect.top + playerRect.bottom) / 2 - areaRect.top;

        // Calculate distance
        const distance = getDistance(playerCenterX, playerCenterY, targetCenter.x, targetCenter.y);
        
        if (distance < ACCURACY_THRESHOLD) {
            // Accurate! Reward and Visual Feedback
            score++;
            playerCursor.classList.remove('inaccurate');
            playerCursor.classList.add('accurate');
        } else {
            // Inaccurate!
            playerCursor.classList.remove('accurate');
            playerCursor.classList.add('inaccurate');
        }
        scoreDisplay.textContent = Math.floor(score / 5); // Score based on frames (5 points = 1 actual point)
    }

    // Main animation loop
    function gameLoop(currentTime) {
        if (!gameActive) return;

        const delta = currentTime - lastTime;
        
        // Only run checks periodically (e.g., every 50ms) to save CPU
        if (delta > 50) { 
            lastTime = currentTime;
            
            // 1. Move target and get its center
            const targetCenter = updateTargetPosition(currentTime);
            
            // 2. Check accuracy and update score/feedback
            checkAccuracy(targetCenter);
            
            // 3. Update color gradient (less frequent)
            if (currentTime % colorCycleSpeed < 1) cycleColor();
        }

        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // --- Event Handlers & Control ---
    
    function handleMouseMove(event) {
        if (!gameActive) return;

        // Get mouse position relative to the tracking area
        const rect = trackingArea.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        // Clamp coordinates to prevent cursor from leaving the box boundaries
        x = Math.max(0, Math.min(x, AREA_W));
        y = Math.max(0, Math.min(y, AREA_H));
        
        playerCursor.style.left = `${x}px`;
        playerCursor.style.top = `${y}px`;
    }

    function startGame() {
        if (gameActive) return;

        // Reset state
        score = 0;
        timeLeft = DURATION;
        gameActive = true;
        
        // Reset DOM elements
        scoreDisplay.textContent = 0;
        timerDisplay.textContent = DURATION;
        progressBar.style.width = '100%';
        messageDisplay.textContent = '';
        
        // Show/Hide elements
        trackingArea.classList.remove('hidden');
        progressBarContainer.classList.remove('hidden');
        startButton.disabled = true;
        
        // Add event listeners for mouse tracking
        trackingArea.addEventListener('mousemove', handleMouseMove);

        // Start timer and animation
        timerInterval = setInterval(updateTimer, 1000);
        startTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function updateTimer() {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        const progressPercentage = (timeLeft / DURATION) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        // Clean up
        trackingArea.removeEventListener('mousemove', handleMouseMove);
        trackingArea.classList.add('hidden');
        progressBarContainer.classList.add('hidden');
        startButton.disabled = false;
        
        // Display final score
        messageDisplay.textContent = `Time's Up! Final Score: ${scoreDisplay.textContent} points.`;
    }

    // --- Initialize ---
    trackingArea.style.width = `${AREA_W}px`;
    trackingArea.style.height = `${AREA_H}px`;
    progressBarContainer.style.width = `${AREA_W}px`;
    trackingArea.classList.add('hidden'); 
    progressBarContainer.classList.add('hidden');

    startButton.addEventListener('click', startGame);
});