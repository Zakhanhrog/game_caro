// --- DOM Elements ---
const bodyElement = document.body;
const screens = document.querySelectorAll('.screen');
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const boardElement = document.getElementById('game-board');
const statusElement = document.getElementById('game-status');
const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');

// Inputs & Displays
const player1NameInput = document.getElementById('player1-name-input');
const player2NameInput = document.getElementById('player2-name-input');
const sizeInput = document.getElementById('board-size-input');
const player1NameDisplay = document.getElementById('player1-name-display');
const player2NameDisplay = document.getElementById('player2-name-display');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');

// Buttons
const presetSizeBtns = setupScreen.querySelectorAll('.size-btn');
const startGameBtn = document.getElementById('start-game-btn');
const newSetupBtn = document.getElementById('new-setup-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const undoBtn = document.getElementById('undo-btn');
const themeToggleSetupBtn = document.getElementById('theme-toggle-setup');
const themeToggleGameBtn = document.getElementById('theme-toggle-game');
const playAgainModalBtn = document.getElementById('play-again-modal-btn');
const newSetupModalBtn = document.getElementById('new-setup-modal-btn');

// --- Game State ---
let board = [];
let currentPlayer = 'X';
let gameActive = false;
let boardSize = 0;
let winCondition = 5;
let currentCells = [];
let moveHistory = [];
let lastMoveCell = null;

// Player Data
let player1Name = "Player 1";
let player2Name = "Player 2";
let player1Score = 0;
let player2Score = 0;

// --- Constants ---
const THEME_STORAGE_KEY = 'caro_theme';
const PLAYER1_NAME_KEY = 'caro_p1_name';
const PLAYER2_NAME_KEY = 'caro_p2_name';
const PLAYER1_SCORE_KEY = 'caro_p1_score';
const PLAYER2_SCORE_KEY = 'caro_p2_score';

// --- Core Functions --- (showScreen, showModal, hideModal, applyTheme, toggleTheme - Giữ nguyên)
/** Shows a specific screen, hides others */
function showScreen(screenId) {
    screens.forEach(screen => {
        setTimeout(() => { // Ensure class removal/addition order for transitions
            screen.classList.remove('active');
            if (screen.id === screenId) {
                screen.classList.add('active');
            }
        }, 0);
    });
}

/** Shows the result modal */
function showModal() {
    setTimeout(() => resultModal.classList.add('active'), 10);
}

/** Hides the result modal */
function hideModal() {
    resultModal.classList.remove('active');
}

/** Applies theme (light/dark) */
function applyTheme(theme) {
    bodyElement.classList.remove('dark-theme', 'light-theme'); // Remove both first
    if (theme === 'dark') {
        bodyElement.classList.add('dark-theme');
    } else {
        bodyElement.classList.add('light-theme'); // Explicitly add light for clarity if needed
    }
}

/** Toggles theme and saves preference */
function toggleTheme() {
    const currentTheme = bodyElement.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
        console.warn("Could not save theme preference to localStorage:", e);
    }
}

/** Loads saved theme from localStorage */
function loadTheme() {
    let savedTheme = 'light'; // Default to light
    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    } catch (e) {
        console.warn("Could not load theme preference from localStorage:", e);
    }
    applyTheme(savedTheme);
}

// --- Game Data Persistence ---

/** Loads player names and scores from localStorage */
function loadGameData() {
    try {
        player1Name = localStorage.getItem(PLAYER1_NAME_KEY) || "Player 1";
        player2Name = localStorage.getItem(PLAYER2_NAME_KEY) || "Player 2";
        player1Score = parseInt(localStorage.getItem(PLAYER1_SCORE_KEY) || '0', 10);
        player2Score = parseInt(localStorage.getItem(PLAYER2_SCORE_KEY) || '0', 10);

        // Ensure scores are numbers
        if (isNaN(player1Score)) player1Score = 0;
        if (isNaN(player2Score)) player2Score = 0;

        // Update input fields on setup screen with loaded names
        player1NameInput.value = player1Name;
        player2NameInput.value = player2Name;

    } catch (e) {
        console.warn("Could not load game data from localStorage:", e);
        // Use default values if loading fails
        player1Name = "Player 1";
        player2Name = "Player 2";
        player1Score = 0;
        player2Score = 0;
    }
    updateScoreDisplay(); // Update display after loading
}

/** Saves player names and scores to localStorage */
function saveGameData() {
    try {
        localStorage.setItem(PLAYER1_NAME_KEY, player1Name);
        localStorage.setItem(PLAYER2_NAME_KEY, player2Name);
        localStorage.setItem(PLAYER1_SCORE_KEY, player1Score.toString());
        localStorage.setItem(PLAYER2_SCORE_KEY, player2Score.toString());
    } catch (e) {
        console.warn("Could not save game data to localStorage:", e);
    }
}

