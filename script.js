// Game State
const gameState = {
    matchTime: 45,
    homeScore: 2,
    awayScore: 1,
    possession: 'home',
    ballPosition: { x: 650, y: 350 },
    selectedPlayer: null,
    gameStatus: 'playing',
    formations: {
        home: '4-2-3-1',
        away: '4-3-3'
    }
};

// Player data
const players = {
    home: [
        { id: 1, name: 'Marcus Johnson', pos: 'CAM', number: 11, selected: true },
        { id: 2, name: 'Alex Kumar', pos: 'ST', number: 12 },
        { id: 3, name: 'Ryan O\'Neill', pos: 'CM', number: 8 }
    ],
    away: [
        { id: 1, name: 'David Silva', pos: 'ST', number: 11 },
        { id: 2, name: 'Charles Chen', pos: 'CM', number: 8 }
    ]
};

// Event log
const eventLog = [];

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    startMatchSimulation();
});

function initializeEventListeners() {
    // Player click events
    document.querySelectorAll('.player').forEach(player => {
        player.addEventListener('click', handlePlayerClick);
        player.addEventListener('mouseover', handlePlayerHover);
        player.addEventListener('mouseout', handlePlayerOut);
    });

    // Control buttons
    document.querySelector('.btn-pause').addEventListener('click', pauseGame);
    document.querySelector('.btn-tactics').addEventListener('click', openTactics);
    document.querySelector('.btn-stats').addEventListener('click', openStats);
    document.querySelector('.btn-agent').addEventListener('click', openAgent);
    document.querySelector('.btn-exit').addEventListener('click', exitGame);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

function handlePlayerClick(e) {
    // Remove previous selection
    document.querySelectorAll('.player').forEach(p => {
        p.classList.remove('player-highlight');
    });

    // Add selection to clicked player
    e.currentTarget.classList.add('player-highlight');
    gameState.selectedPlayer = e.currentTarget;

    // Show player info
    const playerName = e.currentTarget.getAttribute('data-player');
    updateCoachReaction(`Focused on ${playerName}!`);
}

function handlePlayerHover(e) {
    const position = e.currentTarget.getAttribute('data-player');
    showPlayerTooltip(position);
}

function handlePlayerOut(e) {
    // Clear tooltip
}

function handleKeyPress(e) {
    switch(e.key.toUpperCase()) {
        case 'S':
            handleShoot();
            break;
        case 'Z':
            handlePass();
            break;
        case 'ARROWUP':
            moveBall(0, -30);
            e.preventDefault();
            break;
        case 'ARROWDOWN':
            moveBall(0, 30);
            e.preventDefault();
            break;
        case 'ARROWLEFT':
            moveBall(-30, 0);
            e.preventDefault();
            break;
        case 'ARROWRIGHT':
            moveBall(30, 0);
            e.preventDefault();
            break;
    }
}

function handleShoot() {
    const reactions = [
        '⚽ Shot on target!',
        '💪 Great strike!',
        '🎯 Perfect technique!',
        '🔥 Powerful shot!'
    ];
    updateCoachReaction(reactions[Math.floor(Math.random() * reactions.length)]);
    animateBall({ x: 1150, y: 400 }, 500);
}

function handlePass() {
    const reactions = [
        '👏 Nice pass!',
        '🎯 Great accuracy!',
        '💯 Perfect through ball!',
        '⭐ Excellent link-up play!'
    ];
    updateCoachReaction(reactions[Math.floor(Math.random() * reactions.length)]);
    animateBall({ x: 500, y: 350 }, 400);
}

function moveBall(dx, dy) {
    const ball = document.querySelector('.ball');
    if (ball) {
        gameState.ballPosition.x = Math.max(50, Math.min(1150, gameState.ballPosition.x + dx));
        gameState.ballPosition.y = Math.max(50, Math.min(750, gameState.ballPosition.y + dy));

        ball.setAttribute('cx', gameState.ballPosition.x);
        ball.setAttribute('cy', gameState.ballPosition.y);
    }
}

function animateBall(target, duration = 600) {
    const ball = document.querySelector('.ball');
    if (!ball) return;

    const startTime = Date.now();
    const startPos = {
        x: parseFloat(ball.getAttribute('cx')),
        y: parseFloat(ball.getAttribute('cy'))
    };

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const newX = startPos.x + (target.x - startPos.x) * easeInOutQuad(progress);
        const newY = startPos.y + (target.y - startPos.y) * easeInOutQuad(progress);

        ball.setAttribute('cx', newX);
        ball.setAttribute('cy', newY);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            gameState.ballPosition = target;
        }
    }

    animate();
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function updateCoachReaction(text, icon = '🎯', duration = 3000) {
    const coachPanel = document.querySelector('.coach-reaction');
    coachPanel.querySelector('.reaction-text').textContent = text;

    // Auto-hide after duration
    setTimeout(() => {
        coachPanel.style.opacity = '0.5';
    }, duration);

    setTimeout(() => {
        coachPanel.style.opacity = '1';
    }, duration + 100);
}

