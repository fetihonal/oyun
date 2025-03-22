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
    hover: new Audio('sounds/hover.mp3')
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
    
    // Dart maçı alanını oluştur
    const dartMatchArea = document.createElement('div');
    dartMatchArea.id = 'dart-match-area';
    dartMatchArea.className = 'dart-match-area';
    
    // Dart tahtası
    const dartBoard = document.createElement('div');
    dartBoard.className = 'dart-board';
    dartBoard.innerHTML = `
        <div class="dart-board-rings">
            <div class="bullseye"></div>
        </div>
    `;
    
    // Oyuncu alanları
    const player1Area = document.createElement('div');
    player1Area.className = 'player-dart-area player1-area';
    player1Area.innerHTML = `
        <div class="player-score">
            <div class="score-label">SKOR</div>
            <div class="score-value" id="player1-score">501</div>
        </div>
        <div class="player-dart-portrait" id="player1-dart-portrait"></div>
        <div class="player-dart-name">${gameState.player1.name}</div>
    `;
    
    const player2Area = document.createElement('div');
    player2Area.className = 'player-dart-area player2-area';
    player2Area.innerHTML = `
        <div class="player-score">
            <div class="score-label">SKOR</div>
            <div class="score-value" id="player2-score">501</div>
        </div>
        <div class="player-dart-portrait" id="player2-dart-portrait"></div>
        <div class="player-dart-name">${gameState.player2.name}</div>
    `;
    
    // Dart atma butonu
    const throwButton = document.createElement('button');
    throwButton.id = 'throw-dart-button';
    throwButton.className = 'throw-dart-button';
    throwButton.textContent = 'DART AT';
    
    // Yeni oyun butonu
    const newGameButton = document.createElement('button');
    newGameButton.id = 'new-game-button';
    newGameButton.className = 'new-game-button';
    newGameButton.textContent = 'YENİ OYUN';
    newGameButton.style.display = 'none';
    
    // Oyuncu portrelerini ayarla
    setTimeout(() => {
        document.getElementById('player1-dart-portrait').style.backgroundImage = `url('images/${gameState.player1.image}')`;
        document.getElementById('player2-dart-portrait').style.backgroundImage = `url('images/${gameState.player2.image}')`;
    }, 100);
    
    // Elementleri ekle
    dartMatchArea.appendChild(player1Area);
    dartMatchArea.appendChild(dartBoard);
    dartMatchArea.appendChild(player2Area);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'dart-buttons';
    buttonContainer.appendChild(throwButton);
    buttonContainer.appendChild(newGameButton);
    
    // Dart maçı alanını sayfaya ekle
    document.querySelector('.container').appendChild(dartMatchArea);
    document.querySelector('.container').appendChild(buttonContainer);
    
    // Dart atma butonuna tıklama olayı ekle
    document.getElementById('throw-dart-button').addEventListener('click', throwDart);
    
    // Yeni oyun butonuna tıklama olayı ekle
    document.getElementById('new-game-button').addEventListener('click', resetGame);
    
    // Oyun durumunu güncelle
    gameState.dartMatch = {
        currentPlayer: 1,
        player1Score: 501,
        player2Score: 501,
        throwsLeft: 3,
        gameOver: false
    };
}

