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
    focusedPlayerIndex: 0, // Klavye navigasyonu için odaklanılan oyuncu
    isThrowingDart: false, // Dart atma işlemi sırasında true olacak
    isLoading: false // Yükleme durumu
};

// Dart oyuncuları verileri
const players = [
    { id: 1, name: 'Fetih', average: 95.6, checkout: 48, accuracy: 92, image: 'fetih.png' },
    { id: 2, name: 'Göktürk', average: 93.2, checkout: 45, accuracy: 89, image: 'gokturk.png' },
    { id: 3, name: 'Ömer', average: 97.8, checkout: 52, accuracy: 94, image: 'ömer.png' },
    { id: 4, name: 'Umut', average: 91.5, checkout: 42, accuracy: 88, image: 'umut.png' },
    { id: 5, name: 'Nihat', average: 94.3, checkout: 47, accuracy: 90, image: 'nihat.png' },
    { id: 6, name: 'Onat', average: 92.7, checkout: 44, accuracy: 87, image: 'onat.jpg' },
    { id: 7, name: 'Ongun', average: 96.1, checkout: 50, accuracy: 91, image: 'ongun.jpg' },
    { id: 8, name: 'Ufuk', average: 90.8, checkout: 41, accuracy: 86, image: 'ufuk.jpg' },
    { id: 9, name: 'Yaşar', average: 93.9, checkout: 46, accuracy: 89, image: 'yaşar.jpg' },
    { id: 10, name: 'Uzbay', average: 95.2, checkout: 49, accuracy: 92, image: 'uzbay.jpg' },
    { id: 11, name: 'Saymen', average: 92.1, checkout: 43, accuracy: 87, image: 'saymen.jpg' },
    { id: 12, name: 'Burcu', average: 94.7, checkout: 48, accuracy: 90, image: 'burcu.png' },
    { id: 13, name: 'Selda', average: 93.5, checkout: 45, accuracy: 88, image: 'selda.jpg' },
    { id: 14, name: 'Derya', average: 96.3, checkout: 51, accuracy: 93, image: 'derya.jpg' },
    { id: 15, name: 'Büşra', average: 91.9, checkout: 42, accuracy: 86, image: 'busra.png' },
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
    hover: new Audio('sounds/hover.mp3'),
    // Arka plan müzikleri
    selectionMusic: new Audio('sounds/cps2-guile-stage.mp3'),
    gameMusic: new Audio('sounds/street-fighter-theme.mp3')
};

// Görsel efektler
const effects = {
    flame: 'images/flame.png',
    lightning: 'images/lightning.png'
};

// Ses çalma fonksiyonu - bitmesini beklemeden çalar
function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.volume = 1;
    
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Ses çalma hatası:", error);
        });
    }
}

// Arka plan müziği çalma fonksiyonu
function playBackgroundMusic(music, volume = 0.1) {
    music.loop = true;
    music.volume = volume;
    
    const playPromise = music.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Arka plan müziği çalma hatası:", error);
        });
    }
}

// Arka plan müziğini durdur
function stopBackgroundMusic(music) {
    music.pause();
    music.currentTime = 0;
}

// Ses efektlerini önceden yükle
function preloadSounds() {
    for (const sound in sounds) {
        sounds[sound].load();
        sounds[sound].volume = 0.1; // Ses seviyesini ayarla
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
        if (gameState.player1 && gameState.player2 && !gameState.isLoading) {
            // Yükleme durumunu true yap
            gameState.isLoading = true;
            
            // Yükleme animasyonunu göster
            showLoadingAnimation();
            
            // Oyuncu seçim ekranını gizle
            document.querySelector('.player-grid-container').style.display = 'none';
            document.querySelector('.instructions').style.display = 'none';
            document.querySelector('.start-button').style.display = 'none';
            
            // Yükleme süreci simülasyonu (gerçek uygulamada asset yükleme işlemleri burada yapılır)
            simulateLoading(() => {
                // Yükleme tamamlandığında
                hideLoadingAnimation();
                
                // Fight animasyonunu göster
                showFightAnimation();
                
                // Yükleme durumunu false yap
                gameState.isLoading = false;
            });
        } else {
            // Oyuncu seçilmediğinde uyarı
            showMessage('Lütfen her iki oyuncu için de karakter seçin!');
        }
    });
    
    // Kullanıcı etkileşimi için bir kez tıklama olayı ekle (müzik çalması için)
    document.addEventListener('click', initBackgroundMusic, { once: true });
    
    // Dokunma olayı için de ekle (mobil cihazlar için)
    document.addEventListener('touchstart', initBackgroundMusic, { once: true });
});

