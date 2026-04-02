document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('startButton');
    const endScreen = document.getElementById('endScreen');
    const finalScore = document.getElementById('finalScore');
    const playerNameInput = document.getElementById('playerName');
    const saveScoreButton = document.getElementById('saveScore');
    const topPlayersList = document.getElementById('topPlayers');
    const prizes = document.getElementById('prizes');

    let score = 0;
    let timeLeft = 60;
    let gameInterval;
    let daisyInterval;
    let daisies = [];

    class Daisy {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 30;
            this.petalPath = this.createPetalPath();
        }

        createPetalPath() {
            const path = new Path2D();
            const length = this.size * 1.5; // Adjusted for better proportions
            const width = this.size * 0.4;
            path.moveTo(0, 0);
            path.bezierCurveTo(length * 0.2, -width * 0.8, length * 0.8, -width * 0.8, length, 0);
            path.bezierCurveTo(length * 0.8, width * 0.8, length * 0.2, width * 0.8, 0, 0);
            path.closePath();
            return path;
        }

        drawPetals(count = 8) { // Increased petal count for more realistic daisy
            const step = (Math.PI * 2) / count;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(-Math.PI / 2); // Rotate for natural positioning
            for (let i = 0; i < count; i++) {
                ctx.fillStyle = '#ffffff'; // White petals
                ctx.strokeStyle = '#f0f0f0'; // Light border
                ctx.lineWidth = 1;
                ctx.fill(this.petalPath);
                ctx.stroke(this.petalPath);
                ctx.rotate(step);
            }
            ctx.restore();
        }

        drawCenter() {
            // Gradient for center
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size / 3);
            gradient.addColorStop(0, '#ffd700'); // Gold yellow
            gradient.addColorStop(1, '#ffaa00'); // Darker yellow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            // Add some texture dots
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (this.size / 3 - 2);
                ctx.beginPath();
                ctx.arc(this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, 1, 0, Math.PI * 2);
                ctx.fillStyle = '#cc8800';
                ctx.fill();
            }
        }

        drawStem() {
            // Curved stem
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size / 2);
            ctx.quadraticCurveTo(this.x - 10, this.y + this.size * 1.5, this.x, this.y + this.size * 2);
            ctx.strokeStyle = '#228b22';
            ctx.lineWidth = 4;
            ctx.stroke();
            // Add a leaf
            ctx.beginPath();
            ctx.moveTo(this.x - 5, this.y + this.size * 1.2);
            ctx.quadraticCurveTo(this.x - 20, this.y + this.size * 1.3, this.x - 5, this.y + this.size * 1.4);
            ctx.quadraticCurveTo(this.x - 10, this.y + this.size * 1.25, this.x - 5, this.y + this.size * 1.2);
            ctx.fillStyle = '#228b22';
            ctx.fill();
        }

        draw() {
            this.drawStem();
            this.drawPetals();
            this.drawCenter();
        }
    }

    function spawnDaisy() {
        const x = Math.random() * (canvas.width - 60) + 30;
        const y = Math.random() * (canvas.height - 120) + 60; // Adjusted for taller daisies
        daisies.push(new Daisy(x, y));
    }

    function drawDaisies() {
        daisies.forEach(daisy => daisy.draw());
    }

    function updateHUD() {
        scoreElement.textContent = `Очки: ${score}`;
        timerElement.textContent = `Время: ${timeLeft}`;
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDaisies();
        updateHUD();
    }

    function startGame() {
        score = 0;
        timeLeft = 60;
        daisies = [];
        endScreen.style.display = 'none';
        startButton.style.display = 'none';
        gameInterval = setInterval(gameLoop, 1000 / 60);
        daisyInterval = setInterval(spawnDaisy, 800); // Slightly faster spawn
        const timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(gameInterval);
                clearInterval(daisyInterval);
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        finalScore.textContent = score;
        endScreen.style.display = 'block';
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = daisies.length - 1; i >= 0; i--) {
            const daisy = daisies[i];
            const dx = clickX - daisy.x;
            const dy = clickY - daisy.y;
            if (Math.sqrt(dx * dx + dy * dy) < daisy.size * 1.5) { // Larger hit area
                daisies.splice(i, 1);
                score++;
                break;
            }
        }
    });

    function loadLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.sort((a, b) => b.score - a.score);
        topPlayersList.innerHTML = '';
        leaderboard.slice(0, 10).forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `\( {entry.name}: \){entry.score} очков`;
            topPlayersList.appendChild(li);
            if (index < 3) {
                li.textContent += ' (Получает Lamborghini!)';
            }
        });
        if (leaderboard.length >= 3) {
            prizes.style.display = 'block';
        }
    }

    saveScoreButton.addEventListener('click', () => {
        const name = playerNameInput.value.trim() || 'Аноним';
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ name, score });
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        loadLeaderboard();
        startButton.style.display = 'block';
        playerNameInput.value = '';
    });

    startButton.addEventListener('click', startGame);

    loadLeaderboard();
});