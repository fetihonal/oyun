// Oyun durumu
const gameState = {
    player1: null,
    player2: null,
    activePlayer: 1, // 1 veya 2
    focusedPlayerIndex: 0, // Klavye navigasyonu için odaklanılan oyuncu
    dartMatch: {
        currentPlayer: 1,
        player1Score: 501,
        player2Score: 501,
        throwsLeft: 3,
        gameOver: false
    }
};

// Dart oyuncuları verileri
const players = [
    { id: 1, name: 'Fetih', average: 95.6, checkout: 48, accuracy: 92, image: 'fetih.png' },
    { id: 2, name: 'Göktürk', average: 93.2, checkout: 45, accuracy: 89, image: 'gokturk.png' },

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
    { id: 18, name: 'Sabahi', average: 94.1, checkout: 46, accuracy: 89, image: 'sabahi.jpg' },
    { id: 19, name: 'Mehmet', average: 93.2, checkout: 45, accuracy: 89, image: 'mehmet.jpg' }
];

// Ses efektleri
const sounds = {
    select: new Audio('sounds/select.mp3'),
    coin: new Audio('sounds/coin.mp3'),
    fight: new Audio('sounds/fight.mp3'),
    hover: new Audio('sounds/hover.mp3'),
    perfect: new Audio('sounds/perfect.mp3')
};

// Ses çalma fonksiyonu - bitmesini beklemeden çalar
function playSound(sound) {
    // Sesi durdur ve başa sar
    sound.pause();
    sound.currentTime = 0;
    
    // Ses seviyesini ayarla
    sound.volume = 0.5;
    
    // Sesi çal
    const playPromise = sound.play();
    
    // Tarayıcı desteği için hata kontrolü
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Ses çalma hatası:", error);
        });
    }
}

// Ses efektlerini önceden yükle
function preloadSounds() {
    for (const sound in sounds) {
        sounds[sound].load();
        sounds[sound].volume = 0.5; // Ses seviyesini ayarla
    }
}

// Sayfa yüklendiğinde oyuncu kartlarını oluştur
document.addEventListener('DOMContentLoaded', () => {
    preloadSounds();
    createPlayerCards();
    updateActivePlayerHighlight(); // Sayfa yüklendiğinde aktif oyuncuyu vurgula
    
    // Mevcut event listener'ları koruyoruz
    document.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            playSound(sounds.hover);
        });
    });
    
    // Başlat butonunu kontrol et - sayfa yüklendiğinde devre dışı olmalı
    const startMatchButton = document.getElementById('start-match');
    startMatchButton.disabled = true; // Başlangıçta devre dışı bırak
    
    // Başlat butonuna tıklama olayı ekle
    document.getElementById('start-match').addEventListener('click', function() {
        if (!this.disabled && gameState.player1 && gameState.player2) {
            playSound(sounds.fight);
            
            // Fight animasyonu
            showFightAnimation();
        } else {
            // Eğer oyuncular seçilmemişse uyarı göster
            alert("Lütfen önce iki oyuncu seçin!");
        }
    });
});

// DOM elementleri
const playerGrid = document.getElementById('player-grid');
const player1Selection = document.getElementById('player1-selection');
const player2Selection = document.getElementById('player2-selection');
const player1Portrait = document.getElementById('player1-portrait');
const player2Portrait = document.getElementById('player2-portrait');
const player1Name = document.getElementById('player1-name');
const player2Name = document.getElementById('player2-name');
const player1Average = document.getElementById('player1-average');
const player2Average = document.getElementById('player2-average');
const player1Checkout = document.getElementById('player1-checkout');
const player2Checkout = document.getElementById('player2-checkout');
const player1Accuracy = document.getElementById('player1-accuracy');
const player2Accuracy = document.getElementById('player2-accuracy');
const startMatchButton = document.getElementById('start-match');

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
                playSound(sounds.hover);
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
        
        // Oyuncu seçim sesi çal
        playSound(sounds.coin);
        
        // Seçim animasyonu
        addSelectionAnimation(player1Selection);
    } else {
        if (gameState.player1 && gameState.player1.id === player.id) {
            return; // Aynı oyuncu her iki tarafta da seçilemez
        }
        
        gameState.player2 = player;
        updatePlayerDisplay(2, player);
        gameState.activePlayer = 1;
        
        // Oyuncu seçim sesi çal
        playSound(sounds.coin);
        
        // Seçim animasyonu
        addSelectionAnimation(player2Selection);
    }
    
    updatePlayerCardSelections();
    updateActivePlayerHighlight();
    checkStartButtonStatus();
}

