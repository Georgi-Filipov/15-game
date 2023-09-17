let timeSpent = 0;
let isGamePaused = true;
let timerInterval;
let shuffled = false;
let moves = 0;
let leaderBoard = JSON.parse(localStorage.getItem('leaderBoard')) || [];
let plate = [...document.querySelectorAll('.plate > div')];
let plateSquare = [plate.slice(0, 4), plate.slice(4, 8), plate.slice(8, 12), plate.slice(12, 16)];

const popupWinner = document.querySelector('.popup-wrapper.winner-popup');
const popupLeaders = document.querySelector('.popup-wrapper.leader-board-popup');
const popupLeadersCloseButton = popupLeaders.querySelector('button');
const popupLeadersTable = popupLeaders.querySelector('.popup-wrapper.leader-board-popup tbody');
const movesCounterPopup = popupWinner.querySelector('p span');
const movesCounter = document.querySelector('.moves-counter');
const timerContainer = document.querySelector('.game-timer');

const addItemsToLeaderBoard = item => {
  if (item) leaderBoard = [...leaderBoard, item].sort((a, b) => a.moves - b.moves);
  popupLeadersTable.innerHTML = leaderBoard.map(item => (`
    <tr>
      <td>${item.name}</td>
      <td class="digits">${item.moves}</td>
      <td class="digits">${item.time}</td>
    </tr>
  `)).join('');
}

const setItemPosition = (item, top, left, position) => {
  item.style.top = top;
  item.style.left = left;
  item.setAttribute('data-position', position);
}

const startTimer = async () => {
  const startTime = Date.now() - timeSpent;
  let counter = 0;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeSpent = Date.now() - startTime;
    counter++;

    const seconds = Math.floor(timeSpent / 1000) % 60;
    const minutes = Math.floor(timeSpent / (1000 * 60)) % 60;

    timerContainer.innerHTML = `${String(minutes).padStart(2, '0')}<span>${counter % 2 ? ':' : ''}</span>${String(seconds).padStart(2, '0')}`;
  }, 500);
};

const newGame = () => {
  plate = plate
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }, idx) => {
      setItemPosition(value, `${Math.floor(idx / 4) * 25}%`, `${idx % 4 * 25}%`, idx);
      return value;
    });
  plateSquare = [plate.slice(0, 4), plate.slice(4, 8), plate.slice(8, 12), plate.slice(12, 16)];
  moves = 0;
  movesCounter.innerHTML = moves;
  movesCounterPopup.innerHTML = moves;
  popupWinner.classList.remove('open');
  shuffled = true;
  isGamePaused = false;
  timeSpent = 0;

  startTimer();
}

const pauseGame = e => {
  if (isGamePaused) {
    isGamePaused = false;
    e.target.innerHTML = 'pause';
    startTimer();
  } else {
    isGamePaused = true;
    e.target.innerHTML = 'continue';
    clearInterval(timerInterval);
  }
}
const openLeaderBoard = () => {
  popupLeaders.classList.toggle('open');
}

const checkForWin = () => {
  if (!plate.find(el => el.getAttribute('data-index') !== el.getAttribute('data-position')) && shuffled) {
    movesCounter.innerHTML = moves;
    movesCounterPopup.innerHTML = moves;
    addItemsToLeaderBoard({
      name: 'Georgi',
      moves,
      time: `${String(Math.floor(timeSpent / (1000 * 60)) % 60)}:${String(Math.floor(timeSpent / 1000) % 60).padStart(2, '0')}`,
    });
    localStorage.setItem('leaderBoard', JSON.stringify(leaderBoard));
    popupWinner.classList.add('open');
    clearInterval(timerInterval);
  }
}

plate.forEach(item => {
  item.addEventListener('click', () => {
    if (isGamePaused) return;
    const empty = plate.find(el => el.classList.contains('empty'));

    const position = +item.getAttribute('data-position');
    const empPosition = +empty.getAttribute('data-position');

    const row = Math.floor(position / 4);
    const col = position % 4;

    const empRow = Math.floor(empPosition / 4);
    const empCol = empPosition % 4;

    const top = plateSquare?.[row - 1]?.[col];
    const right = plateSquare?.[row]?.[col + 1];
    const left = plateSquare?.[row]?.[col - 1];
    const bottom = plateSquare?.[row + 1]?.[col];

    if (![top, right, left, bottom].includes(empty)) return;

    plateSquare[row][col] = empty;
    plateSquare[empRow][empCol] = item;

    const emptyTop = empty.style.top;
    const emptyLeft = empty.style.left;

    const itemTop = item.style.top;
    const itemLeft = item.style.left;

    setItemPosition(empty, itemTop, itemLeft, position);
    setItemPosition(item, emptyTop, emptyLeft, empPosition);

    moves++;
    movesCounter.innerHTML = moves;

    checkForWin();
  });
});

const newGameButton = document.querySelectorAll('.new-game');
newGameButton.forEach(b => b.addEventListener('click', newGame));

const pauseGameButton = document.querySelector('.pause-game');
pauseGameButton.addEventListener('click', pauseGame);

const leaderBoardButton = document.querySelector('.leader-board');
leaderBoardButton.addEventListener('click', openLeaderBoard);
popupLeadersCloseButton.addEventListener('click', openLeaderBoard);


addItemsToLeaderBoard();