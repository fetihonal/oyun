// Dart oyuncuları verileri
const players = [
    { id: 1, name: 'Fetih', average: 95.6, checkout: 48, accuracy: 92, image: 'fetih.png' },
    { id: 2, name: 'Göktürk', average: 93.2, checkout: 45, accuracy: 89, image: 'gokturk.png' },
    { id: 19, name: 'Mehmet', average: 93.2, checkout: 45, accuracy: 89, image: 'mehmet.jpg' },
    { id: 3, name: 'Ömer', average: 97.8, checkout: 52, accuracy: 94, image: 'ömer.jpg' },
    { id: 4, name: 'Umut', average: 91.5, checkout: 42, accuracy: 88, image: 'umut.jpg' },
    { id: 5, name: 'Nihat', average: 94.3, checkout: 47, accuracy: 90, image: 'nihat.png' },
    { id: 6, name: 'Onat', average: 92.7, checkout: 44, accuracy: 87, image: 'onat.jpg' },
    { id: 7, name: 'Ongun', average: 96.1, checkout: 50, accuracy: 91, image: 'ongun.jpg' },
    { id: 8, name: 'Ufuk', average: 90.8, checkout: 41, accuracy: 86, image: 'ufuk.jpg' },
    { id: 9, name: 'Yaşar', average: 93.9, checkout: 46, accuracy: 89, image: 'yaşar.jpg' },
    { id: 10, name: 'Uzbay', average: 95.2, checkout: 49, accuracy: 92, image: 'uzbay.jpg' },
    { id: 11, name: 'Saymen', average: 92.1, checkout: 43, accuracy: 87, image: 'saymen.jpg' },
    { id: 12, name: 'Burcu', average: 94.7, checkout: 48, accuracy: 90, image: 'burcu.jpg' },
    { id: 13, name: 'Selda', average: 93.5, checkout: 45, accuracy: 88, image: 'selda.jpg' },
    { id: 14, name: 'Derya', average: 96.3, checkout: 51, accuracy: 93, image: 'derya.jpg' },
    { id: 15, name: 'Büşra', average: 91.9, checkout: 42, accuracy: 86, image: 'büşra.jpg' },
    { id: 16, name: 'Yaprak', average: 95.0, checkout: 47, accuracy: 91, image: 'yaprak.jpg' },
    { id: 17, name: 'Ekin', average: 92.5, checkout: 44, accuracy: 87, image: 'ekin.png' },
    { id: 18, name: 'Sabahi', average: 94.1, checkout: 46, accuracy: 89, image: 'sabahi.jpg' }
];

// Ses efektleri
const sounds = {
    select: new Audio('sounds/select.mp3'),
    coin: new Audio('sounds/coin.mp3'),
    fight: new Audio('sounds/fight.mp3')
};

// Ses çalma fonksiyonu - bitmesini beklemeden çalar
function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
}

// Oyun durumu
const gameState = {
    player1: null,
    player2: null,
    activePlayer: 1, // 1 veya 2
    focusedPlayerIndex: 0,
    selectedPlayers: []
};

// DOM elementleri
const playerGrid = document.getElementById('player-grid');
const player1Portrait = document.getElementById('player1-portrait');
const player1Name = document.getElementById('player1-name');
const player1Average = document.getElementById('player1-average');
const player1Checkout = document.getElementById('player1-checkout');
const player1Accuracy = document.getElementById('player1-accuracy');
const player1Selection = document.getElementById('player1-selection');
const player2Portrait = document.getElementById('player2-portrait');
const player2Name = document.getElementById('player2-name');
const player2Average = document.getElementById('player2-average');
const player2Checkout = document.getElementById('player2-checkout');
const player2Accuracy = document.getElementById('player2-accuracy');
const player2Selection = document.getElementById('player2-selection');
const startMatchButton = document.getElementById('start-match');
const switchPlayerButton = document.getElementById('switch-player');