// Oyuncu bilgilerini güncelle
function updatePlayerDisplay(playerNum, player) {
    if (playerNum === 1) {
        player1Portrait.style.backgroundImage = `url('images/${player.image}')`;
        player1Name.textContent = player.name;
        player1Average.textContent = player.average;
        player1Checkout.textContent = player.checkout + '%';
        player1Accuracy.textContent = player.accuracy + '%';
    } else {
        player2Portrait.style.backgroundImage = `url('images/${player.image}')`;
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
        const playerId = parseInt(card.dataset.playerId);
        card.classList.remove('selected-p1', 'selected-p2');
        
        if (gameState.player1 && gameState.player1.id === playerId) {
            card.classList.add('selected-p1');
        }
        
        if (gameState.player2 && gameState.player2.id === playerId) {
            card.classList.add('selected-p2');
        }
    });
}

// Aktif oyuncu seçim alanını vurgula
function updateActivePlayerHighlight() {
    player1Selection.classList.remove('active-selection');
    player2Selection.classList.remove('active-selection');
    
    if (gameState.activePlayer === 1) {
        player1Selection.classList.add('active-selection');
    } else {
        player2Selection.classList.add('active-selection');
    }
}

// Başlat butonunun durumunu kontrol et
function checkStartButtonStatus() {
    console.log("Oyuncu 1:", gameState.player1);
    console.log("Oyuncu 2:", gameState.player2);
    
    if (gameState.player1 && gameState.player2) {
        console.log("İki oyuncu da seçildi, buton aktifleştiriliyor");
        startMatchButton.disabled = false;
        startMatchButton.classList.add('active');
    } else {
        console.log("İki oyuncu seçilmedi, buton devre dışı");
        startMatchButton.disabled = true;
        startMatchButton.classList.remove('active');
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
    }
}

// Klavye navigasyonu
document.addEventListener('keydown', (e) => {
    const playerCards = document.querySelectorAll('.player-card');
    // Masaüstünde 6 sütun
    const columns = 6;
    const totalPlayers = playerCards.length;
    
    let currentIndex = gameState.focusedPlayerIndex;
    let newIndex = currentIndex;
    
    switch (e.key) {
        case 'ArrowRight':
            if (currentIndex < totalPlayers - 1) {
                newIndex = currentIndex + 1;
            }
            break;
        case 'ArrowLeft':
            if (currentIndex > 0) {
                newIndex = currentIndex - 1;
            }
            break;
        case 'ArrowUp':
            if (currentIndex - columns >= 0) {
                newIndex = currentIndex - columns;
            }
            break;
        case 'ArrowDown':
            if (currentIndex + columns < totalPlayers) {
                newIndex = currentIndex + columns;
            }
            break;
        case 'Enter':
            // Enter tuşuna basıldığında odaklanılan oyuncuyu seç
            if (gameState.focusedPlayerIndex >= 0 && gameState.focusedPlayerIndex < players.length) {
                selectPlayer(players[gameState.focusedPlayerIndex]);
            }
            break;
        case 'Tab':
            // Tab tuşuna basıldığında aktif oyuncuyu değiştir
            e.preventDefault(); // Tarayıcının varsayılan tab davranışını engelle
            gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
            updateActivePlayerHighlight();
            break;
    }
    
    if (newIndex !== currentIndex) {
        gameState.focusedPlayerIndex = newIndex;
        updateFocusedPlayer();
        playSound(sounds.hover);
    }
});

// Fight animasyonu göster
function showFightAnimation() {
    const fightOverlay = document.createElement('div');
    fightOverlay.className = 'fight-overlay';
    document.body.appendChild(fightOverlay);
    
    setTimeout(() => {
        const fightText = document.createElement('div');
        fightText.className = 'fight-text';
        fightText.textContent = 'FIGHT!';
        fightOverlay.appendChild(fightText);
        
        // Titreşim efekti
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
        
        // 2 saniye sonra kaldır
        setTimeout(() => {
            fightOverlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(fightOverlay);
                // Fight animasyonundan sonra dart atma animasyonunu başlat
                startDartMatch();
            }, 500);
        }, 2000);
    }, 100);
}

// Dart maçını başlat
function startDartMatch() {
    // Dart maçı alanını oluştur
    createDartMatchArea();
    
    // Dart atma sırasını başlat
    startDartThrowing();
}

