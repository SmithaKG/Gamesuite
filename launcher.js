document.addEventListener('DOMContentLoaded', () => {
    const gameButtons = document.querySelectorAll('.game-btn');
    const gameFrame = document.getElementById('gameFrame');
    const scoreTableBody = document.querySelector('#scoreTable tbody');
    const clearScoresBtn = document.getElementById('clearScoresBtn');
    
    const STORAGE_KEY = 'gameScores';

    // --- Score Handling Functions ---

    function loadScores() {
        const scoresJson = localStorage.getItem(STORAGE_KEY);
        return scoresJson ? JSON.parse(scoresJson) : [];
    }

    function saveScores(scores) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        renderScoreTable(scores);
    }

    function renderScoreTable(scores) {
        scoreTableBody.innerHTML = ''; // Clear existing rows
        
        // Sort by date (newest first)
        scores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        scores.forEach(score => {
            const row = scoreTableBody.insertRow();
            row.insertCell().textContent = formatGameName(score.gameId);
            row.insertCell().textContent = score.score;
            row.insertCell().textContent = new Date(score.timestamp).toLocaleString();
        });
    }
    
    function formatGameName(id) {
        switch (id) {
            case 'tapper': return 'Typing Tapper';
            case 'color': return 'Color Match';
            case 'tracking': return 'Visual Tracking';
            case 'evenodd': return 'Even Odd Dice';   
            default: return 'Unknown Game';
        }
    }

    // --- Event Handlers ---

    // 1. Button Click to Load Game
    gameButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const gameId = e.currentTarget.dataset.gameId;
            const gamePath = `./game_${gameId}/index.html`; 
            
            // Load the new game into the iframe
            gameFrame.src = gamePath;
        });
    });
    
    // 2. Clear Scores Button
    clearScoresBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear ALL game history? This cannot be undone.")) {
            saveScores([]); // Save an empty array
            alert("All scores cleared.");
        }
    });

    // 3. Message Listener for Receiving Scores from Games (CRITICAL)
    window.addEventListener('message', (event) => {
        // Ensure the message is coming from a trusted origin (our own local host)
        // In a live setting, you should check event.origin
        
        const data = event.data;

        if (data && data.type === 'GAME_SCORE') {
            const newScore = {
                gameId: data.gameId,
                score: data.score,
                timestamp: new Date().toISOString()
            };
            
            const scores = loadScores();
            scores.push(newScore);
            saveScores(scores);
            
            // Reload the iframe to a blank page or instructions after scoring
            gameFrame.src = 'about:blank';
            alert(`Score saved for ${formatGameName(data.gameId)}: ${data.score}`);
        }
    });

    // --- Initialization ---
    renderScoreTable(loadScores());
});
