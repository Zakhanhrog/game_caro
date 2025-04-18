// --- Lấy các phần tử DOM ---
const screens = document.querySelectorAll('.screen');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const boardElement = document.getElementById('game-board');
const statusElement = document.getElementById('game-status'); // Đổi ID
const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');

// Nút bấm
const presetSizeButtons = startScreen.querySelectorAll('.size-btn');
const customSizeInput = document.getElementById('board-size-start'); // Đổi ID
const startCustomBtn = document.getElementById('start-custom-btn');
const newGameBtn = document.getElementById('new-game-btn'); // Nút trên game screen
const resetBoardBtn = document.getElementById('reset-board-btn'); // Đổi ID
const playAgainBtn = document.getElementById('play-again-btn'); // Nút trong modal
const newGameModalBtn = document.getElementById('new-game-modal-btn'); // Nút trong modal

// --- Biến trạng thái game ---
let board = [];
let currentPlayer = 'X';
let gameActive = true;
let boardSize = 0; // Bắt đầu với 0, yêu cầu chọn
let winCondition = 5;
let currentCells = []; // Lưu các phần tử cell DOM để dễ reset

// --- Hàm điều khiển hiển thị Màn hình/Modal ---
function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.add('active');
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}


// --- Hàm Khởi tạo Game ---
function initializeGame(size) {
    if (size < 3 || size > 20) {
        console.error("Kích thước không hợp lệ:", size);
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        alert("Kích thước bàn cờ phải từ 3 đến 20.");
        // Quay lại màn hình bắt đầu nếu đang ở màn hình game
        if(gameScreen.classList.contains('active')) {
            showScreen('start-screen');
        }
        return; // Không khởi tạo nếu size không hợp lệ
    }

    boardSize = size;
    if (boardSize <= 4) {
        winCondition = boardSize;
    } else {
        winCondition = 5;
    }

    board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    statusElement.textContent = `Lượt của ${currentPlayer}`;
    statusElement.style.color = 'var(--text-dark)'; // Reset màu status
    currentCells = []; // Reset mảng DOM cells

    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

    // Cập nhật class font-size
    boardElement.classList.remove('size-medium', 'size-large');
    if (boardSize >= 8 && boardSize <= 12) {
        boardElement.classList.add('size-medium');
    } else if (boardSize > 12) {
        boardElement.classList.add('size-large');
    }

    // --- Tạo ô cờ ---
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            // Thêm thẻ span bên trong để chứa X/O - giúp ổn định hơn
            const span = document.createElement('span');
            cell.appendChild(span);

            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
            currentCells.push(cell); // Lưu lại tham chiếu DOM
        }
    }

    // Chuyển sang màn hình chơi game
    showScreen('game-screen');
    hideModal('result-modal'); // Đảm bảo modal kết quả đã tắt
}

// --- Hàm xử lý khi click vào ô ---
function handleCellClick(event) {
    const clickedCell = event.currentTarget; // Dùng currentTarget an toàn hơn
    // Lấy span bên trong để điền X/O
    const span = clickedCell.querySelector('span');

    // Kiểm tra span có tồn tại không
    if (!span) {
        console.error("Không tìm thấy thẻ span bên trong cell.");
        return;
    }

    const row = parseInt(clickedCell.dataset.row);
    const col = parseInt(clickedCell.dataset.col);

    if (!gameActive || board[row][col] !== '') {
        return;
    }

    // Thực hiện nước đi
    makeMove(row, col, clickedCell, span);

    // Kiểm tra thắng/hòa
    const winningLine = checkWin(row, col); // Hàm checkWin trả về mảng ô thắng hoặc false
    if (winningLine) {
        endGame(false, winningLine); // Thắng
    } else if (isBoardFull()) {
        endGame(true, null); // Hòa
    } else {
        switchPlayer(); // Đổi lượt
    }
}

// --- Hàm thực hiện nước đi ---
function makeMove(row, col, cellElement, spanElement) {
    board[row][col] = currentPlayer;
    spanElement.textContent = currentPlayer; // Ghi vào span
    cellElement.classList.add(currentPlayer.toLowerCase()); // Thêm class 'x' hoặc 'o' vào cell
    // Không cho click lại ô này
    cellElement.removeEventListener('click', handleCellClick);
    cellElement.style.cursor = 'not-allowed';
}

// --- Hàm đổi lượt chơi ---
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = `Lượt của ${currentPlayer}`;
}