// Dart maçı alanını oluştur
function createDartMatchArea() {
    // Mevcut içeriği gizle
    document.querySelector('.player-grid-container').style.display = 'none';
    document.querySelector('.instructions').style.display = 'none';
    document.querySelector('.start-button').style.display = 'none';
    
    // Ana dart maçı alanı
    const dartMatchArea = document.createElement('div');
    dartMatchArea.className = 'dart-match-area';
    
    // Dart tahtası
    const dartBoard = document.createElement('div');
    dartBoard.className = 'dart-board';
    dartBoard.style.backgroundImage = "url('images/board.png')";
    
    // Oyun alanı
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';
    
    // Karakter atış alanı
    const characterArea = document.createElement('div');
    characterArea.className = 'character-throw-area';
    
    // Aktif oyuncu karakteri
    const activeCharacter = document.createElement('div');
    activeCharacter.className = 'active-character';
    activeCharacter.id = 'active-character';
    
    // Dart tahtası alanı
    const dartBoardArea = document.createElement('div');
    dartBoardArea.className = 'dart-board-area';
    dartBoardArea.appendChild(dartBoard);
    
    // Karakter ve dart tahtasını oyun alanına ekle
    characterArea.appendChild(activeCharacter);
    gameArea.appendChild(characterArea);
    gameArea.appendChild(dartBoardArea);
    
    // Skor tablosu alanı - Üstte olacak
    const scoreboardArea = document.createElement('div');
    scoreboardArea.className = 'scoreboard-area';
    
    // Oyuncu 1 skor tablosu
    const player1Scoreboard = document.createElement('div');
    player1Scoreboard.className = 'cricket-scoreboard player1-scoreboard';
    player1Scoreboard.innerHTML = `
        <div class="player-name-header">${gameState.player1.name}</div>
        <div class="cricket-scores">
            <div class="cricket-row">
                <div class="cricket-label">15:</div>
                <div class="cricket-marks" id="p1-15"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">16:</div>
                <div class="cricket-marks" id="p1-16"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">17:</div>
                <div class="cricket-marks" id="p1-17"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">18:</div>
                <div class="cricket-marks" id="p1-18"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">19:</div>
                <div class="cricket-marks" id="p1-19"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">20:</div>
                <div class="cricket-marks" id="p1-20"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">Bull:</div>
                <div class="cricket-marks" id="p1-bull"></div>
            </div>
        </div>
        <div class="player-score-display">
            <div class="score-label">SKOR</div>
            <div class="score-value" id="player1-score">0</div>
        </div>
    `;
    
    // Oyuncu 2 skor tablosu
    const player2Scoreboard = document.createElement('div');
    player2Scoreboard.className = 'cricket-scoreboard player2-scoreboard';
    player2Scoreboard.innerHTML = `
        <div class="player-name-header">${gameState.player2.name}</div>
        <div class="cricket-scores">
            <div class="cricket-row">
                <div class="cricket-label">15:</div>
                <div class="cricket-marks" id="p2-15"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">16:</div>
                <div class="cricket-marks" id="p2-16"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">17:</div>
                <div class="cricket-marks" id="p2-17"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">18:</div>
                <div class="cricket-marks" id="p2-18"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">19:</div>
                <div class="cricket-marks" id="p2-19"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">20:</div>
                <div class="cricket-marks" id="p2-20"></div>
            </div>
            <div class="cricket-row">
                <div class="cricket-label">Bull:</div>
                <div class="cricket-marks" id="p2-bull"></div>
            </div>
        </div>
        <div class="player-score-display">
            <div class="score-label">SKOR</div>
            <div class="score-value" id="player2-score">0</div>
        </div>
    `;
    
    // Skor tablolarını skor alanına ekle
    scoreboardArea.appendChild(player1Scoreboard);
    scoreboardArea.appendChild(player2Scoreboard);
    
    // Oyuncu alanları - Altta olacak
    const player1Area = document.createElement('div');
    player1Area.className = 'player-dart-area player1-area';
    player1Area.innerHTML = `
        <div class="player-info-compact">
            <div class="player-dart-portrait" id="player1-dart-portrait"></div>
            <div class="player-info-text">
                <div class="player-dart-name">${gameState.player1.name}</div>
                <div class="throws-left" id="p1-throws">Atış: 3</div>
            </div>
        </div>
    `;
    
    const player2Area = document.createElement('div');
    player2Area.className = 'player-dart-area player2-area';
    player2Area.innerHTML = `
        <div class="player-info-compact">
            <div class="player-dart-portrait" id="player2-dart-portrait"></div>
            <div class="player-info-text">
                <div class="player-dart-name">${gameState.player2.name}</div>
                <div class="throws-left" id="p2-throws">Atış: 0</div>
            </div>
        </div>
    `;
    
    // Oyuncu alanlarını, skor tablosunu ve oyun alanını dart maçı alanına ekle
    dartMatchArea.appendChild(scoreboardArea);
    dartMatchArea.appendChild(gameArea);
    dartMatchArea.appendChild(player1Area);
    dartMatchArea.appendChild(player2Area);
    
    // Dart maçı alanını sayfaya ekle
    document.querySelector('.container').appendChild(dartMatchArea);
    
    // Oyuncu portrelerini ayarla
    document.getElementById('player1-dart-portrait').style.backgroundImage = `url('images/${gameState.player1.image}')`;
    document.getElementById('player2-dart-portrait').style.backgroundImage = `url('images/${gameState.player2.image}')`;
    
    // Cricket puanlama sistemini başlat
    initCricketScoring();
    
    // Karakter görselini güncelle
    updateCharacterVisual();
    
    // Mobil için dokunmatik olayları ekle
    setupMobileControls();
}

