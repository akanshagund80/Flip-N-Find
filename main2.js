const board = document.getElementById('game-board');
const moveCounter = document.getElementById('move-counter');
const timer = document.getElementById('timer');
const inputForm = document.getElementById('input-form');
const playerNameInput = document.getElementById('player-name');

let cards = [];
let flipped = [];
let moves = 0;
let seconds = 0;
let interval;

function startTimer() {
    interval = setInterval(() => {
        seconds++;
        timer.textContent = seconds;
    }, 1000);
}

function stopTimer() {
    clearInterval(interval);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resetGame() {
    board.innerHTML = '';
    flipped = [];
    moves = 0;
    seconds = 0;
    moveCounter.textContent = '0';
    timer.textContent = '0';
    inputForm.style.display = 'none';

    const values = shuffle([...Array(8).keys(), ...Array(8).keys()]);
    cards = values.map((val, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = val;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
        return card;
    });

    startTimer();
}

function flipCard(e) {
    const card = e.target;
    if (card.classList.contains('flipped') || flipped.length === 2) return;

    card.textContent = card.dataset.value;
    card.classList.add('flipped');
    flipped.push(card);

    if (flipped.length === 2) {
        moves++;
        moveCounter.textContent = moves;
        if (flipped[0].dataset.value === flipped[1].dataset.value) {
            flipped = [];
            if (document.querySelectorAll('.flipped').length === 16) {
                stopTimer();
                inputForm.style.display = 'block';
            }
        } else {
            setTimeout(() => {
                flipped.forEach(c => {
                    c.classList.remove('flipped');
                    c.textContent = '';
                });
                flipped = [];
            }, 1000);
        }
    }
}

function submitScore() {
    const playerName = playerNameInput.value;
    if (!playerName) return alert("Enter your name");

    fetch("http://localhost:8080/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            playerName: playerName,
            moves: moves,
            time: seconds
        })
    }).then(() => {
        fetchLeaderboard();
        inputForm.style.display = 'none';
    });
}

function fetchLeaderboard() {
    fetch("http://localhost:8080/api/leaderboard")
        .then(res => res.json())
        .then(data => {
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = "<h2>Leaderboard</h2><ul>" +
                data.map(player =>
                    `<li>${player.playerName}: ${player.moves} moves, ${player.time} sec</li>`
                ).join('') +
                "</ul>";
        });
}

window.onload = () => {
    resetGame();
    fetchLeaderboard();
};
