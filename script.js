// ... (Các phần khác giữ nguyên) ...

// --- Hàm Khởi tạo Game ---
function initializeGame(size) {
    boardSize = size;
    // Điều chỉnh điều kiện thắng dựa trên kích thước (phổ biến nhất là 5)
    if (size <= 4) { // Thêm điều kiện <= 4 cho 3x3 và 4x4
        winCondition = size; // Thắng cần số lượng = kích thước bảng
    } else {
        winCondition = 5; // Gomoku rule for 5x5 and larger
    }

    // Reset trạng thái
    board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    statusElement.textContent = `Lượt của ${currentPlayer}`; // Đặt lại thông báo khi bắt đầu

    // Xóa các ô cũ và tạo bảng mới
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

    // --- Cập nhật Class điều chỉnh font size ---
    boardElement.classList.remove('size-tiny', 'size-small', 'size-medium', 'size-large'); // Xóa hết class cũ
    if (boardSize <= 4) {
        boardElement.classList.add('size-tiny');
    } else if (boardSize <= 8) {
        boardElement.classList.add('size-small');
    } else if (boardSize <= 14) {
        boardElement.classList.add('size-medium');
    } else {
        boardElement.classList.add('size-large');
    }
    // ------------------------------------------

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
    // Ẩn khu vực game nếu chưa chọn size lần đầu (tùy chọn)
    document.querySelector('.game-area').style.display = 'flex'; // Hiển thị khi game bắt đầu
}

// --- (Tùy chọn) Ẩn khu vực game ban đầu ---
// Thêm dòng này vào cuối file JS để ẩn game area khi mới tải trang
// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelector('.game-area').style.display = 'none';
// });


// --- Hàm kết thúc Game ---
function endGame(isDraw) {
    gameActive = false;
    if (isDraw) {
        statusElement.textContent = "Hòa! 🤝"; // Thêm icon
        statusElement.style.color = var(--secondary-color); // Đổi màu trạng thái hòa
    } else {
        // Đặt màu theo người thắng
        const winnerColor = currentPlayer === 'X' ? 'var(--player-x-color)' : 'var(--player-o-color)';
        statusElement.innerHTML = `Người chơi <span style="color: ${winnerColor}; font-weight: 700;">${currentPlayer}</span> thắng! 🎉`; // Thêm icon và highlight người thắng
    }
}


// --- Gắn Event Listeners ---
resetButton.addEventListener('click', () => {
    // Kiểm tra xem đã có kích thước hợp lệ chưa
    if(boardSize >= 3 && boardSize <= 20) {
        initializeGame(boardSize);
    } else {
        // Có thể đặt lại về kích thước mặc định nếu muốn
        initializeGame(10); // Hoặc hiển thị thông báo yêu cầu chọn size
        statusElement.textContent = "Vui lòng chọn kích thước để bắt đầu.";
    }
});

startCustomSizeButton.addEventListener('click', () => {
    const size = parseInt(customSizeInput.value);
    if (size >= 3 && size <= 20) {
        initializeGame(size);
    } else {
        alert("Kích thước không hợp lệ! Vui lòng chọn từ 3 đến 20.");
        customSizeInput.focus(); // Focus lại vào ô input
    }
});

presetSizeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const size = parseInt(button.dataset.size);
        customSizeInput.value = size; // Đồng bộ input
        initializeGame(size);
    });
});

// --- Khởi tạo game lần đầu (hoặc không làm gì, để người dùng chọn) ---
// Bỏ dòng initializeGame(10) ở đây để người dùng phải chọn kích thước trước
// Nếu muốn có bảng mặc định, hãy giữ lại initializeGame(10);
statusElement.textContent = "Chọn kích thước bảng để bắt đầu chơi!"; // Thông báo ban đầu rõ ràng hơn

// (Tùy chọn) Gọi hàm ẩn khu vực game nếu bạn đã thêm event listener DOMContentLoaded
// document.querySelector('.game-area').style.display = 'none';