// Mobil cihaz kontrolü
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Oyuncu kartlarını oluştur
function createPlayerCards() {
    players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.dataset.playerId = player.id;
        playerCard.dataset.index = index;
        
        const selectionIndicator = document.createElement('div');
        selectionIndicator.className = 'selection-indicator';
        selectionIndicator.innerHTML = '▼';
        
        const playerImg = document.createElement('div');
        playerImg.className = 'player-card-img';
        playerImg.style.backgroundImage = `url('images/${player.image}')`;
        
        const playerName = document.createElement('div');
        playerName.className = 'player-card-name';
        playerName.textContent = player.name;
        
        const playerStats = document.createElement('div');
        playerStats.className = 'player-card-stats';
        playerStats.textContent = `Ort: ${player.average}`;
        
        playerCard.appendChild(selectionIndicator);
        playerCard.appendChild(playerImg);
        playerCard.appendChild(playerName);
        playerCard.appendChild(playerStats);
        
        // Tıklama olayı
        playerCard.addEventListener('click', () => selectPlayer(player));
        
        // Fare olayları
        playerCard.addEventListener('mouseenter', () => {
            // Fare ile üzerine gelindiğinde, bu kartı odakla
            const index = parseInt(playerCard.dataset.index);
            if (gameState.focusedPlayerIndex !== index) {
                gameState.focusedPlayerIndex = index;
                updateFocusedPlayer();
                playSound(sounds.coin);
            }
        });
        
        playerGrid.appendChild(playerCard);
    });
    
    // İlk oyuncuyu aktif yap
    updateFocusedPlayer();
}

// Oyuncu seçimi
function selectPlayer(player) {
    playSound(sounds.select);
    
    if (gameState.activePlayer === 1) {
        if (gameState.player2 && gameState.player2.id === player.id) {
            return; // Aynı oyuncu her iki tarafta da seçilemez
        }
        
        gameState.player1 = player;
        updatePlayerDisplay(1, player);
        gameState.activePlayer = 2;
    } else {
        if (gameState.player1 && gameState.player1.id === player.id) {
            return; // Aynı oyuncu her iki tarafta da seçilemez
        }
        
        gameState.player2 = player;
        updatePlayerDisplay(2, player);
        gameState.activePlayer = 1;
    }
    
    updatePlayerCardSelections();
    updateActivePlayerHighlight();
    checkStartButtonStatus();
}

// Oyuncu bilgilerini güncelle
function updatePlayerDisplay(playerNum, player) {
    if (playerNum === 1) {
        player1Portrait.style.backgroundImage = `url('images/${player.image.replace('.jpg', '-portrait.jpg')}')`;
        player1Name.textContent = player.name;
        player1Average.textContent = player.average;
        player1Checkout.textContent = player.checkout + '%';
        player1Accuracy.textContent = player.accuracy + '%';
    } else {
        player2Portrait.style.backgroundImage = `url('images/${player.image.replace('.jpg', '-portrait.jpg')}')`;
        player2Name.textContent = player.name;
        player2Average.textContent = player.average;
        player2Checkout.textContent = player.checkout + '%';
        player2Accuracy.textContent = player.accuracy + '%';
    }
}

// Oyuncu kart seçimlerini güncelle
function updatePlayerCardSelections() {
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach(card => {
        card.classList.remove('selected', 'selected-player1', 'selected-player2');
        
        const playerId = parseInt(card.dataset.playerId);
        
        if (gameState.player1 && gameState.player1.id === playerId) {
            card.classList.add('selected-player1');
        }
        
        if (gameState.player2 && gameState.player2.id === playerId) {
            card.classList.add('selected-player2');
        }
    });
}

// Aktif oyuncu seçim alanını vurgula
function updateActivePlayerHighlight() {
    // Önce tüm vurgulamaları kaldır
    player1Selection.classList.remove('active-selection');
    player2Selection.classList.remove('active-selection');
    
    // Aktif oyuncunun seçim alanını vurgula
    if (gameState.activePlayer === 1) {
        player1Selection.classList.add('active-selection');
    } else {
        player2Selection.classList.add('active-selection');
    }
}

// Başlat butonunun durumunu kontrol et
function checkStartButtonStatus() {
    if (gameState.player1 && gameState.player2) {
        startMatchButton.disabled = false;
        startMatchButton.classList.add('visible');
    } else {
        startMatchButton.disabled = true;
        startMatchButton.classList.remove('visible');
    }
}