// Arka plan müziğini başlat (kullanıcı etkileşimi sonrası)
function initBackgroundMusic() {
    console.log("Kullanıcı etkileşimi algılandı, müzik başlatılıyor");
    playBackgroundMusic(sounds.selectionMusic);
}

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
    // Başlat butonunu pasif yap ve metnini değiştir
    const startButton = document.getElementById('start-match');
    startButton.disabled = true;
    startButton.textContent = 'OYUN BAŞLADI';
    startButton.classList.add('game-started');
    
    // Seçim ekranı müziğini durdur
    stopBackgroundMusic(sounds.selectionMusic);
    
    // Street Fighter temasını oluştur ve aktifleştir
    createStreetFighterTheme();
    setTimeout(() => {
        activateStreetFighterTheme();
    }, 500);
    
    // Dart maçı alanını oluştur
    createDartMatchArea();
    
    // Dart atma sırasını başlat
    startDartThrowing();
    
    // Oyun alanına doğru kaydır
    setTimeout(() => {
        const dartMatchArea = document.querySelector('.dart-match-area');
        if (dartMatchArea) {
            dartMatchArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
    
    // Oyun müziğini başlat (seçim ekranı müziği durdurulduktan sonra)
    setTimeout(() => {
        playBackgroundMusic(sounds.gameMusic);
    }, 300);
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

// Dart at
function throwDart() {
    // Eğer atış hakkı yoksa, oyun bittiyse veya zaten dart atma işlemi devam ediyorsa işlemi engelle
    if (gameState.throwsLeft <= 0 || gameState.gameOver || gameState.isThrowingDart) return;
    
    // Dart atma işleminin başladığını belirt
    gameState.isThrowingDart = true;
    
    // Atış animasyonu
    const activeCharacter = document.getElementById('active-character');
    
    // Atış hazırlık animasyonu
    activeCharacter.classList.add('character-ready');
    
    // Kısa bir gecikme sonra atış animasyonu
    setTimeout(() => {
        // Hazırlık animasyonunu kaldır
        activeCharacter.classList.remove('character-ready');
        
        // Atış animasyonunu başlat
        activeCharacter.classList.add('character-throwing');
        
        // Atış sesi
        playSound(sounds.throw);
        
        // Atış sonucunu hesapla
        const result = calculateDartHit();
        
        // Dart oku oluştur
        createDartOnBoard(result.x, result.y);
        
        // Sonucu göster
        setTimeout(() => {
            // Atış animasyonunu kaldır
            activeCharacter.classList.remove('character-throwing');
            
            // İsabet durumuna göre başarı animasyonu ekle
            if (result.hit) {
                activeCharacter.classList.add('character-success');
                showHitNumber(result.number, result.multiplier);
                updateCricketScore(result.number, result.multiplier);
                
                // Bullseye geldiğinde alev efekti göster
                if (result.isBullseye || result.number === 'bull') {
                    console.log("Bull geldi! Alev efekti gösteriliyor...");
                    showEffect('flame', 'bull', gameState.activePlayer);
                }
                
                // Başarı animasyonunu kaldır
                setTimeout(() => {
                    activeCharacter.classList.remove('character-success');
                }, 500);
            } else {
                showHitNumber('Iskaladı', 0);
            }
            
            // Atış sayısını azalt
            gameState.throwsLeft--;
            
            // Atış bittiyse sırayı diğer oyuncuya geçir
            if (gameState.throwsLeft <= 0) {
                setTimeout(() => {
                    startDartThrowing();
                    // Dart atma işleminin bittiğini belirt
                    gameState.isThrowingDart = false;
                }, 1500);
            } else {
                // Dart atma işleminin bittiğini belirt
                gameState.isThrowingDart = false;
            }
        }, 500);
    }, 300);
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
    if (multiplier === 0) color = '#ff6666'; // Iskaladığında kırmızımsı renk
    
    hitNumber.style.color = color;
    
    // İsabet edilen sayıyı göster
    if (multiplier > 1) {
        hitNumber.textContent = `${multiplier}x ${number}`;
    } else if (multiplier === 0 && number === 'Iskaladı') {
        // Iskaladığında ceza göster
        hitNumber.textContent = `Iskaladı (-5)`;
        
        // Ceza puanını uygula
        const opponentPlayer = gameState.activePlayer === 1 ? 2 : 1;
        addPoints(opponentPlayer, 5);
    } else {
        hitNumber.textContent = number;
    }
    
    // Rastgele bir konum belirle
    const randomX = Math.random() * 60 - 30;
    const randomY = Math.random() * 60 - 30;
    
    hitNumber.style.left = `${randomX}px`;
    hitNumber.style.top = `${randomY}px`;
    
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
    
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;
    
    // Cricket sayıları
    const cricketNumbers = ['15', '16', '17', '18', '19', '20', 'bull'];
    
    // Hedef sayı
    let targetNumber;
    
    // Bull hedefleme şansını %50 azalt
    const bullChance = 0.1; // Önceki değerin yarısı
    if (Math.random() < bullChance) {
        targetNumber = 'bull';
    } else {
        targetNumber = cricketNumbers[Math.floor(Math.random() * (cricketNumbers.length - 1))]; // 'bull' hariç
    }
    
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
    
    // Rastgele sapma - Bull için daha fazla sapma ekle
    const maxDeviation = targetNumber === 'bull' ? 40 : 30; // Bull için daha fazla sapma
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
    
    // Bull geldiğinde özel efekt kontrolü - daha dar bir aralık kullanıyoruz
    const isBullseye = hit && targetNumber === 'bull' && distance < boardRadius * 0.125; // %50 daha küçük (0.25 yerine 0.125)
    
    return {
        hit: hit,
        x: hitX,
        y: hitY,
        number: targetNumber,
        multiplier: multiplier,
        isBullseye: isBullseye
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
        
        // Sayı kapatıldığında şimşek efekti göster
        showEffect('lightning', number, gameState.activePlayer);
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

// Görsel efekt göster (alev veya şimşek)
function showEffect(effectType, number, player) {
    console.log(`${effectType} efekti gösteriliyor: ${number} için, oyuncu: ${player}`);
    
    const dartBoardArea = document.querySelector('.dart-board-area');
    const dartBoard = document.querySelector('.dart-board');
    const boardRect = dartBoard.getBoundingClientRect();
    
    // Efekt elementini oluştur
    const effectElement = document.createElement('div');
    effectElement.className = `special-effect ${effectType}-effect`;
    dartBoardArea.appendChild(effectElement);
    
    // Efekt görselini ayarla
    const effectImg = document.createElement('img');
    effectImg.src = effects[effectType];
    effectImg.alt = effectType;
    effectElement.appendChild(effectImg);
    
    // Oyuncu rengini ayarla
    const playerColor = player === 1 ? '#0066ff' : '#ff0000';
    effectImg.style.filter = `drop-shadow(0 0 10px ${playerColor})`;
    
    // Efektin konumunu ayarla
    let posX, posY;
    
    if (number === 'bull') {
        // Bull için merkez
        posX = boardRect.width / 2;
        posY = boardRect.height / 2;
    } else {
        // Diğer sayılar için hesaplama
        const angle = (parseInt(number) - 13) * (Math.PI / 10);
        const distance = boardRect.width * 0.35;
        
        posX = boardRect.width / 2 + Math.cos(angle) * distance;
        posY = boardRect.height / 2 + Math.sin(angle) * distance;
    }
    
    // Dartın konumunu ayarla
    if (effectType === 'flame') {
        effectElement.style.width = '150px'; // Daha büyük
        effectElement.style.height = '200px'; // Daha büyük
        effectElement.style.left = `${posX - 75}px`;
        effectElement.style.top = `${posY - 180}px`;
        effectElement.style.zIndex = '1000'; // Daha yüksek z-index
    } else { // lightning
        effectElement.style.width = '180px'; // Daha büyük
        effectElement.style.height = '240px'; // Daha büyük
        effectElement.style.left = `${posX - 90}px`;
        effectElement.style.top = `${posY - 180}px`;
        effectElement.style.zIndex = '1000'; // Daha yüksek z-index
    }
    
    // Animasyon
    let duration = effectType === 'flame' ? 2000 : 1000; // Daha uzun süre
    
    // Efekt animasyonu
    effectElement.style.animation = `${effectType}-animation ${duration}ms forwards`;
    
    // Debug için border ekle
    // effectElement.style.border = '1px solid red';
    
    // Belirli bir süre sonra efekti kaldır
    setTimeout(() => {
        if (effectElement.parentNode) {
            effectElement.parentNode.removeChild(effectElement);
        }
    }, duration);
}

// Oyun bitti mi kontrol et
function checkGameOver() {
    const p1Cricket = gameState.cricketScores.player1;
    const p2Cricket = gameState.cricketScores.player2;
    
    // Tüm sayılar kapatıldı mı kontrol et
    const p1Closed = Object.values(p1Cricket).every(marks => marks >= 3);
    const p2Closed = Object.values(p2Cricket).every(marks => marks >= 3);
    
    // Amerikan Cricket kurallarına göre:
    // 1. Tüm sayıları kapatan VE
    // 2. En yüksek puana sahip olan oyuncu kazanır
    
    // Eğer her iki oyuncu da tüm sayıları kapattıysa, puanı yüksek olan kazanır
    if (p1Closed && p2Closed) {
        gameState.gameOver = true;
        
        if (gameState.scores.player1 > gameState.scores.player2) {
            showWinnerAnimation(gameState.player1.name);
        } else if (gameState.scores.player2 > gameState.scores.player1) {
            showWinnerAnimation(gameState.player2.name);
        } else {
            // Beraberlik durumu - nadir de olsa olabilir
            showTieAnimation();
        }
    }
    // Eğer sadece bir oyuncu tüm sayıları kapattıysa VE puanı diğer oyuncudan yüksekse kazanır
    else if (p1Closed && gameState.scores.player1 > gameState.scores.player2) {
        gameState.gameOver = true;
        showWinnerAnimation(gameState.player1.name);
    }
    else if (p2Closed && gameState.scores.player2 > gameState.scores.player1) {
        gameState.gameOver = true;
        showWinnerAnimation(gameState.player2.name);
    }
    // Diğer durumlar - oyun devam eder
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
        <button id="play-again-button" class="play-again-button">TEKRAR OYNA</button>
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
    
    // Tekrar oyna butonuna tıklama olayı ekle
    document.getElementById('play-again-button').addEventListener('click', () => {
        // Kazanan ekranını kapat
        document.body.removeChild(winnerOverlay);
        
        // Oyunu sıfırla ve karakter seçim ekranına dön
        resetGameAndReturnToSelection();
    });
}

// Beraberlik durumu için animasyon
function showTieAnimation() {
    const tieOverlay = document.createElement('div');
    tieOverlay.className = 'winner-overlay';
    
    const tieText = document.createElement('div');
    tieText.className = 'winner-text';
    tieText.textContent = `BERABERE!`;
    
    const tieDetails = document.createElement('div');
    tieDetails.className = 'winner-details';
    
    // Beraberlik detaylarını göster
    tieDetails.innerHTML = `
        <div class="winner-score">Skor: ${gameState.scores.player1} - ${gameState.scores.player2}</div>
        <div class="winner-stats">İki oyuncu da tüm sayıları kapattı ve aynı puana sahip!</div>
        <button id="play-again-button" class="play-again-button">TEKRAR OYNA</button>
    `;
    
    tieOverlay.appendChild(tieText);
    tieOverlay.appendChild(tieDetails);
    document.body.appendChild(tieOverlay);
    
    // Ses çal
    playSound(sounds.win);
    
    // Titreşim efekti
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    // Tekrar oyna butonuna tıklama olayı ekle
    document.getElementById('play-again-button').addEventListener('click', () => {
        // Beraberlik ekranını kapat
        document.body.removeChild(tieOverlay);
        
        // Oyunu sıfırla ve karakter seçim ekranına dön
        resetGameAndReturnToSelection();
    });
}

// Oyunu sıfırla ve karakter seçim ekranına dön
function resetGameAndReturnToSelection() {
    // Dart maçı alanını kaldır
    const dartMatchArea = document.querySelector('.dart-match-area');
    if (dartMatchArea) {
        dartMatchArea.parentNode.removeChild(dartMatchArea);
    }
    
    // Street Fighter temasını kaldır
    deactivateStreetFighterTheme();
    const background = document.getElementById('street-fighter-background');
    const overlay = document.getElementById('street-fighter-overlay');
    if (background) document.body.removeChild(background);
    if (overlay) document.body.removeChild(overlay);
    
    // Cricket puanlarını sıfırla
    gameState.cricketScores = {
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
    };
    
    // Skorları sıfırla
    gameState.scores = {
        player1: 0,
        player2: 0
    };
    
    // Oyun durumunu sıfırla
    gameState.gameOver = false;
    gameState.throwsLeft = 3;
    gameState.dartsOnBoard = [];
    gameState.isThrowingDart = false; // Dart atma işlemi durumunu sıfırla
    gameState.isLoading = false; // Yükleme durumunu sıfırla
    
    // Karakter seçim ekranını göster
    document.querySelector('.player-grid-container').style.display = 'block';
    document.querySelector('.instructions').style.display = 'block';
    document.querySelector('.start-button').style.display = 'block';
    
    // Oyuncu seçimlerini koru ama aktif oyuncuyu sıfırla
    gameState.activePlayer = 1;
    
    // Oyuncu kart seçimlerini güncelle
    updatePlayerCardSelections();
    updateActivePlayerHighlight();
    
    // Başlat butonunu aktifleştir
    startMatchButton.disabled = false;
    startMatchButton.classList.add('active');
    
    // Arka plan müziğini değiştir
    stopBackgroundMusic(sounds.gameMusic);
    playBackgroundMusic(sounds.selectionMusic);
}

// Mobil kontrolleri ayarla
function setupMobileControls() {
    const activeCharacter = document.getElementById('active-character');
    
    // Karakter tıklandığında dart atma
    activeCharacter.addEventListener('click', () => {
        // Eğer atış hakkı varsa, oyun bitmemişse ve zaten dart atma işlemi devam etmiyorsa
        if (gameState.throwsLeft > 0 && !gameState.gameOver && !gameState.isThrowingDart) {
            throwDart();
        }
    });
    
    // Dokunmatik cihazlar için hover efekti
    activeCharacter.addEventListener('touchstart', function() {
        if (!gameState.isThrowingDart) {
            this.classList.add('character-hover');
        }
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

// Yükleme animasyonunu göster
function showLoadingAnimation() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.id = 'loading-overlay';
    
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">OYUN YÜKLENİYOR</div>
        <div class="loading-progress">
            <div class="loading-bar" id="loading-bar"></div>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

// Yükleme animasyonunu gizle
function hideLoadingAnimation() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 500);
    }
}

// Yükleme işlemini simüle et
function simulateLoading(callback) {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(callback, 500); // Yükleme tamamlandıktan sonra kısa bir gecikme
        }
    }, 300);
}

// Street Fighter temasını oluştur
function createStreetFighterTheme() {
    // Arka plan elementlerini oluştur
    const background = document.createElement('div');
    background.className = 'street-fighter-background';
    background.id = 'street-fighter-background';
    
    const overlay = document.createElement('div');
    overlay.className = 'street-fighter-overlay';
    overlay.id = 'street-fighter-overlay';
    
    // Sayfaya ekle
    document.body.appendChild(background);
    document.body.appendChild(overlay);
}

// Street Fighter temasını aktifleştir
function activateStreetFighterTheme() {
    const background = document.getElementById('street-fighter-background');
    const overlay = document.getElementById('street-fighter-overlay');
    
    if (background && overlay) {
        background.classList.add('street-fighter-active');
        overlay.classList.add('street-fighter-active');
    }
    
    // Dart tahtasına Street Fighter efekti ekle
    const dartBoard = document.querySelector('.dart-board');
    if (dartBoard) {
        dartBoard.classList.add('street-fighter-flash');
    }
    
    // Oyuncu bilgilerine Street Fighter yazı tipi ekle
    const playerInfoElements = document.querySelectorAll('.player-name, .player-score, .throws-left');
    playerInfoElements.forEach(element => {
        element.classList.add('street-fighter-text');
    });
}

// Street Fighter temasını deaktifleştir
function deactivateStreetFighterTheme() {
    const background = document.getElementById('street-fighter-background');
    const overlay = document.getElementById('street-fighter-overlay');
    
    if (background && overlay) {
        background.classList.remove('street-fighter-active');
        overlay.classList.remove('street-fighter-active');
    }
    
    // Dart tahtasından Street Fighter efektini kaldır
    const dartBoard = document.querySelector('.dart-board');
    if (dartBoard) {
        dartBoard.classList.remove('street-fighter-flash');
    }
    
    // Oyuncu bilgilerinden Street Fighter yazı tipini kaldır
    const playerInfoElements = document.querySelectorAll('.player-name, .player-score, .throws-left');
    playerInfoElements.forEach(element => {
        element.classList.remove('street-fighter-text');
    });
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
    
    // Karakter ve dart tahtasını oyun alanına ekle
    characterArea.appendChild(activeCharacter);
    gameArea.appendChild(characterArea);
    gameArea.appendChild(dartBoardArea);
    
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
    
    // Tüm animasyon sınıflarını temizle
    activeCharacter.classList.remove('character-throwing', 'character-ready', 'character-success');
    
    // Geçiş animasyonu için önce karakteri küçült
    activeCharacter.style.transform = 'scale(0.8)';
    activeCharacter.style.opacity = '0.7';
    
    // Kısa bir gecikme sonra yeni karakteri göster
    setTimeout(() => {
        activeCharacter.style.backgroundImage = `url('images/${activePlayerData.image}')`;
        
        if (gameState.activePlayer === 1) {
            activeCharacter.className = 'active-character player1-character';
        } else {
            activeCharacter.className = 'active-character player2-character';
        }
        
        // Karakteri normal boyuta getir ve vurgula
        setTimeout(() => {
            activeCharacter.style.transform = 'scale(1)';
            activeCharacter.style.opacity = '1';
            
            // Hazır animasyonunu ekle
            setTimeout(() => {
                activeCharacter.classList.add('character-ready');
            }, 200);
        }, 100);
    }, 200);
    
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
