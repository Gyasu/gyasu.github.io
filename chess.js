// Chess piece Unicode symbols
const pieces = {
  'white': {
    'king': '♔', 'queen': '♕', 'rook': '♖', 
    'bishop': '♗', 'knight': '♘', 'pawn': '♙'
  },
  'black': {
    'king': '♚', 'queen': '♛', 'rook': '♜', 
    'bishop': '♝', 'knight': '♞', 'pawn': '♟'
  }
};

// Initial chess board setup
let board = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖']
];

let currentPlayer = 'white';
let selectedSquare = null;
let gameHistory = [];

// Replace this with your Google Apps Script Web App URL
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxLgwlqF5AJr7r1NnDilXttUeoif8z-dwHKWL5Qf86wh3K4otklmeiVjldCGQiC-30Dtw/exec';

function initializeBoard() {
  const chessBoard = document.getElementById('chess-board');
  chessBoard.innerHTML = '';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.className = 'chess-square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;
      square.textContent = board[row][col];
      square.addEventListener('click', () => handleSquareClick(row, col));
      chessBoard.appendChild(square);
    }
  }
}

function handleSquareClick(row, col) {
  const playerName = document.getElementById('player-name').value.trim();
  if (!playerName) {
    alert('Please enter your name first!');
    document.getElementById('player-name').focus();
    return;
  }

  const clickedPiece = board[row][col];
  
  if (selectedSquare) {
    // Try to make a move
    if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
      makeMove(selectedSquare.row, selectedSquare.col, row, col, playerName);
    }
    clearSelection();
  } else if (clickedPiece && isPieceOfCurrentPlayer(clickedPiece)) {
    // Select a piece
    selectSquare(row, col);
  }
}

function selectSquare(row, col) {
  selectedSquare = { row, col };
  updateBoardDisplay();
}

function clearSelection() {
  selectedSquare = null;
  updateBoardDisplay();
}

function updateBoardDisplay() {
  const squares = document.querySelectorAll('.chess-square');
  squares.forEach(square => {
    square.classList.remove('selected', 'possible-move');
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
      square.classList.add('selected');
    }
    
    if (selectedSquare && isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
      square.classList.add('possible-move');
    }
  });
}

function isPieceOfCurrentPlayer(piece) {
  if (!piece) return false;
  const whitePieces = Object.values(pieces.white);
  const blackPieces = Object.values(pieces.black);
  
  if (currentPlayer === 'white') {
    return whitePieces.includes(piece);
  } else {
    return blackPieces.includes(piece);
  }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
  // Basic validation - piece exists and not moving to same square
  if (!board[fromRow][fromCol] || (fromRow === toRow && fromCol === toCol)) {
    return false;
  }
  
  // Can't capture own piece
  const targetPiece = board[toRow][toCol];
  if (targetPiece && isPieceOfCurrentPlayer(targetPiece)) {
    return false;
  }
  
  // Basic move validation (simplified - doesn't include all chess rules)
  const piece = board[fromRow][fromCol];
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  // Pawn movement (simplified)
  if (piece === '♙' || piece === '♟') {
    const direction = piece === '♙' ? -1 : 1;
    const startRow = piece === '♙' ? 6 : 1;
    
    if (fromCol === toCol) { // Moving forward
      if (toRow === fromRow + direction && !targetPiece) {
        return true; // One square forward
      }
      if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) {
        return true; // Two squares from start
      }
    } else if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
      return true; // Diagonal capture
    }
    return false;
  }
  
  // Rook movement
  if (piece === '♖' || piece === '♜') {
    if (rowDiff === 0 || colDiff === 0) {
      return isPathClear(fromRow, fromCol, toRow, toCol);
    }
    return false;
  }
  
  // Bishop movement
  if (piece === '♗' || piece === '♝') {
    if (rowDiff === colDiff) {
      return isPathClear(fromRow, fromCol, toRow, toCol);
    }
    return false;
  }
  
  // Queen movement
  if (piece === '♕' || piece === '♛') {
    if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
      return isPathClear(fromRow, fromCol, toRow, toCol);
    }
    return false;
  }
  
  // King movement
  if (piece === '♔' || piece === '♚') {
    return rowDiff <= 1 && colDiff <= 1;
  }
  
  // Knight movement
  if (piece === '♘' || piece === '♞') {
    return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2));
  }
  
  return true; // Allow other moves for simplicity
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
  
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  
  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol]) {
      return false; // Path is blocked
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
}

