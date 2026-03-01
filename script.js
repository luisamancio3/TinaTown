const wheelChallenges = [
  "No-scope attempt next round",
  "Talk in rhyme for 2 minutes",
  "Use only pistol for one match",
  "Hydration break for chat",
  "No jumping challenge",
  "Compliment enemy team",
  "Sing one line dramatically",
  "Reverse controls for 60s",
];

const wheelResult = document.getElementById("wheelResult");
const wheelSpinner = document.getElementById("wheelSpinner");
const spinWheelButton = document.getElementById("spinWheelButton");

spinWheelButton.addEventListener("click", () => {
  const index = Math.floor(Math.random() * wheelChallenges.length);
  wheelResult.textContent = `🎯 ${wheelChallenges[index]}`;
  wheelSpinner.classList.remove("spin");
  void wheelSpinner.offsetWidth;
  wheelSpinner.classList.add("spin");
});

const scoreEl = document.getElementById("score");
const alcoholLevelEl = document.getElementById("alcoholLevel");
const passOutChanceEl = document.getElementById("passOutChance");
const bestScoreEl = document.getElementById("bestScore");
const bestPlayerEl = document.getElementById("bestPlayer");
const playerNameEl = document.getElementById("playerName");
const drinkButton = document.getElementById("drinkButton");
const resetButton = document.getElementById("resetButton");
const messageEl = document.getElementById("gameMessage");
const avatarEl = document.getElementById("avatar");
const stateTextEl = document.getElementById("stateText");
const dangerMeterEl = document.getElementById("dangerMeter");

let score = 0;
let alcoholLevel = 0;
let isGameOver = false;

const BEST_KEY = "fruttinha_best_score";

function loadBestScore() {
  const raw = localStorage.getItem(BEST_KEY);
  if (!raw) {
    return { score: 0, player: "Nobody" };
  }

  try {
    const parsed = JSON.parse(raw);
    const safeScore = Number.isFinite(parsed.score) ? parsed.score : 0;
    const safePlayer = typeof parsed.player === "string" ? parsed.player : "Nobody";
    return { score: safeScore, player: safePlayer };
  } catch {
    return { score: 0, player: "Nobody" };
  }
}

function saveBestScore(newScore, player) {
  localStorage.setItem(BEST_KEY, JSON.stringify({ score: newScore, player }));
}

function currentPassOutChance(level) {
  return Math.min(5 + level * 9, 95);
}

function updateAvatar() {
  avatarEl.className = "avatar";

  if (isGameOver) {
    avatarEl.classList.add("passed-out");
    avatarEl.textContent = "😵";
    stateTextEl.textContent = "Passed out. Run over.";
    return;
  }

  if (alcoholLevel >= 8) {
    avatarEl.classList.add("wasted");
    avatarEl.textContent = "🥴";
    stateTextEl.textContent = "Absolute chaos unlocked.";
    return;
  }

  if (alcoholLevel >= 4) {
    avatarEl.classList.add("tipsy");
    avatarEl.textContent = "😆";
    stateTextEl.textContent = "Tipsy, but still in it.";
    return;
  }

  avatarEl.classList.add("sober");
  avatarEl.textContent = "🍓";
  stateTextEl.textContent = "Fresh start. Confidence level: high.";
}

function refreshStats() {
  const chance = currentPassOutChance(alcoholLevel);
  scoreEl.textContent = String(score);
  alcoholLevelEl.textContent = String(alcoholLevel);
  passOutChanceEl.textContent = `${chance}%`;
  dangerMeterEl.style.width = `${chance}%`;
}

function applyBestScoreIfNeeded() {
  const player = (playerNameEl.value || "Anonymous").trim() || "Anonymous";
  const best = loadBestScore();

  if (score > best.score) {
    saveBestScore(score, player);
    bestScoreEl.textContent = String(score);
    bestPlayerEl.textContent = player;
    messageEl.textContent = `🏆 New high score by ${player}: ${score}`;
  } else {
    bestScoreEl.textContent = String(best.score);
    bestPlayerEl.textContent = best.player;
  }
}

function initBestScore() {
  const best = loadBestScore();
  bestScoreEl.textContent = String(best.score);
  bestPlayerEl.textContent = best.player;
}

function handleDrink() {
  if (isGameOver) {
    messageEl.textContent = "Game over. Hit Reset Run to try again.";
    return;
  }

  alcoholLevel += 1;
  const gainedPoints = 10 + Math.floor(alcoholLevel * 1.5);
  score += gainedPoints;

  avatarEl.classList.add("drinking");
  setTimeout(() => avatarEl.classList.remove("drinking"), 200);

  const chance = currentPassOutChance(alcoholLevel);
  const roll = Math.random() * 100;

  if (roll < chance) {
    isGameOver = true;
    messageEl.textContent = `💀 Passed out at ${score} points.`;
    applyBestScoreIfNeeded();
  } else {
    messageEl.textContent = `+${gainedPoints} points. Still standing.`;
  }

  refreshStats();
  updateAvatar();
}

function resetRun() {
  score = 0;
  alcoholLevel = 0;
  isGameOver = false;
  messageEl.textContent = "Run reset. Press Drink and test your luck.";
  refreshStats();
  updateAvatar();
  const best = loadBestScore();
  bestScoreEl.textContent = String(best.score);
  bestPlayerEl.textContent = best.player;
}

drinkButton.addEventListener("click", handleDrink);
resetButton.addEventListener("click", resetRun);

initBestScore();
refreshStats();
updateAvatar();