// Cricket puanlama sistemini başlat
function initCricketScoring() {
    // Cricket sayıları
    const cricketNumbers = [15, 16, 17, 18, 19, 20, 'bull'];
    
    // Cricket puanlama sistemi
    gameState.dartMatch.player1Cricket = {};
    gameState.dartMatch.player2Cricket = {};
    
    // Her sayı için başlangıç değeri 0
    cricketNumbers.forEach(number => {
        gameState.dartMatch.player1Cricket[number] = 0;
        gameState.dartMatch.player2Cricket[number] = 0;
    });
    
    // Atılan dartları takip et
    gameState.dartMatch.dartsThrown = [];
    
    // Puanları sıfırla
    gameState.dartMatch.player1Score = 0;
    gameState.dartMatch.player2Score = 0;
    
    // Skorları güncelle
    document.getElementById('player1-score').textContent = '0';
    document.getElementById('player2-score').textContent = '0';
}

// Mobil kontrolleri ayarla
function setupMobileControls() {
    const activeCharacter = document.getElementById('active-character');
    const dartBoardArea = document.querySelector('.dart-board-area');
    
    // Karakter tıklandığında dart atma
    activeCharacter.addEventListener('click', handleCharacterTap);
    activeCharacter.addEventListener('touchstart', handleCharacterTap);
    
    // Dokunmatik cihazlar için hover efekti
    activeCharacter.addEventListener('touchstart', function() {
        this.classList.add('character-hover');
    });
    
    activeCharacter.addEventListener('touchend', function() {
        this.classList.remove('character-hover');
    });
}

// Karakter tıklandığında
function handleCharacterTap(e) {
    e.preventDefault();
    
    if (gameState.dartMatch.throwsLeft > 0 && !gameState.dartMatch.gameOver) {
        // Karakterin atış animasyonu
        const activeCharacter = document.getElementById('active-character');
        activeCharacter.classList.add('character-throwing');
        
        // Atış sesi çal
        playSound(sounds.select);
        
        // Titreşim efekti
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
        
        // Kısa bir gecikme sonra dart at
        setTimeout(() => {
            throwDart();
            activeCharacter.classList.remove('character-throwing');
        }, 300);
    }
}

// Karakter görselini güncelle
function updateCharacterVisual() {
    const activeCharacter = document.getElementById('active-character');
    const currentPlayer = gameState.dartMatch.currentPlayer;
    const player = currentPlayer === 1 ? gameState.player1 : gameState.player2;
    
    // Karakter görselini ayarla
    activeCharacter.style.backgroundImage = `url('images/${player.image}')`;
    
    // Oyuncuya göre sınıf ekle
    activeCharacter.className = 'active-character';
    activeCharacter.classList.add(`player${currentPlayer}-character`);
    
    // Atış sayısını göster
    const throwsIndicator = document.createElement('div');
    throwsIndicator.className = 'throws-indicator';
    throwsIndicator.textContent = `${gameState.dartMatch.throwsLeft}`;
    
    // Mevcut göstergeyi kaldır ve yenisini ekle
    const oldIndicator = activeCharacter.querySelector('.throws-indicator');
    if (oldIndicator) {
        activeCharacter.removeChild(oldIndicator);
    }
    activeCharacter.appendChild(throwsIndicator);
    
    // Mobil için ipucu göster
    const mobileHint = document.createElement('div');
    mobileHint.className = 'mobile-hint';
    mobileHint.textContent = 'Atmak için dokun';
    
    // Mevcut ipucunu kaldır ve yenisini ekle
    const oldHint = activeCharacter.querySelector('.mobile-hint');
    if (oldHint) {
        activeCharacter.removeChild(oldHint);
    }
    activeCharacter.appendChild(mobileHint);
}

// Dart atma sırasını başlat
function startDartThrowing() {
    clearDartsFromBoard(); // Yeni tur başladığında tüm dartları temizle
    updateCurrentPlayerHighlight();
    updateThrowsLeft();
    updateCharacterVisual();
}

// Atış sayısını güncelle
function updateThrowsLeft() {
    document.getElementById('p1-throws').textContent = `Atış: ${gameState.dartMatch.currentPlayer === 1 ? gameState.dartMatch.throwsLeft : 0}`;
    document.getElementById('p2-throws').textContent = `Atış: ${gameState.dartMatch.currentPlayer === 2 ? gameState.dartMatch.throwsLeft : 0}`;
}

// Aktif oyuncuyu vurgula
function updateCurrentPlayerHighlight() {
    const player1Area = document.querySelector('.player1-area');
    const player2Area = document.querySelector('.player2-area');
    
    if (gameState.dartMatch.currentPlayer === 1) {
        player1Area.classList.add('active-player');
        player2Area.classList.remove('active-player');
    } else {
        player1Area.classList.remove('active-player');
        player2Area.classList.add('active-player');
    }
}

