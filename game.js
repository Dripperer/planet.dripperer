const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameOver = false;
let keys = {};
let planetsMoving = false; // Flag per determinare quando i pianeti iniziano a muoversi
let touchStartX, touchStartY;

// Oggetto per tenere traccia dei punteggi
let scores = {
    rock: 0,
    pop: 0,
    jazz: 0,
    funk: 0
};

// Array per i pianeti
const planets = [];

// Classe del giocatore
class Player {
    constructor() {
        this.size = 50;
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height / 2 - this.size / 2; // Posizionato al centro inizialmente
        this.speed = 15; // Velocità ulteriormente aumentata
    }

    draw() {
        context.fillStyle = 'gray'; /* Colore grigio per il personaggio */
        context.fillRect(this.x, this.y, this.size, this.size);
    }

    moveLeft() {
        if (this.x > 0) this.x -= this.speed;
    }

    moveRight() {
        if (this.x + this.size < canvas.width) this.x += this.speed;
    }

    moveUp() {
        if (this.y > 0) this.y -= this.speed;
    }

    moveDown() {
        if (this.y + this.size < canvas.height) this.y += this.speed;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.size));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.size));
    }
}

// Classe dei pianeti
class Planet {
    constructor(name, color, rarity, label) {
        this.name = name;
        this.size = 70; /* Pianeti più grandi */
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size - 100; // Partono un po' più in basso
        this.speed = 2;
        this.color = color;
        this.rarity = rarity; // Percentuale di rarità
        this.label = label; // Emoticon per il pianeta
    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
        context.fillStyle = 'white';
        context.font = '20px Comic Sans MS';
        context.textAlign = 'center';
        context.fillText(this.label, this.x + this.size / 2, this.y + this.size / 2 + 7);
    }

    update() {
        if (planetsMoving) {
            this.y += this.speed;
            if (this.y > canvas.height) {
                this.resetPosition();
            }
        }
    }

    resetPosition() {
        this.y = -this.size - 100; // Partono di nuovo un po' più in basso
        this.x = Math.random() * (canvas.width - this.size);
    }
}

// Funzione per generare pianeti basata sulla rarità
function generatePlanet() {
    const rand = Math.random() * 100;
    let planet;
    if (rand <= 1) {
        planet = new Planet('Pianeta Funk', 'purple', 1, ':)');
    } else if (rand <= 11) {
        planet = new Planet('Pianeta Jazz', 'blue', 10, ':P');
    } else if (rand <= 61) {
        planet = new Planet('Pianeta Pop', 'pink', 50, ':3');
    } else {
        planet = new Planet('Pianeta Rock', 'red', 90, '>:');
    }
    console.log(`Generated planet: ${planet.name}`);
    return planet;
}

// Funzione per gestire la collisione tra giocatore e pianeta
function detectCollision(a, b) {
    const distX = Math.abs(b.x - a.x - a.size / 2);
    const distY = Math.abs(b.y - a.y - a.size / 2);

    if (distX > (a.size / 2 + b.size / 2)) return false;
    if (distY > (a.size / 2 + b.size / 2)) return false;

    if (distX <= (a.size / 2)) return true;
    if (distY <= (a.size / 2)) return true;

    const dx = distX - a.size / 2;
    const dy = distY - a.size / 2;
    return (dx * dx + dy * dy <= (b.size / 2) * (b.size / 2));
}

// Inizializzazione del giocatore
const player = new Player();

// Funzione per generare nuovi pianeti ad intervalli regolari
setInterval(() => {
    if (planets.length < 5) { // Assicura che non ci siano troppi pianeti contemporaneamente
        const newPlanet = generatePlanet();
        planets.push(newPlanet);
    }
}, 2500); // Genera un nuovo pianeta ogni 2.5 secondi

// Funzione per disegnare il punteggio
function drawScore() {
    context.fillStyle = 'white';
    context.font = '20px Comic Sans MS';
    context.textAlign = 'right';
    context.fillText(`Pianeta Rock: ${scores.rock}`, canvas.width - 20, 30);
    context.fillText(`Pianeta Pop: ${scores.pop}`, canvas.width - 20, 60);
    context.fillText(`Pianeta Jazz: ${scores.jazz}`, canvas.width - 20, 90);
    context.fillText(`Pianeta Funk: ${scores.funk}`, canvas.width - 20, 120);
}

// Game loop principale
function gameLoop() {
    if (gameOver) {
        context.fillStyle = '#ffffff';
        context.font = '50px Arial';
        context.textAlign = 'center';
        context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    player.draw();

    planets.forEach((planet, index) => {
        planet.update();
        planet.draw();

        if (detectCollision(player, planet)) {
            scores[planet.name.split(' ')[1].toLowerCase()]++; // Incrementa il punteggio del tipo di pianeta
            planet.resetPosition();
        }
    });

    drawScore(); // Disegna il punteggio

    requestAnimationFrame(gameLoop);
}

// Gestione degli input da tastiera
window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
    if (keys[37]) player.moveLeft();
    if (keys[38]) {
        player.moveUp();
        planetsMoving = true; // I pianeti iniziano a muoversi quando il giocatore preme la freccetta in su
    }
    if (keys[39]) player.moveRight();
    if (keys[40]) player.moveDown();
});

window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
});

// Gestione degli input touch per dispositivi mobili
canvas.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchmove', function(e) {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    player.move(deltaX, deltaY);
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // I pianeti iniziano a muoversi quando il giocatore si muove
    if (deltaY < 0) {
        planetsMoving = true;
    }
});

gameLoop();
