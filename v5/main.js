var page = document.querySelector('#page');
var intro = document.querySelector('#intro');
var inputPseudo = document.querySelector('#input-pseudo');
var inputPseudoHtml = document.querySelector('#input-pseudo-li');
var avatarList = document.querySelectorAll('.avatar-click');
var pseudoProfile = document.querySelector('#pseudo');
var profileDiv = document.querySelector('#profile');
var imgProfile = document.querySelector('#imgProfile');
var startBt = document.querySelector('#start');
var scoreTab = document.querySelector('#score-tab');
var scoreTableDiv = scoreTab.querySelector('#tableau tbody');
var game = document.querySelector('#game');
var quiz = document.querySelector('#quiz');
var questionNumberDiv = document.querySelector('#question-number');
var question = document.querySelector('#question');
var answer = document.querySelectorAll('.answer');
var scoreDiv = document.querySelector('#score');
var scoreStructure = document.querySelector('#score-structure');
var questionPoints = document.querySelector('#questionPoints');
var modalDiv = document.querySelector('#modal');
var modalIntro = document.querySelector('#modal-intro');
var modalTitle = document.querySelector('#modal-title');
var modalBody = document.querySelector('#modal-body');
var formData = new FormData();
var questionNumber = 0;
var maxQuestionNumber = 0;
var score = 0;
var playerId = -1;
var avatarSrc = 'img/BDI.jpg';
var activeAvatarHtml;
var playerName;
var newRow;


// --- Functions related to introductory form --- //

function disableAllAvatarActive() {
  activeAvatarHtml = document.querySelector('.avatar-active');
  activeAvatarHtml.classList.remove('avatar-active');
}

function changeAvatar(e) {
  disableAllAvatarActive();
  e.target.classList.add('avatar-active');
  avatarSrc = e.target.getAttribute('src'); // We use 'getAttribute' and not 'src' to have the relativepath and not the absolute
}

function getPlayerName() {
  playerName = inputPseudo.value !== '' ? inputPseudo.value : '';
}

function updateProfile() {
  playerName = inputPseudo.value;
  pseudoProfile.innerHTML = playerName;
  imgProfile.src = avatarSrc;
}

function startClick(e) {
  e.preventDefault();
  getPlayerName();
  if (playerName) {
    startGame();
  } else {
    shakeAnimation(inputPseudoHtml);
  }
}


// --- Functions related to the scoreboard --- //

function updateScoresTab(jsonScoresTab) {
  resetScoreTab();
  transition(scoreTab, 'Left', 'In', 700);
  jsonScoresTab.forEach(function (item) {
    addScoreTabTr(item);
  });
}

function addScoreTabTr(jsonScoreLine) {
  newRow = document.createElement('tr');
  newRow.id = 'playerId-' + jsonScoreLine.id;
  if (jsonScoreLine.id === playerId)
    newRow.classList.add('highlight-line');
  newRow.innerHTML = '<td>' + jsonScoreLine.position + '</td><td><img class="picture-avatar" src=' + jsonScoreLine.avatar + '></td><td class="bold">' + jsonScoreLine.pseudo + '</td><td>' + jsonScoreLine.points + ' pts</td>';
  scoreTableDiv.appendChild(newRow);
}

function resetScoreTab() {
  while (scoreTableDiv.children[1]) {
    scoreTableDiv.removeChild(scoreTableDiv.children[1]);
  }
}


// --- Functions related to the game --- //

function startGame() {
  updateProfile();
  hideIntro();
  showGame();
  getQuestionFromJSON();
}

function updateScore(points) {
  questionPoints.classList.remove('red', 'green', 'neutral');
  score += points;
  scoreDiv.textContent = score;
  scoreAnimation(points);
}

function updateQuestion(jsonQuestionInfo) {
  questionNumber++;
  questionNumberDiv.textContent = 'question ' + questionNumber + '/' + maxQuestionNumber;
  question.textContent = jsonQuestionInfo.question;
  jsonQuestionInfo.answers.forEach(function (item, index) {
    answer[index].innerHTML = item.text;
    answer[index].dataset.points = item.points;
  });
}

