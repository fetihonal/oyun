// Oyun durumu
const gameState = {
    player1: null,
    player2: null,
    activePlayer: 1,
    throwsLeft: 3,
    dartsOnBoard: [],
    cricketScores: {
        player1: {
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            'bull': 0
        },
        player2: {
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            'bull': 0
        }
    },
    scores: {
        player1: 0,
        player2: 0
    },
    gameOver: false,
    focusedPlayerIndex: 0 // Klavye navigasyonu için odaklanılan oyuncu
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
    confirm: new Audio('sounds/confirm.mp3'),
    throw: new Audio('sounds/ok.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    miss: new Audio('sounds/miss.mp3'),
    perfect: new Audio('sounds/perfect.mp3'),
    win: new Audio('sounds/win.mp3'),
    fight: new Audio('sounds/fight.mp3'),
    coin: new Audio('sounds/coin.mp3'),
    hover: new Audio('sounds/hover.mp3')
};

// Ses çalma fonksiyonu - bitmesini beklemeden çalar
function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.volume = 0.5;
    
    const playPromise = sound.play();
    
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
    const dartMatchArea = document.querySelector('.dart-match-area');
    
    if (dartMatchArea) {
        dartMatchArea.parentNode.removeChild(dartMatchArea);
    }
    
    // Gizlenen içeriği göster
    document.querySelector('.player-grid-container').style.display = 'block';
    document.querySelector('.instructions').style.display = 'block';
    document.querySelector('.start-button').style.display = 'block';
    
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
    startMatchButton.classList.remove('active');
    
    // Oyuncu kart seçimlerini güncelle
    updatePlayerCardSelections();
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
    player1Area.id = 'player1-area';
    player1Area.innerHTML = `
        <div class="player-info-compact">
            <div class="player-dart-portrait" id="player1-dart-portrait"></div>
            <div class="player-info-text">
                <div class="player-dart-name">${gameState.player1.name}</div>
            </div>
        </div>
    `;
    
    const player2Area = document.createElement('div');
    player2Area.className = 'player-dart-area player2-area';
    player2Area.id = 'player2-area';
    player2Area.innerHTML = `
        <div class="player-info-compact">
            <div class="player-dart-portrait" id="player2-dart-portrait"></div>
            <div class="player-info-text">
                <div class="player-dart-name">${gameState.player2.name}</div>
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
    
    // Oyuncu animasyonlarını ayarla
    updatePlayerAnimations();
}

// Karakter görselini güncelle
function updateCharacterVisual() {
    const activeCharacter = document.getElementById('active-character');
    const activePlayerData = gameState.activePlayer === 1 ? gameState.player1 : gameState.player2;
    
    activeCharacter.style.backgroundImage = `url('images/${activePlayerData.image}')`;
    
    if (gameState.activePlayer === 1) {
        activeCharacter.className = 'active-character player1-character';
    } else {
        activeCharacter.className = 'active-character player2-character';
    }
    
    // Oyuncu animasyonlarını güncelle
    updatePlayerAnimations();
}

// Oyuncu animasyonlarını güncelle
function updatePlayerAnimations() {
    const player1Area = document.getElementById('player1-area');
    const player2Area = document.getElementById('player2-area');
    
    if (gameState.activePlayer === 1) {
        player1Area.className = 'player-dart-area player1-area player-active';
        player2Area.className = 'player-dart-area player2-area player-inactive';
    } else {
        player1Area.className = 'player-dart-area player1-area player-inactive';
        player2Area.className = 'player-dart-area player2-area player-active';
    }
}

// Dart at
function throwDart() {
    if (gameState.throwsLeft <= 0 || gameState.gameOver) return;
    
    // Atış animasyonu
    const activeCharacter = document.getElementById('active-character');
    activeCharacter.classList.add('character-throwing');
    
    // Atış sesi
    playSound(sounds.throw);
    
    // Atış sonucunu hesapla
    const result = calculateDartHit();
    
    // Dart oku oluştur
    createDartOnBoard(result.x, result.y);
    
    // Sonucu göster
    setTimeout(() => {
        activeCharacter.classList.remove('character-throwing');
        
        if (result.hit) {
            showHitNumber(result.number, result.multiplier);
            updateCricketScore(result.number, result.multiplier);
        } else {
            showHitNumber('Iskaladı', 0);
        }
        
        // Atış sayısını azalt
        gameState.throwsLeft--;
        
        // Atış bittiyse sırayı diğer oyuncuya geçir
        if (gameState.throwsLeft <= 0) {
            setTimeout(() => {
                startDartThrowing();
            }, 1500);
        }
    }, 500);
}

// İsabet numarasını göster
function showHitNumber(number, multiplier) {
    const dartBoard = document.querySelector('.dart-board');
    const hitNumber = document.createElement('div');
    hitNumber.className = 'hit-number';
    
    // Multiplier'a göre renk belirle
    let color = '#ffcc00';
    if (multiplier === 2) color = '#ff0000';
    if (multiplier === 3) color = '#00ff00';
    
    hitNumber.style.color = color;
    
    // İsabet edilen sayıyı göster
    if (multiplier > 1) {
        hitNumber.textContent = `${multiplier}x ${number}`;
    } else {
        hitNumber.textContent = number;
    }
    
    // Rastgele bir konum belirle
    const randomX = Math.random() * 60 - 30;
    const randomY = Math.random() * 60 - 30;
    
    hitNumber.style.left = `calc(50% + ${randomX}px)`;
    hitNumber.style.top = `calc(50% + ${randomY}px)`;
    
    dartBoard.appendChild(hitNumber);
    
    // Belirli bir süre sonra kaldır
    setTimeout(() => {
        if (hitNumber.parentNode === dartBoard) {
            dartBoard.removeChild(hitNumber);
        }
    }, 1500);
}

// Dart atışını başlat
function startDartThrowing() {
    // Tüm dartları tahtadan temizle
    clearDartsFromBoard();
    
    // Aktif oyuncuyu ayarla
    gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
    gameState.throwsLeft = 3;
    
    // Karakter görselini güncelle
    updateCharacterVisual();
    
    // Mobil için ipucu göster
    showMobileHint();
}

// Mobil için ipucu göster
function showMobileHint() {
    const dartBoardArea = document.querySelector('.dart-board-area');
    
    // Mevcut ipucu varsa kaldır
    const oldHint = dartBoardArea.querySelector('.mobile-hint');
    if (oldHint) {
        dartBoardArea.removeChild(oldHint);
    }
    
    // Yeni ipucu ekle
    const mobileHint = document.createElement('div');
    mobileHint.className = 'mobile-hint';
    mobileHint.textContent = 'Atmak için karaktere dokun';
    dartBoardArea.appendChild(mobileHint);
    
    // 3 saniye sonra ipucunu kaldır
    setTimeout(() => {
        if (mobileHint.parentNode === dartBoardArea) {
            mobileHint.style.opacity = '0';
            setTimeout(() => {
                if (mobileHint.parentNode === dartBoardArea) {
                    dartBoardArea.removeChild(mobileHint);
                }
            }, 500);
        }
    }, 3000);
}

// Tahtadaki dartları temizle
function clearDartsFromBoard() {
    // Tüm dartları temizle
    const darts = document.querySelectorAll('.dart');
    darts.forEach(dart => {
        if (dart.parentNode) {
            dart.parentNode.removeChild(dart);
        }
    });
    
    // Dart listesini temizle
    gameState.dartsOnBoard = [];
}

// Dart hesaplama
function calculateDartHit() {
    const dartBoard = document.querySelector('.dart-board');
    const boardRect = dartBoard.getBoundingClientRect();
    
    // Tahtanın merkezi
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;
    
    // Aktif oyuncu
    const player = gameState.activePlayer === 1 ? gameState.player1 : gameState.player2;
    
    // Hedef sayı (Cricket için 15-20 ve bull)
    const cricketNumbers = [15, 16, 17, 18, 19, 20, 'bull'];
    const targetNumber = cricketNumbers[Math.floor(Math.random() * cricketNumbers.length)];
    
    // Hedef konumu
    let targetX, targetY;
    
    if (targetNumber === 'bull') {
        // Bullseye hedefi
        targetX = centerX;
        targetY = centerY;
    } else {
        // Sayı hedefi
        const angle = (parseInt(targetNumber) - 13) * (Math.PI / 10);
        const distance = boardRect.width * 0.35;
        
        targetX = centerX + Math.cos(angle) * distance;
        targetY = centerY + Math.sin(angle) * distance;
    }
    
    // Rastgele sapma
    const maxDeviation = 30;
    const deviationX = (Math.random() * 2 - 1) * maxDeviation;
    const deviationY = (Math.random() * 2 - 1) * maxDeviation;
    
    const hitX = targetX + deviationX;
    const hitY = targetY + deviationY;
    
    // Çarpan hesapla
    const distance = Math.sqrt(
        Math.pow(hitX - centerX, 2) + 
        Math.pow(hitY - centerY, 2)
    );
    
    const boardRadius = boardRect.width / 2;
    let multiplier = 1;
    
    if (distance > boardRadius * 0.85 && distance < boardRadius * 0.95) {
        // Dış çift
        multiplier = 2;
    } else if (distance > boardRadius * 0.5 && distance < boardRadius * 0.6) {
        // İç üçlü
        multiplier = 3;
    }
    
    // Iskaladı mı kontrol et
    const hit = distance < boardRadius;
    
    return {
        hit: hit,
        x: hitX,
        y: hitY,
        number: targetNumber,
        multiplier: multiplier
    };
}

// Dart oku oluştur
function createDartOnBoard(x, y) {
    const dartBoard = document.querySelector('.dart-board');
    
    // Dart oku oluştur
    const dart = document.createElement('div');
    dart.className = 'dart';
    dart.classList.add(gameState.activePlayer === 1 ? 'player1-dart' : 'player2-dart');
    
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
    
    // Dart uçuş animasyonu
    setTimeout(() => {
        dart.style.transition = 'all 0.3s ease-out';
        dart.style.left = `${x}px`;
        dart.style.top = `${y}px`;
        dart.style.transform = 'rotate(0deg) scale(1)';
        
        // Dart saplanma efekti
        setTimeout(() => {
            dart.classList.add('dart-hit');
            
            // Dartı listeye ekle
            gameState.dartsOnBoard.push(dart);
        }, 300);
    }, 100);
}

// Cricket puanını güncelle
function updateCricketScore(number, multiplier) {
    const currentPlayer = `player${gameState.activePlayer}`;
    const opponentPlayer = `player${gameState.activePlayer === 1 ? 2 : 1}`;
    
    // Mevcut işaretleri al
    let currentMarks = gameState.cricketScores[currentPlayer][number];
    
    // Yeni işaretleri ekle (en fazla 3 olabilir)
    const newMarks = Math.min(currentMarks + multiplier, 3);
    gameState.cricketScores[currentPlayer][number] = newMarks;
    
    // İşaretleri göster
    updateCricketMarks(currentPlayer, number, newMarks);
    
    // Puan hesapla
    if (newMarks === 3 && currentMarks < 3) {
        // Sayı yeni kapatıldı, kapatma animasyonu göster
        showClosedAnimation(number, gameState.activePlayer);
    }
    
    // Eğer sayı kapatıldıysa ve rakip kapatmadıysa puan ekle
    if (newMarks === 3 && gameState.cricketScores[opponentPlayer][number] < 3) {
        // Fazladan işaretler puan olarak eklenir
        const extraMarks = (currentMarks + multiplier) - 3;
        if (extraMarks > 0) {
            // Puan ekle
            const pointsToAdd = extraMarks * (number === 'bull' ? 25 : parseInt(number));
            addPoints(gameState.activePlayer, pointsToAdd);
        }
    }
    
    // Oyun bitti mi kontrol et
    checkGameOver();
}

// Cricket işaretlerini güncelle
function updateCricketMarks(player, number, marks) {
    const playerNum = player === 'player1' ? 1 : 2;
    const markElement = document.getElementById(`p${playerNum}-${number}`);
    
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
    const playerKey = `player${player}`;
    gameState.scores[playerKey] += points;
    document.getElementById(`${playerKey}-score`).textContent = gameState.scores[playerKey];
}

// Sayı kapatma animasyonu göster
function showClosedAnimation(number, player) {
    const closedAnimation = document.createElement('div');
    closedAnimation.className = 'closed-animation';
    closedAnimation.textContent = `${number} KAPANDI!`;
    closedAnimation.style.color = player === 1 ? '#0066ff' : '#ff0000';
    
    document.querySelector('.dart-board-area').appendChild(closedAnimation);
    
    // Perfect sesi çal
    playSound(sounds.perfect);
    
    // Titreşim efekti
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
    }
    
    // Animasyon
    setTimeout(() => {
        closedAnimation.style.opacity = '0';
        closedAnimation.style.transform = 'scale(1.5)';
        
        setTimeout(() => {
            if (closedAnimation.parentNode) {
                closedAnimation.parentNode.removeChild(closedAnimation);
            }
        }, 1000);
    }, 1000);
}

// Oyun bitti mi kontrol et
function checkGameOver() {
    const p1Cricket = gameState.cricketScores.player1;
    const p2Cricket = gameState.cricketScores.player2;
    
    // Tüm sayılar kapatıldı mı kontrol et
    const p1Closed = Object.values(p1Cricket).every(marks => marks >= 3);
    const p2Closed = Object.values(p2Cricket).every(marks => marks >= 3);
    
    if ((p1Closed || p2Closed) && gameState.scores.player1 !== gameState.scores.player2) {
        // Oyun bitti
        gameState.gameOver = true;
        
        // Kazananı belirle
        let winner;
        if (p1Closed && gameState.scores.player1 >= gameState.scores.player2) {
            winner = gameState.player1.name;
        } else if (p2Closed && gameState.scores.player2 >= gameState.scores.player1) {
            winner = gameState.player2.name;
        } else if (gameState.scores.player1 > gameState.scores.player2) {
            winner = gameState.player1.name;
        } else {
            winner = gameState.player2.name;
        }
        
        // Kazanan animasyonu göster
        showWinnerAnimation(winner);
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
    const player1Score = gameState.scores.player1;
    const player2Score = gameState.scores.player2;
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
    playSound(sounds.win);
    
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

// Mobil kontrolleri ayarla
function setupMobileControls() {
    const activeCharacter = document.getElementById('active-character');
    
    // Karakter tıklandığında dart atma
    activeCharacter.addEventListener('click', () => {
        if (gameState.throwsLeft > 0 && !gameState.gameOver) {
            throwDart();
        }
    });
    
    // Dokunmatik cihazlar için hover efekti
    activeCharacter.addEventListener('touchstart', function() {
        this.classList.add('character-hover');
    });
    
    activeCharacter.addEventListener('touchend', function() {
        this.classList.remove('character-hover');
    });
}

// Cricket puanlama sistemini başlat
function initCricketScoring() {
    // Cricket puanlama sistemi zaten gameState içinde tanımlandı
    
    // Skorları sıfırla
    document.getElementById('player1-score').textContent = '0';
    document.getElementById('player2-score').textContent = '0';
}