function makeMove(fromRow, fromCol, toRow, toCol, playerName) {
  const piece = board[fromRow][fromCol];
  const capturedPiece = board[toRow][toCol];
  
  // Make the move
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = '';
  
  // Record the move
  const moveData = {
    player: playerName,
    piece: piece,
    from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
    to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
    captured: capturedPiece || '',
    timestamp: new Date().toLocaleString(),
    action: 'move'  // 👈 ADD THIS
    };

  
  gameHistory.unshift(moveData);
  
  // Update display
  initializeBoard();
  updateGameStatus();
  updateMoveHistory();
  
  // Submit to Google Sheets
  submitMoveToSheets(moveData);
  
  // Switch players
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
}

function updateGameStatus() {
  const status = document.getElementById('game-status');
  if (!status) {
    console.warn("Element with ID 'game-status' not found.");
    return;
  }

  const playerColor = currentPlayer === 'white' ? 'White' : 'Black';
  const totalMoves = Array.isArray(gameHistory) ? gameHistory.length : 0;

  status.innerHTML = `
    <span class="chess-status-indicator ${currentPlayer === 'white' ? 'white-turn' : 'black-turn'}"></span>
    <strong>${playerColor} to move</strong><br>
    Moves played: ${totalMoves}
  `;
}

function updateMoveHistory() {
  const moveList = document.getElementById('move-list');
  if (gameHistory.length === 0) {
    moveList.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">No moves yet. Be the first to play!</div>';
    return;
  }
  
  moveList.innerHTML = gameHistory.slice(0, 10).map((move, index) => {
    if (move.action === 'reset') {
        return `
        <div class="move-entry">
            <strong>${move.player}</strong> reset the game.
            <small style="color: #7f8c8d; display: block;">${move.timestamp}</small>
        </div>
        `;
    } else {
        return `
        <div class="move-entry">
            <strong>${move.player}</strong>: ${move.piece} ${move.from}→${move.to}
            ${move.captured ? ` (captured ${move.captured})` : ''}
            <small style="color: #7f8c8d; display: block;">${move.timestamp}</small>
        </div>
        `;
    }
    }).join('');

}

async function submitMoveToSheets(moveData) {
  // Check if URL is configured
  if (SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    console.log('Google Sheets not configured. Move would be submitted:', moveData);
    showStatus('Move recorded locally (Google Sheets not configured)', 'info');
    return;
  }
  
  try {
    showStatus('Saving move...', 'info');
    
    const response = await fetch(SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Important for Google Apps Script
      body: JSON.stringify(moveData)
    });
    
    showStatus('Move saved to Google Sheets!', 'success');
    
  } catch (error) {
    console.error('Error submitting move:', error);
    showStatus('Move saved locally (Google Sheets unavailable)', 'warning');
  }
}