// --- Hàm kiểm tra thắng (Cập nhật để trả về đường thắng) ---
function checkWin(row, col) {
    const player = board[row][col];
    const directions = [
        { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 }
    ];

    for (const { dr, dc } of directions) {
        let count = 1;
        const line = [{ r: row, c: col }]; // Lưu các ô trên đường thắng

        // Đếm xuôi
        for (let i = 1; i < winCondition; i++) {
            const nr = row + dr * i;
            const nc = col + dc * i;
            if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[nr][nc] === player) {
                count++;
                line.push({ r: nr, c: nc });
            } else break;
        }

        // Đếm ngược
        for (let i = 1; i < winCondition; i++) {
            const nr = row - dr * i;
            const nc = col - dc * i;
            if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[nr][nc] === player) {
                count++;
                line.push({ r: nr, c: nc });
            } else break;
        }

        if (count >= winCondition) {
            return line; // Trả về mảng tọa độ các ô thắng
        }
    }
    return false; // Không thắng
}

// --- Hàm kiểm tra bảng đầy ---
function isBoardFull() {
    return board.every(row => row.every(cell => cell !== ''));
}

// --- Hàm kết thúc Game ---
function endGame(isDraw, winningLine) {
    gameActive = false;
    let title = '';
    let message = '';
    let winnerColor = 'var(--text-dark)';

    if (isDraw) {
        title = "Hòa Cờ! 🤝";
        message = "Không ai thắng cả. Thử lại nhé!";
        winnerColor = 'var(--secondary-color)'; // Màu hòa
        statusElement.textContent = "Hòa!";
        statusElement.style.color = winnerColor;

    } else {
        title = `Người chơi ${currentPlayer} Thắng! 🎉`;
        message = `Chúc mừng người chơi ${currentPlayer}!`;
        winnerColor = currentPlayer === 'X' ? 'var(--accent-color)' : 'var(--accent-color-alt)';
        statusElement.textContent = ` ${currentPlayer} thắng!`;
        statusElement.style.color = winnerColor;

        // Highlight đường thắng
        if (winningLine) {
            highlightWinningLine(winningLine);
        }
    }

    // Hiển thị Modal kết quả
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    resultTitle.style.color = winnerColor;
    showModal('result-modal');
}

// --- Hàm Highlight đường thắng ---
function highlightWinningLine(line) {
    line.forEach(({ r, c }) => {
        // Tìm đúng cell DOM dựa trên tọa độ
        const cellIndex = r * boardSize + c;
        if (currentCells[cellIndex]) {
            currentCells[cellIndex].classList.add('winning');
        }
        // Cách khác: dùng querySelector (chậm hơn chút nếu bảng lớn)
        // const cellElement = boardElement.querySelector(`[data-row='${r}'][data-col='${c}']`);
        // if (cellElement) {
        //     cellElement.classList.add('winning');
        // }
    });
}

// --- Hàm Reset Chỉ Bảng Cờ (Chơi lại cùng kích thước) ---
function resetBoard() {
    if (boardSize < 3) return; // Chưa có kích thước thì không reset

    board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    statusElement.textContent = `Lượt của ${currentPlayer}`;
    statusElement.style.color = 'var(--text-dark)';

    // Reset trạng thái các ô DOM
    currentCells.forEach(cell => {
        const span = cell.querySelector('span');
        if (span) span.textContent = ''; // Xóa text
        cell.classList.remove('x', 'o', 'winning'); // Xóa class
        cell.style.cursor = 'pointer';
        // Gắn lại event listener nếu đã bị xóa
        cell.removeEventListener('click', handleCellClick); // Xóa listener cũ đề phòng trùng lặp
        cell.addEventListener('click', handleCellClick);
    });

    hideModal('result-modal'); // Ẩn modal nếu đang mở
}


// --- Gắn Event Listeners ---

// Màn hình bắt đầu
presetSizeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const size = parseInt(button.dataset.size);
        customSizeInput.value = size; // Cập nhật input
        initializeGame(size);
    });
});

startCustomBtn.addEventListener('click', () => {
    const size = parseInt(customSizeInput.value);
    initializeGame(size); // Hàm initializeGame đã có kiểm tra size
});

// Màn hình chơi game
resetBoardBtn.addEventListener('click', resetBoard); // Chơi lại ván hiện tại

newGameBtn.addEventListener('click', () => {
    // Hỏi xác nhận nếu đang chơi dở? (Tùy chọn)
    // if (gameActive && !isBoardFull() && board.some(r=>r.some(c=> c !==''))) {
    //     if (!confirm("Bạn có chắc muốn bắt đầu ván mới? Tiến trình hiện tại sẽ mất.")) {
    //         return;
    //     }
    // }
    showScreen('start-screen'); // Quay về màn hình chọn size
    boardSize = 0; // Reset size để bắt buộc chọn lại
});

// Modal kết quả
playAgainBtn.addEventListener('click', () => {
    resetBoard(); // Chỉ reset bảng, giữ nguyên size
});

newGameModalBtn.addEventListener('click', () => {
    hideModal('result-modal');
    showScreen('start-screen'); // Quay về màn hình chọn size
    boardSize = 0; // Reset size
});


// --- Khởi tạo ban đầu ---
showScreen('start-screen'); // Hiển thị màn hình bắt đầu khi tải trang