// Dart at
function throwDart() {
    if (gameState.dartMatch.throwsLeft <= 0 || gameState.dartMatch.gameOver) return;
    
    const dartBoard = document.querySelector('.dart-board');
    const boardRect = dartBoard.getBoundingClientRect();
    
    // Dart tahtasının merkezini bul
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;
    
    // Rastgele bir hedef belirle (oyuncu beceri seviyesine göre)
    const player = gameState.dartMatch.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const accuracy = player.accuracy / 100; // 0 ile 1 arasında bir değer
    
    // Hedef sayıyı belirle (Cricket için 15-20 ve bull)
    let targetNumber;
    const availableTargets = [];
    
    // Oyuncunun henüz kapatmadığı sayıları bul
    const playerCricket = gameState.dartMatch.currentPlayer === 1 
        ? gameState.dartMatch.player1Cricket 
        : gameState.dartMatch.player2Cricket;
    
    // Rakibin kapatmadığı sayıları bul
    const opponentCricket = gameState.dartMatch.currentPlayer === 1 
        ? gameState.dartMatch.player2Cricket 
        : gameState.dartMatch.player1Cricket;
    
    // Stratejik hedefleme
    for (const number in playerCricket) {
        if (playerCricket[number] < 3) {
            // Henüz kapatılmamış sayılar
            availableTargets.push({
                number: number,
                priority: 3 - playerCricket[number] // Kapatmaya ne kadar yakınsa o kadar öncelikli
            });
        } else if (opponentCricket[number] < 3) {
            // Kapatılmış ama rakip kapatmamış, puan alınabilecek sayılar
            availableTargets.push({
                number: number,
                priority: 2 // Puan almak için ikinci öncelik
            });
        }
    }
    
    // Eğer hedeflenecek sayı yoksa, rastgele bir Cricket sayısı seç
    if (availableTargets.length === 0) {
        const cricketNumbers = [15, 16, 17, 18, 19, 20, 'bull'];
        targetNumber = cricketNumbers[Math.floor(Math.random() * cricketNumbers.length)];
    } else {
        // Önceliğe göre sırala
        availableTargets.sort((a, b) => b.priority - a.priority);
        
        // Biraz rastgelelik ekle ama yüksek öncelikli hedefleri seçme olasılığını artır
        const randomIndex = Math.floor(Math.random() * Math.min(3, availableTargets.length));
        targetNumber = availableTargets[randomIndex].number;
    }
    
    // Hedef sayının konumunu belirle
    let targetX, targetY;
    
    if (targetNumber === 'bull') {
        // Bullseye hedefi
        targetX = centerX;
        targetY = centerY;
    } else {
        // Sayı hedefi (basitleştirilmiş)
        const angle = (parseInt(targetNumber) - 13) * (Math.PI / 10); // Sayıya göre açı
        const distance = boardRect.width * 0.35; // Merkezden uzaklık
        
        targetX = centerX + Math.cos(angle) * distance;
        targetY = centerY + Math.sin(angle) * distance;
    }
    
    // Beceri seviyesine göre sapma ekle
    const maxDeviation = 30 * (1 - accuracy); // Maksimum sapma (piksel)
    const deviationX = (Math.random() * 2 - 1) * maxDeviation;
    const deviationY = (Math.random() * 2 - 1) * maxDeviation;
    
    const hitX = targetX + deviationX;
    const hitY = targetY + deviationY;
    
    // Dart oku oluştur
    const dart = document.createElement('div');
    dart.className = 'dart';
    
    // Oyuncuya göre dart rengi
    dart.classList.add(gameState.dartMatch.currentPlayer === 1 ? 'player1-dart' : 'player2-dart');
    
    // Dart şaft ve kanatlarını ekle
    dart.innerHTML = `
        <div class="dart-shaft"></div>
        <div class="dart-flight"></div>
    `;
    
    // Dartı tahtaya yerleştir
    dartBoard.appendChild(dart);
    
    // Dartın başlangıç pozisyonu (karakter elinden)
    const character = document.getElementById('active-character');
    const characterRect = character.getBoundingClientRect();
    const dartBoardRect = dartBoard.getBoundingClientRect();
    
    const startX = (characterRect.left + characterRect.width / 2) - dartBoardRect.left;
    const startY = (characterRect.top + characterRect.height / 3) - dartBoardRect.top;
    
    dart.style.left = `${startX}px`;
    dart.style.top = `${startY}px`;
    
    // Atış animasyonu
    setTimeout(() => {
        // Dart uçuş animasyonu
        dart.style.transition = 'all 0.3s ease-out';
        dart.style.left = `${hitX}px`;
        dart.style.top = `${hitY}px`;
        dart.style.transform = 'rotate(0deg) scale(1)';
        
        // Atış sesi
        playSound(sounds.select);
        
        // Titreşim efekti
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
        
        // Dart tahtaya saplandığında
        setTimeout(() => {
            // Dart saplanma efekti
            dart.classList.add('dart-hit');
            
            // Cricket puanını hesapla
            const result = calculateCricketScore(targetNumber, hitX, hitY, boardRect);
            
            // İsabet eden sayıyı göster
            if (result.hit) {
                showHitNumber(result.number, result.multiplier);
                
                // Cricket puanını güncelle
                updateCricketScore(result.number, result.multiplier);
            } else {
                // Iskaladı
                showHitNumber('Iskaladı', 0);
                
                // Cezalı Cricket ise ceza puanı ekle
                if (gameState.dartMatch.penaltyCricket) {
                    const penalty = -5; // Iskalama cezası
                    addPoints(gameState.dartMatch.currentPlayer, penalty);
                    
                    // Ceza animasyonu
                    showPenaltyAnimation(gameState.dartMatch.currentPlayer, penalty);
                }
            }
            
            // Atış sayısını azalt
            gameState.dartMatch.throwsLeft--;
            updateThrowsLeft();
            
            // Atılan dartı kaydet
            gameState.dartMatch.dartsThrown.push({
                player: gameState.dartMatch.currentPlayer,
                x: hitX,
                y: hitY,
                result: result
            });
            
            // Atış bittiyse sırayı değiştir
            if (gameState.dartMatch.throwsLeft <= 0) {
                // Kısa bir bekleme sonra sırayı değiştir
                setTimeout(() => {
                    // Sırayı değiştir
                    gameState.dartMatch.currentPlayer = gameState.dartMatch.currentPlayer === 1 ? 2 : 1;
                    gameState.dartMatch.throwsLeft = 3;
                    
                    // Tahtadaki dartları temizle
                    clearDartsFromBoard();
                    
                    // Yeni oyuncuyu vurgula
                    updateCurrentPlayerHighlight();
                    updateThrowsLeft();
                    updateCharacterVisual();
                    
                    // Oyun bitti mi kontrol et
                    checkGameOver();
                }, 1500);
            }
        }, 300);
    }, 100);
}