// Odaklanılan oyuncuyu güncelle
function updateFocusedPlayer() {
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach(card => {
        card.classList.remove('focused', 'active', 'hover-effect');
    });
    
    if (playerCards[gameState.focusedPlayerIndex]) {
        playerCards[gameState.focusedPlayerIndex].classList.add('focused');
        playerCards[gameState.focusedPlayerIndex].classList.add('active');
        playerCards[gameState.focusedPlayerIndex].classList.add('hover-effect');
        
        // Görünür alanda olduğundan emin ol (otomatik kaydırma)
        playerCards[gameState.focusedPlayerIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
    
    // Aktif oyuncu vurgulamasını güncelle
    updateActivePlayerHighlight();
}

// Klavye navigasyonu
document.addEventListener('keydown', (e) => {
    const playerCards = document.querySelectorAll('.player-card');
    const gridColumns = 6; // Mobil görünümde değişecek, basitleştirmek için sabit
    const gridRows = Math.ceil(players.length / gridColumns);
    
    let currentRow = Math.floor(gameState.focusedPlayerIndex / gridColumns);
    let currentCol = gameState.focusedPlayerIndex % gridColumns;
    
    switch (e.key) {
        case 'ArrowUp':
            currentRow = (currentRow - 1 + gridRows) % gridRows;
            break;
        case 'ArrowDown':
            currentRow = (currentRow + 1) % gridRows;
            break;
        case 'ArrowLeft':
            currentCol = (currentCol - 1 + gridColumns) % gridColumns;
            break;
        case 'ArrowRight':
            currentCol = (currentCol + 1) % gridColumns;
            break;
        case 'Enter':
            const focusedCard = playerCards[gameState.focusedPlayerIndex];
            if (focusedCard) {
                const playerId = parseInt(focusedCard.dataset.playerId);
                const player = players.find(p => p.id === playerId);
                if (player) {
                    selectPlayer(player);
                }
            }
            break;
        case 'Tab':
            e.preventDefault(); // Tarayıcının varsayılan tab davranışını engelle
            gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
            playSound(sounds.coin);
            updateActivePlayerHighlight();
            break;
        default:
            return;
    }
    
    // Yeni indeksi hesapla
    let newIndex = currentRow * gridColumns + currentCol;
    
    // Geçerli bir indeks olduğundan emin ol
    if (newIndex >= players.length) {
        newIndex = players.length - 1;
    }
    
    if (newIndex !== gameState.focusedPlayerIndex) {
        gameState.focusedPlayerIndex = newIndex;
        updateFocusedPlayer();
        playSound(sounds.coin);
    }
});

// Maça başla
startMatchButton.addEventListener('click', () => {
    playSound(sounds.fight);
    alert(`Maç başlıyor: ${gameState.player1.name} vs ${gameState.player2.name}`);
    // Burada maç ekranına yönlendirme yapılabilir
});

// Sayfa yüklendiğinde oyuncu kartlarını oluştur
document.addEventListener('DOMContentLoaded', () => {
    createPlayerCards();
    updateActivePlayerHighlight(); // Sayfa yüklendiğinde aktif oyuncuyu vurgula
    setupMobileSupport(); // Mobil desteği kur
});

// Mobil cihaz desteği
function setupMobileSupport() {
    // Oyuncu seçim panellerine tıklama olayları ekle
    player1Selection.addEventListener('click', () => {
        if (gameState.activePlayer !== 1) {
            gameState.activePlayer = 1;
            playSound(sounds.coin);
            updateActivePlayerHighlight();
        }
    });
    
    player2Selection.addEventListener('click', () => {
        if (gameState.activePlayer !== 2) {
            gameState.activePlayer = 2;
            playSound(sounds.coin);
            updateActivePlayerHighlight();
        }
    });
    
    // Oyuncu değiştirme butonu
    if (switchPlayerButton) {
        switchPlayerButton.addEventListener('click', () => {
            gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
            playSound(sounds.coin);
            updateActivePlayerHighlight();
        });
    }
    
    // Dokunmatik cihazlar için ek iyileştirmeler
    if (isMobile) {
        // Dokunmatik cihazlarda gezinme için ek destek
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        
        // Dokunmatik cihazlarda çift dokunma yakınlaştırmasını engelle
        document.addEventListener('touchend', function(e) {
            if (e.target.classList.contains('player-card') || 
                e.target.classList.contains('player-selection') ||
                e.target.classList.contains('touch-button')) {
                e.preventDefault();
            }
        }, false);
    }
}

// Dokunmatik kaydırma için değişkenler
let xDown = null;
let yDown = null;

// Dokunmatik başlangıç noktasını kaydet
function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

// Dokunmatik kaydırma yönünü algıla
function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    // Hangi yönde daha fazla kaydırıldığını belirle
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            // Sola kaydırma - sağdaki oyuncuya geç
            simulateKeyPress('ArrowRight');
        } else {
            // Sağa kaydırma - soldaki oyuncuya geç
            simulateKeyPress('ArrowLeft');
        }
    } else {
        if (yDiff > 0) {
            // Yukarı kaydırma - aşağıdaki oyuncuya geç
            simulateKeyPress('ArrowDown');
        } else {
            // Aşağı kaydırma - yukarıdaki oyuncuya geç
            simulateKeyPress('ArrowUp');
        }
    }

    // Değerleri sıfırla
    xDown = null;
    yDown = null;
}

// Tuş basımını simüle et
function simulateKeyPress(key) {
    const event = new KeyboardEvent('keydown', {
        key: key,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
}