// --- UI Update Functions ---

/** Updates the score display in the game header */
function updateScoreDisplay() {
    player1NameDisplay.textContent = player1Name || "Player 1"; // Fallback name
    player2NameDisplay.textContent = player2Name || "Player 2";
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
}

/** Gets the display name of the current player */
function getCurrentPlayerName() {
    return currentPlayer === 'X' ? player1Name : player2Name;
}

// --- Game Initialization and Logic --- (initializeGame, handleCellClick, makeMove, switchPlayer, checkWin, isBoardFull - slight modifications)

/** Initializes a new game */
function initializeGame(size) {
    // Validation
    if (isNaN(size) || size < 3 || size > 20) {
        alert("Kích thước không hợp lệ (3-20).");
        sizeInput.focus(); sizeInput.select(); return;
    }

    // Get Player Names from Input, provide defaults, save them
    player1Name = player1NameInput.value.trim() || "Player 1";
    player2Name = player2NameInput.value.trim() || "Player 2";
    player1NameInput.value = player1Name; // Update input field in case of trimming/default
    player2NameInput.value = player2Name;
    saveGameData(); // Save names (and current scores)

    // Update State
    boardSize = size;
    winCondition = (boardSize <= 4) ? boardSize : 5;
    board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    moveHistory = [];
    lastMoveCell = null;
    statusElement.textContent = `Lượt của: ${getCurrentPlayerName()}`; // Use name
    statusElement.style.color = 'var(--text-secondary)';
    undoBtn.disabled = true;

    // Update Score Display (in case names changed)
    updateScoreDisplay();

    // Prepare UI (Board creation is the same as before)
    boardElement.innerHTML = '';
    currentCells = [];
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    boardElement.classList.remove('size-medium', 'size-large');
    if (boardSize >= 8 && boardSize <= 12) boardElement.classList.add('size-medium');
    else if (boardSize > 12) boardElement.classList.add('size-large');

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row; cell.dataset.col = col;
            const span = document.createElement('span');
            cell.appendChild(span);
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
            currentCells.push(cell);
        }
    }

    hideModal();
    showScreen('game-screen');
}

/** Handles clicking on a cell */
function handleCellClick(event) {
    const clickedCell = event.currentTarget;
    const row = parseInt(clickedCell.dataset.row);
    const col = parseInt(clickedCell.dataset.col);

    if (!gameActive || board[row][col] !== '') return;

    const spanElement = clickedCell.querySelector('span');
    if (!spanElement) return;

    makeMove(row, col, clickedCell, spanElement);

    const winningLine = checkWin(row, col);
    if (winningLine) {
        endGame(false, winningLine);
    } else if (isBoardFull()) {
        endGame(true, null);
    } else {
        switchPlayer(); // Switch player needs to update status with name
    }
}

/** Executes a move */
function makeMove(row, col, cellElement, spanElement) {
    board[row][col] = currentPlayer;
    spanElement.textContent = currentPlayer;
    cellElement.classList.add(currentPlayer.toLowerCase());
    cellElement.style.cursor = 'default';

    if (lastMoveCell) lastMoveCell.classList.remove('last-move');
    cellElement.classList.add('last-move');
    lastMoveCell = cellElement;

    moveHistory.push({ row, col, player: currentPlayer, cellElement });
    undoBtn.disabled = false;
}

/** Switches the current player */
function switchPlayer() {
    currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    statusElement.textContent = `Lượt của: ${getCurrentPlayerName()}`; // Use name
}

/** Checks for a win condition (No change needed here) */
function checkWin(row, col) {
    const player = board[row][col];
    const directions = [ { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 } ];
    for (const { dr, dc } of directions) {
        let count = 1; const line = [{ r: row, c: col }];
        for (let i = 1; i < winCondition; i++) { const nr = row + dr * i, nc = col + dc * i; if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[nr][nc] === player) { count++; line.push({ r: nr, c: nc }); } else break; }
        for (let i = 1; i < winCondition; i++) { const nr = row - dr * i, nc = col - dc * i; if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[nr][nc] === player) { count++; line.push({ r: nr, c: nc }); } else break; }
        if (count >= winCondition) return line;
    } return false;
}

/** Checks if the board is full (No change needed here) */
function isBoardFull() { return board.every(row => row.every(cell => cell !== '')); }

