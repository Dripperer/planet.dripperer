const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Impostazione delle dimensioni del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variabili di gioco
let gameOver = false;
let keys = {};
let touchX, touchY, isTouching = false;
let backgroundMusic;
let score = 0;
let level = 1;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Oggetti del gioco
let player;
let planets = [];
let meteors = [];
let stars = [];

// Oggetto per tenere traccia dei pianeti raccolti
let planetCounts = {
    rock: 0,
    pop: 0,
    jazz: 0,
    funk: 0
};

// Variabili per gestire gli intervalli
let planetGenerationInterval;
let meteorGenerationInterval;

// Caricamento della musica di sottofondo
function loadMusic() {
    if (!backgroundMusic) {
        backgroundMusic = new Audio('musica.mp3'); // Sostituisci con il percorso corretto
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.5;
    }
    backgroundMusic.play().catch(function(error) {
        console.log('Errore nel riprodurre la musica:', error);
    });
}

// Classe per il giocatore
class Player {
    constructor() {
        this.size = 50;
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height / 2 - this.size / 2;
        this.speed = 5;
        this.color = 'white';
    }

    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        context.fill();
    }

    update() {
        // Movimenti su computer
        if (!isMobile) {
            if (keys['ArrowLeft'] || keys['a']) {
                this.x -= this.speed;
            }
            if (keys['ArrowRight'] || keys['d']) {
                this.x += this.speed;
            }
            if (keys['ArrowUp'] || keys['w']) {
                this.y -= this.speed;
            }
            if (keys['ArrowDown'] || keys['s']) {
                this.y += this.speed;
            }
        }

        // Limitazioni dei bordi
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.size));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.size));
    }
}

// Classe per i pianeti
class Planet {
    constructor(type, color, emoji) {
        this.type = type;
        this.size = 40;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size;
        this.speed = 1.5 + Math.random() * 2;
        this.color = color;
        this.emoji = emoji;
    }

    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        context.fill();

        // Disegna l'emoji
        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.fillText(this.emoji, this.x + this.size / 2, this.y + this.size / 2 + 7);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.resetPosition();
        }
    }

    resetPosition() {
        this.y = -this.size;
        this.x = Math.random() * (canvas.width - this.size);
    }
}

// Classe per le meteore (ostacoli)
class Meteor {
    constructor() {
        this.size = 30;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size;
        this.speed = 2 + Math.random() * 2;
        this.color = 'orange';
    }

    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        context.fill();
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.resetPosition();
        }
    }

    resetPosition() {
        this.y = -this.size;
        this.x = Math.random() * (canvas.width - this.size);
    }
}

// Classe per le stelle di sfondo
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = 0.5 + Math.random() * 0.5;
    }

    draw() {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }
}

// Funzione per ottenere un pianeta secondo le rarità specificate
function generatePlanet() {
    const totalWeight = 151; // Somma totale dei pesi (90+50+10+1)
    const rand = Math.random() * totalWeight;

    let planet;
    if (rand <= 1) {
        // Pianeta Funk (1% di probabilità)
        planet = new Planet('funk', 'purple', '🎹');
    } else if (rand <= 11) {
        // Pianeta Jazz (10% di probabilità)
        planet = new Planet('jazz', 'blue', '🎷');
    } else if (rand <= 61) {
        // Pianeta Pop (50% di probabilità)
        planet = new Planet('pop', 'pink', '🎶');
    } else {
        // Pianeta Rock (restante 90% di probabilità)
        planet = new Planet('rock', 'red', '🎸');
    }
    return planet;
}

// Inizializzazione del gioco
function init() {
    player = new Player();
    planets = [];
    meteors = [];
    stars = [];
    score = 0;
    level = 1;
    gameOver = false;
    planetCounts = {
        rock: 0,
        pop: 0,
        jazz: 0,
        funk: 0
    };

    // Genera le stelle di sfondo
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    // Mostra un messaggio di avvio
    context.fillStyle = '#ffffff';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText('Tocca o clicca per iniziare', canvas.width / 2, canvas.height / 2);

    // Aggiungi un listener per avviare il gioco al clic/tocco
    canvas.addEventListener('click', startGame, { once: true });
    canvas.addEventListener('touchstart', startGame, { once: true });
}