// Dart atma sırasını başlat
function startDartThrowing() {
    updateCurrentPlayerHighlight();
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
    if (gameState.dartMatch.gameOver) return;
    
    const currentPlayer = gameState.dartMatch.currentPlayer;
    const dartBoard = document.querySelector('.dart-board');
    const playerArea = document.querySelector(`.player${currentPlayer}-area`);
    
    // Dart oku oluştur
    const dart = document.createElement('div');
    dart.className = 'dart';
    dart.style.backgroundColor = currentPlayer === 1 ? '#0066ff' : '#ff0000';
    
    // Dart okunu oyuncunun yanına yerleştir
    playerArea.appendChild(dart);
    
    // Dart atma animasyonu
    const dartRect = dart.getBoundingClientRect();
    const boardRect = dartBoard.getBoundingClientRect();
    
    // Rastgele bir hedef nokta belirle (dart tahtasının içinde)
    const boardCenterX = boardRect.left + boardRect.width / 2;
    const boardCenterY = boardRect.top + boardRect.height / 2;
    
    // Oyuncunun istatistiklerine göre isabet oranını hesapla
    const player = currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const accuracy = player.accuracy / 100; // 0-1 arası değer
    
    // İsabet oranına göre rastgele sapma hesapla
    const maxDeviation = 50 * (1 - accuracy); // İsabet düşükse sapma yüksek
    const randomDeviation = () => (Math.random() * 2 - 1) * maxDeviation;
    
    const targetX = boardCenterX + randomDeviation();
    const targetY = boardCenterY + randomDeviation();
    
    // Başlangıç pozisyonu (oyuncunun yanından)
    const startX = currentPlayer === 1 ? 
        playerArea.getBoundingClientRect().right :
        playerArea.getBoundingClientRect().left;
    const startY = playerArea.getBoundingClientRect().top + 50;
    
    // Dart okunu başlangıç pozisyonuna yerleştir
    dart.style.position = 'fixed';
    dart.style.left = `${startX}px`;
    dart.style.top = `${startY}px`;
    dart.style.zIndex = '1000';
    document.body.appendChild(dart);
    
    // Atış sesi çal
    playSound(sounds.select);
    
    // Dart atma animasyonu
    const animationDuration = 500; // ms
    const startTime = Date.now();
    
    function animateDart() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Eğrisel bir yol izle
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress - Math.sin(progress * Math.PI) * 100;
        
        // Dart okunu döndür
        const rotation = progress * 720; // 2 tam tur
        
        dart.style.left = `${currentX}px`;
        dart.style.top = `${currentY}px`;
        dart.style.transform = `rotate(${rotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animateDart);
        } else {
            // Animasyon tamamlandığında
            // Dart tahtasına isabet efekti
            const hitEffect = document.createElement('div');
            hitEffect.className = 'hit-effect';
            hitEffect.style.left = `${targetX}px`;
            hitEffect.style.top = `${targetY}px`;
            document.body.appendChild(hitEffect);
            
            // İsabet sesi çal
            playSound(sounds.coin);
            
            // Titreşim efekti
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            
            // Puanı hesapla ve güncelle
            calculateScore(targetX, targetY, boardRect);
            
            // Efekti kaldır
            setTimeout(() => {
                document.body.removeChild(hitEffect);
            }, 300);
            
            // Dart okunu kaldır
            setTimeout(() => {
                document.body.removeChild(dart);
            }, 100);
        }
    }
    
    animateDart();
}

// Puanı hesapla
function calculateScore(hitX, hitY, boardRect) {
    const boardCenterX = boardRect.left + boardRect.width / 2;
    const boardCenterY = boardRect.top + boardRect.height / 2;
    
    // Merkeze olan uzaklık
    const distance = Math.sqrt(
        Math.pow(hitX - boardCenterX, 2) + 
        Math.pow(hitY - boardCenterY, 2)
    );
    
    // Tahtanın yarıçapı
    const boardRadius = boardRect.width / 2;
    
    // Uzaklığa göre puan hesapla
    let points = 0;
    
    if (distance < boardRadius * 0.1) {
        // Bullseye
        points = 50;
    } else if (distance < boardRadius * 0.2) {
        // İç bull
        points = 25;
    } else {
        // Diğer bölgeler (1-20 arası)
        const section = Math.floor(Math.random() * 20) + 1;
        
        // Uzaklığa göre çarpan belirle
        if (distance > boardRadius * 0.85 && distance < boardRadius * 0.95) {
            // Dış çift
            points = section * 2;
        } else if (distance > boardRadius * 0.5 && distance < boardRadius * 0.6) {
            // İç üçlü
            points = section * 3;
        } else {
            // Normal bölge
            points = section;
        }
    }
    
    // Puanı güncelle
    updateScore(points);
}

// Puanı güncelle
function updateScore(points) {
    const currentPlayer = gameState.dartMatch.currentPlayer;
    
    // Puanı düş
    if (currentPlayer === 1) {
        gameState.dartMatch.player1Score -= points;
        if (gameState.dartMatch.player1Score < 0) {
            gameState.dartMatch.player1Score += points; // Bust durumu
        }
        document.getElementById('player1-score').textContent = gameState.dartMatch.player1Score;
    } else {
        gameState.dartMatch.player2Score -= points;
        if (gameState.dartMatch.player2Score < 0) {
            gameState.dartMatch.player2Score += points; // Bust durumu
        }
        document.getElementById('player2-score').textContent = gameState.dartMatch.player2Score;
    }
    
    // Kalan atış sayısını düşür
    gameState.dartMatch.throwsLeft--;
    
    // Kazanan kontrolü
    if (gameState.dartMatch.player1Score === 0 || gameState.dartMatch.player2Score === 0) {
        endGame();
        return;
    }
    
    // Atış sırası bittiyse diğer oyuncuya geç
    if (gameState.dartMatch.throwsLeft === 0) {
        gameState.dartMatch.throwsLeft = 3;
        gameState.dartMatch.currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayerHighlight();
    }
}

// Oyunu bitir
function endGame() {
    gameState.dartMatch.gameOver = true;
    
    // Kazananı belirle
    const winner = gameState.dartMatch.player1Score === 0 ? gameState.player1 : gameState.player2;
    
    // Kazanan animasyonu
    const winnerOverlay = document.createElement('div');
    winnerOverlay.className = 'winner-overlay';
    document.body.appendChild(winnerOverlay);
    
    setTimeout(() => {
        const winnerText = document.createElement('div');
        winnerText.className = 'winner-text';
        winnerText.innerHTML = `
            <div class="winner-name">${winner.name}</div>
            <div class="winner-title">KAZANDI!</div>
        `;
        winnerOverlay.appendChild(winnerText);
        
        // Zafer sesi çal
        playSound(sounds.fight);
        
        // Yeni oyun butonunu göster
        document.getElementById('throw-dart-button').style.display = 'none';
        document.getElementById('new-game-button').style.display = 'block';
        
        // 3 saniye sonra kaldır
        setTimeout(() => {
            winnerOverlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(winnerOverlay);
            }, 500);
        }, 3000);
    }, 100);
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

// Oyuncu seçimi için Street Fighter tarzı ses efektleri ve animasyonlar
function addSelectionAnimation(element) {
    element.classList.add('character-selected');
    setTimeout(() => {
        element.classList.remove('character-selected');
    }, 1000);
}