/** Ends the current game and updates score */
function endGame(isDraw, winningLine) {
    gameActive = false;
    undoBtn.disabled = true;
    let title = '';
    let message = '';
    let titleColor = 'var(--text-primary)';

    if (isDraw) {
        title = "Hòa";
        message = "Không có người chiến thắng.";
        titleColor = 'var(--text-secondary)';
        statusElement.textContent = "Kết quả: Hòa";
    } else {
        const winnerSymbol = currentPlayer;
        const winnerName = getCurrentPlayerName();
        title = `${winnerName} (${winnerSymbol}) Thắng!`; // Include symbol
        message = `Chúc mừng ${winnerName}!`;
        titleColor = (winnerSymbol === 'X') ? 'var(--player-x)' : 'var(--player-o)';
        statusElement.textContent = `Kết quả: ${winnerName} thắng!`;

        // Increment Score
        if (winnerSymbol === 'X') {
            player1Score++;
        } else {
            player2Score++;
        }
        updateScoreDisplay(); // Update score display in header
        saveGameData(); // Save updated scores

        if (winningLine) {
            highlightWinningLine(winningLine);
        }
    }

    statusElement.style.color = titleColor;
    resultTitle.textContent = title;
    resultTitle.style.color = titleColor;
    resultMessage.textContent = message;
    showModal();
}

/** Highlights the winning cells (No change needed here) */
function highlightWinningLine(line) { line.forEach(({ r, c }) => { const cellIndex = r * boardSize + c; if (currentCells[cellIndex]) { currentCells[cellIndex].classList.add('winning'); } }); }

/** Resets the board for the same size game */
function resetBoard() {
    if (boardSize < 3) return;

    board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    moveHistory = [];
    lastMoveCell = null;
    statusElement.textContent = `Lượt của: ${getCurrentPlayerName()}`; // Use name
    statusElement.style.color = 'var(--text-secondary)';
    undoBtn.disabled = true;

    currentCells.forEach(cell => {
        const span = cell.querySelector('span');
        if (span) span.textContent = '';
        cell.classList.remove('x', 'o', 'winning', 'last-move');
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', handleCellClick); // Ensure listener is present
    });

    hideModal();
}

/** Undoes the last move */
function handleUndo() {
    if (!gameActive || moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    const { row, col, player, cellElement } = lastMove;

    board[row][col] = '';

    const span = cellElement.querySelector('span');
    if (span) span.textContent = '';
    cellElement.classList.remove(player.toLowerCase(), 'last-move', 'winning');
    cellElement.style.cursor = 'pointer';
    cellElement.addEventListener('click', handleCellClick); // Add back listener

    currentPlayer = player; // Restore player
    statusElement.textContent = `Lượt của: ${getCurrentPlayerName()}`; // Update status with name

    // Update last move highlight
    if (lastMoveCell === cellElement) { // Was the undone move the last highlighted?
        lastMoveCell = null; // Clear ref
    }
    const newLastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

    // Remove previous highlight *only if* it wasn't the new last move already
    if (lastMoveCell && (!newLastMove || lastMoveCell !== newLastMove.cellElement)) {
        lastMoveCell.classList.remove('last-move');
    }

    // Add highlight to the *new* last move
    if (newLastMove && newLastMove.cellElement) {
        newLastMove.cellElement.classList.add('last-move');
        lastMoveCell = newLastMove.cellElement;
    } else {
        lastMoveCell = null; // No history left or error
    }

    undoBtn.disabled = moveHistory.length === 0;
}


// --- Event Listeners --- (Setup, Game, Modal)

// Setup Screen
presetSizeBtns.forEach(btn => btn.addEventListener('click', () => {
    const size = parseInt(btn.dataset.size);
    sizeInput.value = size;
    // Don't start game here, let user press Start button
}));
startGameBtn.addEventListener('click', () => {
    const size = parseInt(sizeInput.value);
    initializeGame(size); // Starts game with current names and size
});
themeToggleSetupBtn.addEventListener('click', toggleTheme);

// Game Screen
newSetupBtn.addEventListener('click', () => {
    if (gameActive && moveHistory.length > 0) { if (!confirm('Thoát và cài đặt lại? Ván đấu sẽ bị hủy.')) return; }
    gameActive = false; boardSize = 0;
    player1NameInput.value = player1Name; // Ensure inputs reflect current names
    player2NameInput.value = player2Name;
    showScreen('setup-screen');
});
resetGameBtn.addEventListener('click', () => {
    if (gameActive && moveHistory.length > 0) { if (!confirm('Chơi lại ván này?')) return; }
    resetBoard();
});
undoBtn.addEventListener('click', handleUndo);
themeToggleGameBtn.addEventListener('click', toggleTheme);

// Modal
playAgainModalBtn.addEventListener('click', resetBoard);
newSetupModalBtn.addEventListener('click', () => {
    hideModal(); gameActive = false; boardSize = 0;
    player1NameInput.value = player1Name; // Ensure inputs reflect current names
    player2NameInput.value = player2Name;
    showScreen('setup-screen');
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); // Load theme first
    loadGameData(); // Load names and scores, update UI
    showScreen('setup-screen'); // Show setup
});