function startGame() {
    // Avvia la musica se non è già in riproduzione
    loadMusic();

    // Inizia a generare pianeti e meteore
    startGeneratingPlanetsAndMeteors();

    // Inizia il game loop
    requestAnimationFrame(gameLoop);

    // Rimuovi eventuali messaggi di avvio
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function startGeneratingPlanetsAndMeteors() {
    if (planetGenerationInterval) clearInterval(planetGenerationInterval);
    if (meteorGenerationInterval) clearInterval(meteorGenerationInterval);

    planetGenerationInterval = setInterval(() => {
        if (planets.length < 5 + level) {
            planets.push(generatePlanet());
        }
    }, 2000);

    meteorGenerationInterval = setInterval(() => {
        if (meteors.length < 3 + level) {
            meteors.push(new Meteor());
        }
    }, 3000);
}

// Funzione principale di gioco
function gameLoop() {
    if (!gameOver) {
        // Cancella lo schermo
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Aggiorna e disegna le stelle di sfondo
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Aggiorna e disegna il giocatore
        player.update();
        player.draw();

        // Aggiorna e disegna i pianeti
        planets.forEach((planet) => {
            planet.update();
            planet.draw();

            // Collisione con il giocatore
            if (detectCollision(player, planet)) {
                score++;
                planetCounts[planet.type]++;
                planet.resetPosition();

                // Aumenta il livello ogni 10 punti
                if (score % 10 === 0) {
                    level++;
                }
            }
        });

        // Aggiorna e disegna le meteore
        meteors.forEach((meteor) => {
            meteor.update();
            meteor.draw();

            // Collisione con il giocatore
            if (detectCollision(player, meteor)) {
                gameOver = true;

                // Ferma la generazione di pianeti e meteore
                clearInterval(planetGenerationInterval);
                clearInterval(meteorGenerationInterval);
            }
        });

        // Disegna il punteggio e le informazioni aggiuntive
        drawScore();

        requestAnimationFrame(gameLoop);
    } else {
        // Game over
        context.fillStyle = '#ffffff';
        context.font = '50px Arial';
        context.textAlign = 'center';
        context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        context.font = '30px Arial';
        context.fillText('Tocca o clicca per riprovare', canvas.width / 2, canvas.height / 2 + 20);

        // NON mettere in pausa la musica; lascia che continui a suonare

        // Aggiungi un listener per resettare il gioco
        canvas.addEventListener('click', resetGame, { once: true });
        canvas.addEventListener('touchstart', resetGame, { once: true });
    }
}

// Funzione per rilevare collisioni
function detectCollision(a, b) {
    let dx = (a.x + a.size / 2) - (b.x + b.size / 2);
    let dy = (a.y + a.size / 2) - (b.y + b.size / 2);
    let distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (a.size / 2 + b.size / 2);
}

// Funzione per resettare il gioco
function resetGame() {
    // Ferma la generazione di pianeti e meteore
    clearInterval(planetGenerationInterval);
    clearInterval(meteorGenerationInterval);

    // Rimuovi gli eventi di click/touch per il reset
    canvas.removeEventListener('click', resetGame);
    canvas.removeEventListener('touchstart', resetGame);

    // Reinizializza il gioco
    init();
}

// Funzione per disegnare il punteggio e altre informazioni
function drawScore() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.textAlign = 'left';
    context.fillText(`Punteggio: ${score}`, 20, 30);
    context.fillText(`Livello: ${level}`, 20, 60);

    // Mostra quanti pianeti di ciascun tipo sono stati raccolti
    context.fillText(`🎸 Rock: ${planetCounts.rock}`, 20, 100);
    context.fillText(`🎶 Pop: ${planetCounts.pop}`, 20, 130);
    context.fillText(`🎷 Jazz: ${planetCounts.jazz}`, 20, 160);
    context.fillText(`🎹 Funk: ${planetCounts.funk}`, 20, 190);
}

// Gestione degli input da tastiera per movimento fluido su computer
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// Gestione degli input touch per dispositivi mobili
canvas.addEventListener('touchstart', function(e) {
    isTouching = true;
    const touch = e.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
});

canvas.addEventListener('touchmove', function(e) {
    if (isTouching) {
        e.preventDefault(); // Previene lo scrolling su mobile
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchX;
        const deltaY = touch.clientY - touchY;
        touchX = touch.clientX;
        touchY = touch.clientY;
        player.x += deltaX;
        player.y += deltaY;

        // Limitazioni dei bordi
        player.x = Math.max(0, Math.min(player.x, canvas.width - player.size));
        player.y = Math.max(0, Math.min(player.y, canvas.height - player.size));
    }
});

canvas.addEventListener('touchend', function(e) {
    isTouching = false;
});

// Avvio del gioco
init();