function endOfGame() {
  transition(game, 'Right', 'Out', 700);
  sendInfoToServer();
}

function nextQuestion() {
  getQuestionFromJSON();
  window.setTimeout(function () {
    transition(quiz, 'Left', 'In', 700);
  }, 700);
}

function answerClick(e) {
  updateScore(parseInt(e.target.dataset.points));
  transition(quiz, 'Down', 'Out', 700);
  if (questionNumber !== maxQuestionNumber) {
    nextQuestion();
  } else {
    endOfGame();
  }
}

// --- Functions related to AJAX --- //

function prepareInfoForServer() {
  formData.append('pseudo', playerName);
  formData.append('avatar', avatarSrc);
  formData.append('points', score);
}

function getQuestionFromJSON() {
  fetch('https://nicolassenecal.com/ca-cest-imac/jsonData.php', {mode: 'cors'})
          .then(function (response) {
            return response.json();
          })
          .then(function (myJson) {
            maxQuestionNumber = myJson.questions.length;
            updateQuestion(myJson.questions[questionNumber]);
          });
}

function getScoresFromJSON() {
  fetch('https://nicolassenecal.com/ca-cest-imac/jsonData.php', {mode: 'cors'})
          .then(function (response) {
            return response.json();
          })
          .then(function (myJson) {
            updateScoresTab(myJson.scores);
          });
}

function sendInfoToServer() {
  prepareInfoForServer();
  fetch('https://nicolassenecal.com/ca-cest-imac/posts.php', {
    method: 'POST',
    mode: 'cors',
    body: formData
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    treatInfoFromServer(myJson);
  });
}

function treatInfoFromServer(myJson) {
  playerId = myJson.player.id;
  getScoresFromJSON();
  showEndModal(myJson.message);
}

// --- Functions related to animations --- //

function transition(div, direction, inOrOut, time) {
  div.classList.remove('display-none');
  div.classList.add('transition' + direction + inOrOut);
  window.setTimeout(function () {
    if (inOrOut === 'Out')
      div.classList.add('display-none');
    div.classList.remove('transition' + direction + inOrOut);
  }, time);
}

function shakeAnimation(div) {
  div.classList.add('shakeAnimation');
  window.setTimeout(function () {
    div.classList.remove('shakeAnimation');
  }, 600);
}

function questionPointsAnimation(text, color) {
  questionPoints.textContent = text;
  questionPoints.classList.add(color);
  questionPoints.classList.remove('display-none');
  transition(questionPoints, 'Up', 'Out', 700);
}

function scoreAnimation(points) {
  if (points < 0) {
    questionPointsAnimation(points, 'red');
  } else if (points > 0) {
    questionPointsAnimation('+' + points, 'green');
  } else {
    shakeAnimation(scoreStructure);
  }
}

function hideIntro() {
  transition(intro, 'Right', 'Out', 700);
  transition(scoreTab, 'Left', 'Out', 700);
}

function showGame() {
  window.setTimeout(function () {
    transition(game, 'Left', 'In', 700);
  }, 1000);
}

function showEndModal(message) {
  transition(modalDiv, 'Fade', 'In', 500);
  page.classList.add('modal-active');
  modalIntro.innerHTML = message.intro;
  modalTitle.innerHTML = message.title;
  modalBody.innerHTML = message.body;
}

function hideEndModal() {
  transition(modalDiv, 'Fade', 'Out', 500);
  page.classList.remove('modal-active');
  window.setTimeout(function () {
    document.querySelector('#playerId-' + playerId).scrollIntoView({
      behavior: 'smooth'
    });
  }, 500);
}


// --- Events Listener --- //

function addEventOnAllList(divList, eventFunction) {
  divList.forEach(function (avatar) {
    avatar.addEventListener('click', eventFunction);
  });
}

startBt.addEventListener('click', startClick);
modalDiv.addEventListener('click', hideEndModal);
addEventOnAllList(avatarList, changeAvatar);
addEventOnAllList(answer, answerClick);
getScoresFromJSON();