// Tahtadaki dartları temizle
function clearDartsFromBoard() {
    // Tüm dartları temizle, sadece son 3 değil
    const dartElements = document.querySelectorAll('.dart');
    
    dartElements.forEach(dart => {
        if (dart && dart.parentNode) {
            dart.parentNode.removeChild(dart);
        }
    });
    
    // Dart listesini tamamen temizle
    gameState.dartMatch.dartsThrown = [];
}

// Cricket puanını hesapla
function calculateCricketScore(targetNumber, hitX, hitY, boardRect) {
    const boardCenterX = boardRect.width / 2;
    const boardCenterY = boardRect.height / 2;
    
    // Merkeze olan uzaklık
    const distance = Math.sqrt(
        Math.pow(hitX - boardCenterX, 2) + 
        Math.pow(hitY - boardCenterY, 2)
    );
    
    // Tahtanın yarıçapı
    const boardRadius = boardRect.width / 2;
    
    // Uzaklığa göre çarpan belirle
    let multiplier = 1;
    
    if (distance > boardRadius * 0.85 && distance < boardRadius * 0.95) {
        // Dış çift
        multiplier = 2;
    } else if (distance > boardRadius * 0.5 && distance < boardRadius * 0.6) {
        // İç üçlü
        multiplier = 3;
    }
    
    // İsabet eden sayıyı göster
    return {
        hit: true,
        number: targetNumber,
        multiplier: multiplier
    };
}

// İsabet eden sayıyı göster
function showHitNumber(number, multiplier) {
    const hitText = document.createElement('div');
    hitText.className = 'hit-text';
    hitText.textContent = `${number} x${multiplier}`;
    hitText.style.color = multiplier === 3 ? '#ff0000' : multiplier === 2 ? '#00ff00' : '#ffffff';
    
    document.body.appendChild(hitText);
    
    // Animasyon
    setTimeout(() => {
        hitText.style.opacity = '0';
        hitText.style.transform = 'translateY(-50px)';
        
        setTimeout(() => {
            document.body.removeChild(hitText);
        }, 1000);
    }, 500);
}

