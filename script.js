const board = document.querySelector("#board");
const modal = document.querySelector(".modal");
const startBtn = document.querySelector(".btn-start");
const restartBtn = document.querySelector(".btn-restart");
const startScreen = document.querySelector(".start-game");
const gameOverScreen = document.querySelector(".game-over");

const scoreEl = document.querySelector("#score");
const highScoreEl = document.querySelector("#highScore");
const timeEl = document.querySelector("#time");

const size = 50;
let cols, rows;
let blocks = {};
let snake = [{ x: 1, y: 3 }];
let direction = "down";
let food;
let score = 0;
let time = "00-00";
let interval, timer;

let highScore = Number(localStorage.getItem("highScore")) || 0;
highScoreEl.textContent = highScore;

function clearAllIntervals() {
    clearInterval(interval);
    clearInterval(timer);
}


/* BUILD GRID */
function buildGrid() {
  cols = Math.floor(board.clientWidth / size);
  rows = Math.floor(board.clientHeight / size);
  board.innerHTML = "";
  blocks = {};

  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const b = document.createElement("div");
      b.className = "block";
      board.appendChild(b);
      blocks[`${x}-${y}`] = b;
    }
  }
}

/* FOOD */
function spawnFood() {
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
}

/* PIXEL EXPLOSION */
function explode(x, y) {
  const rect = blocks[`${x}-${y}`].getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");
    p.className = "pixel";
    p.style.left = rect.left + "px";
    p.style.top = rect.top + "px";
    p.style.setProperty("--x", `${Math.random() * 80 - 40}px`);
    p.style.setProperty("--y", `${Math.random() * 80 - 40}px`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

/* RENDER */
function render() {
  Object.values(blocks).forEach(b =>
    b.classList.remove("fill", "food", "head")
  );

  let head = { ...snake[0] };
  if (direction === "up") head.x--;
  if (direction === "down") head.x++;
  if (direction === "left") head.y--;
  if (direction === "right") head.y++;

  if (head.x < 0 || head.y < 0 || head.x >= rows || head.y >= cols) {
    return endGame();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    explode(food.x, food.y);
    score += 10;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreEl.textContent = highScore;
    }
    spawnFood();
  } else {
    snake.pop();
  }

snake.forEach((s, i) => {
    const b = blocks[`${s.x}-${s.y}`];
    b.classList.add("fill");

    if (i === 0) {
        b.classList.add("head");
        b.style.filter = "none";
    } else if (i === 1) {
        b.style.filter = "blur(0.6px)";
    } else if (i === 2) {
        b.style.filter = "blur(1.2px)";
    } else {
        b.style.filter = "none";
    }
});



  blocks[`${food.x}-${food.y}`].classList.add("food");
}

/* GAME CONTROL */
function startGame() {
    clearAllIntervals();

    document.querySelector("#game").classList.remove("shake");

    modal.style.display = "none";
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    buildGrid();

    snake = [{ x: 2, y: 3 }];
    direction = "down";
    score = 0;
    scoreEl.textContent = 0;

    time = "00-00";
    timeEl.textContent = time;

    spawnFood();
    render(); // FIRST FRAME

    interval = setInterval(render, 200);
    timer = setInterval(updateTime, 1000);
}


function endGame() {
    clearAllIntervals();

    document.querySelector("#game").classList.add("shake");

    modal.style.display = "flex";
    startScreen.style.display = "none";
    gameOverScreen.style.display = "flex";
}


function updateTime() {
  let [m, s] = time.split("-").map(Number);
  s++;
  if (s === 60) { m++; s = 0; }
  time = `${String(m).padStart(2, "0")}-${String(s).padStart(2, "0")}`;
  timeEl.textContent = time;
}

/* INPUT */
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && direction !== "down") direction = "up";
  if (e.key === "ArrowDown" && direction !== "up") direction = "down";
  if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
  if (e.key === "ArrowRight" && direction !== "left") direction = "right";
});

startBtn.onclick = startGame;
restartBtn.onclick = startGame;
