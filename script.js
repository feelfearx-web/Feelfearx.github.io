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
        }

        draw() {
            // Draw stem
            ctx.strokeStyle = '#228b22';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size);
            ctx.lineTo(this.x, this.y + this.size * 2);
            ctx.stroke();

            // Draw petals
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.ellipse(this.x + Math.cos(i * Math.PI / 4) * this.size / 2,
                            this.y + Math.sin(i * Math.PI / 4) * this.size / 2,
                            this.size / 4, this.size / 2, i * Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw center
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function spawnDaisy() {
        const x = Math.random() * (canvas.width - 50) + 25;
        const y = Math.random() * (canvas.height - 100) + 50;
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
        daisyInterval = setInterval(spawnDaisy, 1000);
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
            if (Math.sqrt(dx * dx + dy * dy) < daisy.size) {
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