// Cricket puanını güncelle
function updateCricketScore(number, multiplier) {
    const currentPlayer = gameState.dartMatch.currentPlayer;
    const playerCricket = currentPlayer === 1 ? gameState.dartMatch.player1Cricket : gameState.dartMatch.player2Cricket;
    const opponentCricket = currentPlayer === 1 ? gameState.dartMatch.player2Cricket : gameState.dartMatch.player1Cricket;
    
    // Mevcut işaretleri al
    let currentMarks = playerCricket[number];
    
    // Yeni işaretleri ekle (en fazla 3 olabilir)
    const newMarks = Math.min(currentMarks + multiplier, 3);
    playerCricket[number] = newMarks;
    
    // İşaretleri göster
    updateCricketMarks(currentPlayer, number, newMarks);
    
    // Puan hesapla
    if (newMarks === 3 && currentMarks < 3) {
        // Sayı yeni kapatıldı, kapatma animasyonu göster
        showClosedAnimation(number, currentPlayer);
    }
    
    // Eğer sayı kapatıldıysa ve rakip kapatmadıysa puan ekle
    if (newMarks === 3 && opponentCricket[number] < 3) {
        // Fazladan işaretler puan olarak eklenir
        const extraMarks = (currentMarks + multiplier) - 3;
        if (extraMarks > 0) {
            // Puan ekle
            const pointsToAdd = extraMarks * (number === 'bull' ? 25 : number);
            addPoints(currentPlayer, pointsToAdd);
        }
    }
    
    // Cezalı Cricket: Eğer hedeflenen sayı cricket sayısı değilse veya ıskalandıysa ceza puanı ekle
    if (!['15', '16', '17', '18', '19', '20', 'bull'].includes(number.toString())) {
        // Ceza puanı (rastgele 5-15 arası)
        const penalty = Math.floor(Math.random() * 11) + 5;
        addPoints(currentPlayer === 1 ? 2 : 1, penalty);
        
        // Ceza animasyonu göster
        showPenaltyAnimation(currentPlayer, penalty);
    }
}

// Ceza animasyonu göster
function showPenaltyAnimation(player, penalty) {
    const penaltyText = document.createElement('div');
    penaltyText.className = 'penalty-text';
    penaltyText.textContent = `CEZA: +${penalty}`;
    penaltyText.style.color = '#ff0000';
    
    const opponentArea = document.querySelector(`.player${player === 1 ? 2 : 1}-area`);
    opponentArea.appendChild(penaltyText);
    
    // Animasyon
    setTimeout(() => {
        penaltyText.style.opacity = '0';
        penaltyText.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            opponentArea.removeChild(penaltyText);
        }, 800);
    }, 800);
}

// Sayı kapatma animasyonu göster
function showClosedAnimation(number, player) {
    const closedText = document.createElement('div');
    closedText.className = 'closed-animation';
    closedText.textContent = `${number} KAPANDI!`;
    closedText.style.color = player === 1 ? '#0066ff' : '#ff0000';
    
    const playerArea = document.querySelector(`.player${player}-area`);
    playerArea.appendChild(closedText);
    
    // Perfect sesi çal
    playSound(sounds.perfect);
    
    // Titreşim efekti
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
    }
    
    // Animasyon
    setTimeout(() => {
        closedText.style.opacity = '0';
        closedText.style.transform = 'scale(1.5)';
        
        setTimeout(() => {
            playerArea.removeChild(closedText);
        }, 1000);
    }, 1000);
}

// Cricket işaretlerini güncelle
function updateCricketMarks(player, number, marks) {
    const markElement = document.getElementById(`p${player}-${number}`);
    
    // İşaretleri temizle
    markElement.innerHTML = '';
    
    // Yeni işaretleri ekle
    for (let i = 0; i < marks; i++) {
        const mark = document.createElement('span');
        mark.className = 'cricket-mark';
        mark.innerHTML = i === 2 ? '&#10005;' : '&#47;'; // Son işaret X, diğerleri /
        markElement.appendChild(mark);
    }
}

// Puan ekle
function addPoints(player, points) {
    if (player === 1) {
        gameState.dartMatch.player1Score += points;
        document.getElementById('player1-score').textContent = gameState.dartMatch.player1Score;
    } else {
        gameState.dartMatch.player2Score += points;
        document.getElementById('player2-score').textContent = gameState.dartMatch.player2Score;
    }
}

// Oyun bitti mi kontrol et
function checkGameOver() {
    const p1Cricket = gameState.dartMatch.player1Cricket;
    const p2Cricket = gameState.dartMatch.player2Cricket;
    
    // Tüm sayılar kapatıldı mı kontrol et
    const p1Closed = Object.values(p1Cricket).every(marks => marks >= 3);
    const p2Closed = Object.values(p2Cricket).every(marks => marks >= 3);
    
    if ((p1Closed || p2Closed) && gameState.dartMatch.player1Score !== gameState.dartMatch.player2Score) {
        // Oyun bitti
        gameState.dartMatch.gameOver = true;
        
        // Kazananı belirle
        let winner;
        if (p1Closed && gameState.dartMatch.player1Score >= gameState.dartMatch.player2Score) {
            winner = gameState.player1.name;
        } else if (p2Closed && gameState.dartMatch.player2Score >= gameState.dartMatch.player1Score) {
            winner = gameState.player2.name;
        } else if (gameState.dartMatch.player1Score > gameState.dartMatch.player2Score) {
            winner = gameState.player1.name;
        } else {
            winner = gameState.player2.name;
        }
        
        // Kazanan animasyonu göster
        showWinnerAnimation(winner);
        
        // Yeni oyun butonunu göster
        document.getElementById('new-game-button').style.display = 'block';
        document.getElementById('throw-dart-button').style.display = 'none';
    }
}