function showPlayerTooltip(position) {
    // Tooltip logic (can be expanded)
    console.log(`Player Position: ${position}`);
}

function startMatchSimulation() {
    // Simulate match events
    setInterval(() => {
        // Update match time
        gameState.matchTime += 1;

        if (gameState.matchTime > 45 && gameState.matchTime <= 50) {
            updateMatchTime();
        }

        // Random events
        if (Math.random() < 0.02) {
            triggerRandomEvent();
        }
    }, 2000);
}

function updateMatchTime() {
    const timeDisplay = document.querySelector('.match-time');
    const minute = Math.floor(gameState.matchTime);
    const second = (gameState.matchTime % 1).toFixed(2);

    timeDisplay.textContent = `${minute}'${second}`;
}

function triggerRandomEvent() {
    const events = [
        { type: 'pass', message: 'Nice pass!' },
        { type: 'shot', message: 'Powerful shot!' },
        { type: 'tackle', message: 'Great tackle!' },
        { type: 'corner', message: 'Corner kick!' }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    updateCoachReaction(`🎯 ${event.message}`);
}

// Control panel functions
function pauseGame() {
    gameState.gameStatus = gameState.gameStatus === 'playing' ? 'paused' : 'playing';
    const btn = document.querySelector('.btn-pause');
    btn.textContent = gameState.gameStatus === 'paused' ? '▶ RESUME' : '⏸ PAUSE';
    updateCoachReaction(gameState.gameStatus === 'paused' ? '⏸ Match Paused' : '▶ Match Resumed');
}

function openTactics() {
    const message = `Formation: ${gameState.formations.home} vs ${gameState.formations.away}\n\nLet's adjust our strategy!`;
    showModal('TACTICAL ADJUSTMENTS', message);
    updateCoachReaction('📊 Opening tactical board...');
}

function openStats() {
    const stats = `
        Possession: 58% vs 42%
        Shots: 8 vs 4
        On Target: 6 vs 3
        Passes: 312 vs 245
        Pass Accuracy: 87% vs 82%
    `;
    showModal('MATCH STATISTICS', stats);
    updateCoachReaction('📈 Analyzing match data...');
}

function openAgent() {
    const message = `Contract Status: Active
        Current Offer: 2-year deal
        Salary: $2.5M/year
        
        A bigger club is interested in you!
        Do you want to negotiate?`;
    showModal('AGENT CONTACT', message);
    updateCoachReaction('🤝 Agent calling with good news!');
}

function exitGame() {
    if (confirm('Are you sure you want to exit the match?')) {
        updateCoachReaction('❌ Exiting match...');
        setTimeout(() => {
            alert('Match saved! Final Score: ' + gameState.homeScore + ' - ' + gameState.awayScore);
            location.reload();
        }, 1000);
    }
}

function showModal(title, content) {
    // Create a simple modal (can be enhanced with modal HTML)
    console.log(`MODAL: ${title}\n${content}`);
    // In a full implementation, this would show a proper modal window
}

// Animation helpers
function animatePulse(element) {
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'pulse 1.5s infinite';
    }, 10);
}

// Goal animation
function scoreGoal(team) {
    const goalFrame = document.querySelector(`.goal-frame.${team}-goal`);

    if (goalFrame) {
        goalFrame.style.animation = 'slideIn 0.3s ease';

        updateCoachReaction(team === 'home' ? '⚽ GOAL FOR US!' : '⚽ They scored!');

        if (team === 'home') {
            gameState.homeScore += 1;
            document.querySelector('.home-score').textContent = gameState.homeScore;
            animateScore('home');
        } else {
            gameState.awayScore += 1;
            document.querySelector('.away-score').textContent = gameState.awayScore;
            animateScore('away');
        }
    }
}

function animateScore(team) {
    const scoreElement = document.querySelector(`.${team}-score`);
    scoreElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
    }, 300);
}

// Utility functions
function getRandomResponse() {
    const responses = [
        'Keep pressing forward!',
        'Maintain possession!',
        'Defensive shape is good!',
        'More intensity needed!',
        'Watch the wings!',
        'Stay compact!',
        'Push forward now!',
        'Protect the defense!',
        'That\'s the spirit!',
        'Focus on the task!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, handleShoot, handlePass, scoreGoal };
}

// Keyboard shortcut info
console.log(`
╔═══════════════════════════════════════╗
║   GREATEST DREAM - FOOTBALL CAREER    ║
║          KEYBOARD CONTROLS            ║
╠═══════════════════════════════════════╣
║ Arrow Keys (↑↓←→) - Move Player       ║
║ S Key - Shoot (tap/hold for power)    ║
║ Z Key - Pass (tap/hold for through)   ║
║ Z + Hold - Slide Tackle               ║
║ Z + Z - Standing Tackle               ║
╚═══════════════════════════════════════╝
`);