function showStatus(message, type = 'info') {
  // Create or update status message
  let statusEl = document.getElementById('chess-status-message');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'chess-status-message';
    statusEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      border-radius: 5px;
      color: white;
      font-weight: 600;
      z-index: 1001;
      transition: all 0.3s;
    `;
    document.body.appendChild(statusEl);
  }
  
  // Set color based on type
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };
  
  statusEl.style.backgroundColor = colors[type] || colors.info;
  statusEl.textContent = message;
  statusEl.style.opacity = '1';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.style.opacity = '0';
  }, 3000);
}

function resetGame() {
  if (confirm('Are you sure you want to reset the game? This will clear all moves.')) {
    const playerName = document.getElementById('player-name').value.trim() || 'Unknown';

    // Record the reset event
    const resetEntry = {
      player: playerName,
      piece: '',
      from: '',
      to: '',
      captured: '',
      timestamp: new Date().toLocaleString(),
      action: 'reset'
    };

    gameHistory.unshift(resetEntry);  // Add to top of game history
    submitMoveToSheets(resetEntry);   // Send to Google Sheets

    // Reset board to initial position
    board = [
      ['♜','♞','♝','♛','♚','♝','♞','♜'],
      ['♟','♟','♟','♟','♟','♟','♟','♟'],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['♙','♙','♙','♙','♙','♙','♙','♙'],
      ['♖','♘','♗','♕','♔','♗','♘','♖']
    ];

    currentPlayer = 'white';
    selectedSquare = null;

    initializeBoard();
    updateGameStatus();
    updateMoveHistory();

    //showStatus('Game reset!', 'info');
  }
}

// Add a button to manually load game state
function addLoadGameButton() {
  const chessInfo = document.querySelector('.chess-info');
  const loadButton = document.createElement('button');
  loadButton.textContent = 'Load Latest Game';
  loadButton.className = 'reset-btn';
  loadButton.style.backgroundColor = '#b68864';
  loadButton.style.marginTop = '0.5rem';
  loadButton.onclick = function() {
    loadGameState();
  };
  
  chessInfo.insertBefore(loadButton, document.querySelector('.reset-btn'));
}

// Initialize the game
document.addEventListener('DOMContentLoaded', async function() {
  initializeBoard();
  updateGameStatus();
  updateMoveHistory();
  addLoadGameButton();
  
  // Try to load game state, but don't block if it fails
  if (!SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    loadGameState();
  }
});

async function loadGameState() {
  // Check if URL is configured
  if (SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    console.log('Google Sheets not configured. Starting fresh game.');
    return;
  }
  
  try {
    //showStatus('Loading game state...', 'info');
    
    // Create a unique callback name to avoid conflicts
    const callbackName = 'chessGameLoader_' + Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve) => {
      // Set up timeout first
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          showStatus('Starting fresh game (loading timeout)', 'warning');
          cleanup();
          resolve();
        }
      }, 8000); // Increased timeout to 8 seconds
      
      // Create the global callback function
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        
        try {
          if (data && data.status === 'success' && data.moves && data.moves.length > 0) {
            reconstructBoard(data.moves);
            //showStatus(`Game loaded! ${data.moves.length} moves found.`, 'success');
          } else {
            //showStatus('Starting fresh game', 'info');
          }
        } catch (error) {
          console.error('Error processing loaded data:', error);
          showStatus('Error loading game. Starting fresh.', 'warning');
        }
        
        cleanup();
        resolve();
      };
      
      function cleanup() {
        try {
          if (script && script.parentNode) {
            document.head.removeChild(script);
          }
        } catch (e) {
          // Script might already be removed
        }
        delete window[callbackName];
      }
      
      // Create and load the script
      const script = document.createElement('script');
      script.src = SHEETS_URL + '?callback=' + callbackName;
      script.onerror = function() {
        clearTimeout(timeoutId);
        showStatus('Could not connect to Google Sheets. Starting fresh.', 'warning');
        cleanup();
        resolve();
      };
      
      document.head.appendChild(script);
    });
    
  } catch (error) {
    console.log('Could not load game state:', error);
    //showStatus('Starting fresh game', 'info');
  }
}

function reconstructBoard(moves) {
  console.log('Reconstructing board with moves:', moves);

  // Check if the last move was a reset
  const lastMove = moves[moves.length - 1];
  const wasReset = lastMove?.action === 'reset';

  // Reset to initial board
  board = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']
  ];

  currentPlayer = 'white';
  gameHistory = [];

  if (!wasReset) {
    const sortedMoves = moves
      .filter(m => m.action === 'move') // Only replay actual moves
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    sortedMoves.forEach((move, index) => {
      const fromCol = move.from.charCodeAt(0) - 97;
      const fromRow = 8 - parseInt(move.from[1]);
      const toCol = move.to.charCodeAt(0) - 97;
      const toRow = 8 - parseInt(move.to[1]);

      if (board[fromRow] && board[fromRow][fromCol]) {
        board[toRow][toCol] = board[fromRow][fromCol];
        board[fromRow][fromCol] = '';
      }

      gameHistory.unshift(move);
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    });

    console.log(`Replayed ${sortedMoves.length} moves`);
  } else {
    console.log('Last move was a reset — starting fresh board');
    gameHistory.unshift(lastMove);
  }

  initializeBoard();
  updateGameStatus();
  updateMoveHistory();
}


// Last updated script
document.addEventListener('DOMContentLoaded', function() {
  const lastUpdatedElement = document.getElementById("last-updated");
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent =
      "Last updated: " + new Date(document.lastModified).toLocaleDateString();
  }
});