// Kazanan animasyonu göster
function showWinnerAnimation(winner) {
    const winnerOverlay = document.createElement('div');
    winnerOverlay.className = 'winner-overlay';
    
    const winnerText = document.createElement('div');
    winnerText.className = 'winner-text';
    winnerText.textContent = `${winner} KAZANDI!`;
    
    const winnerDetails = document.createElement('div');
    winnerDetails.className = 'winner-details';
    
    // Kazananın skorunu ve kapatılan sayıları göster
    const player1Score = gameState.dartMatch.player1Score;
    const player2Score = gameState.dartMatch.player2Score;
    const player1Name = gameState.player1.name;
    const player2Name = gameState.player2.name;
    
    // Hangi oyuncunun kazandığını belirle
    const winnerPlayer = winner === player1Name ? 1 : 2;
    const loserPlayer = winnerPlayer === 1 ? 2 : 1;
    const winnerScore = winnerPlayer === 1 ? player1Score : player2Score;
    const loserScore = winnerPlayer === 1 ? player2Score : player1Score;
    
    // Kazanan detaylarını göster
    winnerDetails.innerHTML = `
        <div class="winner-score">Skor: ${winnerScore} - ${loserScore}</div>
        <div class="winner-stats">Fark: ${Math.abs(winnerScore - loserScore)} puan</div>
    `;
    
    winnerOverlay.appendChild(winnerText);
    winnerOverlay.appendChild(winnerDetails);
    document.body.appendChild(winnerOverlay);
    
    // Zafer sesi çal
    playSound(sounds.fight);
    
    // Titreşim efekti
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    // Animasyon
    setTimeout(() => {
        winnerOverlay.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(winnerOverlay);
        }, 1000);
    }, 4000);
}

// Oyuncu seçimi için Street Fighter tarzı ses efektleri ve animasyonlar
function addSelectionAnimation(element) {
    element.classList.add('character-selected');
    setTimeout(() => {
        element.classList.remove('character-selected');
    }, 1000);
}

// Oyunu sıfırla
function resetGame() {
    // Dart maçı alanını kaldır
    const dartMatchArea = document.getElementById('dart-match-area');
    const dartButtons = document.querySelector('.dart-buttons');
    
    if (dartMatchArea) {
        dartMatchArea.parentNode.removeChild(dartMatchArea);
    }
    
    if (dartButtons) {
        dartButtons.parentNode.removeChild(dartButtons);
    }
    
    // Gizlenen içeriği göster
    document.querySelector('.player-grid-container').style.display = 'block';
    document.querySelector('.instructions').style.display = 'block';
    document.querySelector('.start-button-container').style.display = 'block';
    
    // Oyuncu seçimlerini sıfırla
    gameState.player1 = null;
    gameState.player2 = null;
    gameState.activePlayer = 1;
    
    // Oyuncu görüntülerini sıfırla
    player1Portrait.style.backgroundImage = '';
    player2Portrait.style.backgroundImage = '';
    player1Name.textContent = 'Seçilmedi';
    player2Name.textContent = 'Seçilmedi';
    player1Average.textContent = '-';
    player2Average.textContent = '-';
    player1Checkout.textContent = '-';
    player2Checkout.textContent = '-';
    player1Accuracy.textContent = '-';
    player2Accuracy.textContent = '-';
    
    // Başlat butonunu devre dışı bırak ama görünür tut
    startMatchButton.disabled = true;
    startMatchButton.style.display = 'block';
    
    // Oyuncu kart seçimlerini güncelle
    updatePlayerCardSelections();
}

// Dart atışını başlat
function startDartThrowing() {
    // Tüm dartları tahtadan temizle
    clearDartsFromBoard();
    
    // Aktif oyuncuyu ayarla
    gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
    gameState.throwsLeft = 3;
    
    // Atış sayısını güncelle
    document.getElementById(`p${gameState.activePlayer}-throws`).textContent = `Atış: ${gameState.throwsLeft}`;
    document.getElementById(`p${gameState.activePlayer === 1 ? 2 : 1}-throws`).textContent = `Atış: 0`;
    
    // Karakter görselini güncelle
    updateCharacterVisual();
    
    // Mobil için ipucu göster
    showMobileHint();
}

// Dartları tahtadan temizle
function clearDartsFromBoard() {
    // Tüm dartları seç
    const allDarts = document.querySelectorAll('.dart');
    
    // Her bir dartı kaldır
    allDarts.forEach(dart => {
        dart.remove();
    });
    
    // Dart sayacını sıfırla
    gameState.dartsOnBoard = [];
}
