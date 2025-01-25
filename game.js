const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameOver = false;
let keys = {};

// Array per i pianeti
const planets = [];

// Classe del giocatore
class Player {
    constructor() {
        this.size = 50;
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height - this.size - 10;
        this.speed = 5;
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
}

// Classe dei pianeti
class Planet {
    constructor(name, color, rarity) {
        this.name = name;
        this.size = 70; /* Pianeti più grandi */
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size - 100; // Partono un po' più in basso
        this.speed = 2;
        this.color = color;
        this.rarity = rarity; // Percentuale di rarità
    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.resetPosition();
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
    if (rand <= 1) {
        return new Planet('Pianeta Funk', 'purple', 1);
    } else if (rand <= 11) {
        return new Planet('Pianeta Jazz', 'blue', 10);
    } else if (rand <= 61) {
        return new Planet('Pianeta Pop', 'pink', 50);
    } else {
        return new Planet('Pianeta Rock', 'red', 90);
    }
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
            planet.resetPosition();
        }
    });

    requestAnimationFrame(gameLoop);
}

// Gestione degli input da tastiera
window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
    if (keys[37]) player.moveLeft();
    if (keys[39]) player.moveRight();
});

window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
});

gameLoop();

