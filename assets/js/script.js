/* ===========================
   VARIABLES AND CONSTANTS
   =========================== */

// All game variables at top of script for ease of viewing

let quizQuestions = [];
let flashcards = [];
let currentIndex = 0;
let heroLives = 10;
let enemyLives = 10;
let selectedCategory = null;
let selectedDifficulty = null;
let heroMeeple = "";
let enemyMeeple = "";
let landscapeMeeple = "";

// Link to HTML containers

const arena = document.getElementById("arena");
const quizContainer = document.getElementById("quizContainer");
const heroHearts = document.getElementById("hero-hearts");
const enemyHearts = document.getElementById("enemy-hearts");
const quizFeedback = document.getElementById("quizFeedback");


/* ===========================
   ARENA MAPPING
   =========================== */

const arenaAssets = {
  generalKnowledge: {
    hero:   <img src="assets/images/webp/hydra-me.webp" alt="hydra hero"></img>,
    landscape: <img src="assets/images/webp/hydra-landscape.webp" alt="hydra landscape"></img>,
    easy:   { enemy: <img src="assets/images/webp/hydra-easy.webp" alt="hydra enemy easy"></img>},
    normal: { enemy: <img src="assets/images/webp/hydra-normal.webp" alt="hydra enemy normal"></img>},
    hard:   { enemy: <img src="assets/images/webp/hydra-hard.webp" alt="hydra enemy hard"></img>}
  },
  scienceComputers: {
    hero: <img src="assets/images/webp/troll-me.webp" alt="troll hero"></img>,
    landscape: <img src="assets/images/webp/troll-landscape.webp" alt="troll landscape"></img>,
    easy:   { enemy: <img src="assets/images/webp/troll-easy.webp" alt="troll enemy easy"></img>},
    normal: { enemy: <img src="assets/images/webp/troll-normal.webp" alt="troll enemy normal"></img>},
    hard:   { enemy: <img src="assets/images/webp/troll-hard.webp" alt="troll enemy hard"></img>}
  },
  mathematics: {
    hero: <img src="assets/images/webp/dragon-me.webp" alt="dragon hero"></img>,
    landscape: <img src="assets/images/webp/dragon-landscape.webp" alt="dragon landscape"></img>,
    easy:   { enemy: <img src="assets/images/webp/dragon-easy.webp" alt="dragon enemy easy"></img>},
    normal: { enemy: <img src="assets/images/webp/dragon-normal.webp" alt="dragon enemy normal"></img>},
    hard:   { enemy: <img src="assets/images/webp/dragon-hard.webp" alt="dragon enemy hard"></img>}
  },
  history: {
    hero: <img src="assets/images/webp/sorcerer-me.webp" alt="sorcerer hero"></img>,
    landscape: <img src="assets/images/webp/sorcerer-landscape.webp" alt="sorcerer landscape"></img>,
    easy:   { enemy: <img src="assets/images/webp/sorcerer-easy.webp" alt="sorcerer enemy easy"></img>},
    normal: { enemy: <img src="assets/images/webp/sorcerer-normal.webp" alt="sorcerer enemy normal"></img>},
    hard:   { enemy: <img src="assets/images/webp/sorcerer-hard.webp" alt="sorcerer enemy hard"></img>}
  }
  // add more categories here as needed
};

/* ===========================
   START SAGA FUNCTIONS
   =========================== */

function startSaga() {
  // Reset state for a fresh battle
  heroLives = 10;
  enemyLives = 10;
  currentIndex = 0;

  // Render arena using chosen category + difficulty
  renderArena(selectedCategory, selectedDifficulty);

  // Show hearts at full strength
  renderHearts();

  // Load the first question
  if (quizQuestions && quizQuestions.length > 0) {
    showQuestion(quizQuestions[currentIndex]);
  } else {
    console.error("No quiz questions available!");
  }
}

// Wire the Start Saga button
document.getElementById("startSagaBtn").onclick = () => {
  startSaga();
};
      
/* ===========================
   BATTLE FUNCTIONS
   =========================== */
   
// Render arena based on selected category and difficulty
function renderArena(category, difficulty) {
  const assets = arenaAssets[category];
  heroMeeple = assets.hero;                        
  enemyMeeple = assets[difficulty].enemy;          // varies by difficulty
  landscapeMeeple = assets.landscape;              

  const arena = document.getElementById("arena");
  arena.innerHTML = `
    <div class="landscape">
      <img src="assets/images/webp/${landscapeMeeple}" 
           alt="landscape" 
           class="${difficulty}">
    </div>
    <div class="battle-row">
      <div class="hero">
        <img src="assets/images/webp/${heroMeeple}" alt="hero meeple">
        <div id="hero-hearts"></div>
      </div>
      <div class="enemy">
        <img src="assets/images/webp/${enemyMeeple}" alt="enemy meeple">
        <div id="enemy-hearts"></div>
      </div>
    </div>
  `;
}

// Render Hearts Function

function renderHearts() {
  // Clear existing hearts
  heroHearts.innerHTML = "";
  enemyHearts.innerHTML = "";
  
  // Hero hearts
  for (let i = 0; i < 10; i++) {
    if (i < heroLives) {
      heroHearts.innerHTML += '<img src="assets/images/webp/full-heart.webp" alt="full heart">';
    } else {
      heroHearts.innerHTML += '<img src="assets/images/webp/empty-heart.webp" alt="empty heart">';
    }
  }

  // Enemy hearts
  for (let i = 0; i < 10; i++) {
    if (i < enemyLives) {
      enemyHearts.innerHTML += '<img src="assets/images/webp/full-heart.webp" alt="full heart">';
    } else {
      enemyHearts.innerHTML += '<img src="assets/images/webp/empty-heart.webp" alt="empty heart">';
    }
  }
}

// Handle answer and update lives
function handleAnswer(isCorrect) {
  if (isCorrect) {
    // Correct: enemy loses a life
    enemyLives--;
  } else {
    // Wrong: hero loses a life
    heroLives--;
  }

  renderHearts();

  // Check if battle has ended
  checkBattleEnd();
}
 
// Check battle end conditions

function checkBattleEnd() {
  if (heroLives <= 0) {
    alert("💀 The hero has fallen! Enemy wins.");
    return;
  }
  if (enemyLives <= 0) {
    alert("🏆 Victory! The hero triumphs.");
    return;
  }
  if (currentIndex >= quizQuestions.length) {
    alert("📜 The battle ends — all questions answered.");
    return;
  }
}


/* ===========================
   FLASHCARD FUNCTIONS
   =========================== */
   
// Add to flashcards function

function addToFlashcards(questionObj) {
  // Avoid duplicates
  if (!flashcards.some(fc => fc.question === questionObj.question)) {
    flashcards.push({
      question: decodeHtml(questionObj.question),
      correctAnswer: decodeHtml(questionObj.correct_answer)
    });
  }
  renderFlashcards();
}

// Render flashcards in the modal template

function renderFlashcards() {
  const list = document.getElementById("flashcardList");
  list.innerHTML = "";

  flashcards.forEach((card, index) => {
    const item = document.createElement("div");
    item.className = "card mb-2";
    item.innerHTML = `
      <div class="card-body">
        <p><strong>Q:</strong> ${card.question}</p>
        <p><strong>Your Answer:</strong> ${card.userAnswer}</p>
        <p><strong>Correct Answer:</strong> ${card.correctAnswer}</p>
        ${card.link ? `<p><a href="${card.link}" target="_blank">Learn more</a></p>` : ""}
        <button class="btn btn-danger btn-sm" onclick="deleteFlashcard(${index})">Delete</button>
      </div>`;
    list.appendChild(item);
  });
}

// Delete a flashcard option

function deleteFlashcard(index) {
  flashcards.splice(index, 1);
  renderFlashcards();
}

/* ===========================
   QUIZ FUNCTIONS
   =========================== */

// Render quiz (separate function, defined AFTER startQuiz)

function showQuestion(q) {
  quizContainer.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${decodeHtml(q.question)}</h5>
        <div id="quizOptions"></div>
        <div id="quizFeedback" class="mt-3"></div>
      </div>
    </div>
  `;

  const quizOptions = document.getElementById("quizOptions");
  const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1";
    btn.textContent = decodeHtml(option);

    btn.onclick = () => {
      if (option === q.correct_answer) {
        quizFeedback.innerHTML = `<div class="alert alert-success">Correct! ⚔️</div>`;
        handleAnswer(true);
      } else {
        quizFeedback.innerHTML = `
          <div class="alert alert-danger">Wrong! ❌</div>
          <button id="addFlashcardBtn" class="btn btn-warning">Add to Flashcards</button>
        `;
        handleAnswer(false);

        // Flashcard button wiring
        const addBtn = document.getElementById("addFlashcardBtn");
        if (addBtn) {
          addBtn.onclick = () => {
            if (!flashcards.some(fc => fc.question === q.question)) {
              flashcards.push({
                question: decodeHtml(q.question),
                correctAnswer: decodeHtml(q.correct_answer)
              });
            }
            renderFlashcards();
          };
        }
      }

    // Next Question button
    const nextBtn = document.createElement("button");
    nextBtn.id = "nextBtn";
    nextBtn.className = "btn btn-primary mt-2";
    nextBtn.textContent = "Next Question";
    nextBtn.onclick = () => {
        currentIndex++;
        if (currentIndex < quizQuestions.length) {
            showQuestion(quizQuestions[currentIndex]);
        } else {
            quizFeedback.innerHTML = `<div class="alert alert-info">Raid complete!</div>`;
        }
    };
    quizFeedback.appendChild(nextBtn);
};


// show the first question
  showQuestion(quizQuestions[currentIndex]);

/* ===========================
   FETCH FUNCTIONS
   =========================== */

// Change difficulty description to mine from OpenTDB
function mapDifficulty(difficulty) {
  return difficulty === "normal" ? "medium" : difficulty;
}

// Map our internal categories
const openTdbCategoryIds = {
  generalKnowledge: 9,
  scienceComputers: 18,
  mathematics: 19, 
  history: 23
};

// Fetch quiz questions from OpenTDB
async function fetchQuizQuestions(categoryKey, difficulty, amount = 10) {
  const categoryId = openTdbCategoryIds[categoryKey];
  const apiDifficulty = mapDifficulty(difficulty);

  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${apiDifficulty}&type=multiple`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Quiz fetch failed:", error);
    return [];
  }
}

// Start quiz after choices
async function startQuiz(categoryKey, difficulty) {
  // Reset state
  heroLives = 10;
  enemyLives = 10;
  flashcards = [];
  currentIndex = 0;

  // Render Arena before fetching questions
  renderArena(categoryKey, difficulty);

  // Fetch questions
  quizQuestions = await fetchQuizQuestions(categoryKey, difficulty);

  // Show first question
  function showQuestion() {
    const questionObj = quizQuestions[currentIndex];
  };
}

/* ===========================
   PAGE LOAD FUNCTIONS
   =========================== */

// Trigger intro modal on page load

document.addEventListener("DOMContentLoaded", function() {
  var introModal = new bootstrap.Modal(document.getElementById('introModal'));
  introModal.show();
});

// Start quiz button event listener
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startQuiz");
  const categorySelect = document.getElementById("quizCategory");
  const difficultySelect = document.getElementById("quizDifficulty");

  startBtn.addEventListener("click", async () => {
    const categoryKey = categorySelect.value;     
    const difficulty = difficultySelect.value;    

    // Call Saga start
    await startQuiz(categoryKey, difficulty);
  });
});

/* ===========================
   FORM VALIDATION FUNCTIONS
   =========================== */
// Custom error message and validation for contact form

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add("was-validated"); 
    } else {
      // Success message
      const success = document.createElement("div");
      success.className = "alert alert-success mt-3";
      success.textContent = "Your Raven has flown with the Scroll!";
      form.appendChild(success);

      form.reset();
      form.classList.remove("was-validated");
    }
  });
});

// Custom error message and validation for feedback form

document.addEventListener("DOMContentLoaded", function () {
  const feedbackForm = document.getElementById("feedbackForm");

  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop page reload

    if (!feedbackForm.checkValidity()) {
      // If invalid, show saga-style errors
      event.stopPropagation();
      feedbackForm.classList.add("was-validated");
    } else {
      // Success ritual
      const successMessage = document.createElement("div");
      successMessage.className = "alert alert-success mt-3";
      successMessage.textContent = "Your raven has flown with the feedback! The saga scrolls have been updated.";

      // Remove old banners if they exist
      const oldMessage = feedbackForm.querySelector(".alert-success");
      if (oldMessage) {
        oldMessage.remove();
      }

      // Append new banner
      feedbackForm.appendChild(successMessage);

      // Reset form for next raid
      feedbackForm.reset();
      feedbackForm.classList.remove("was-validated");
    }
  });
});

/* ===========================
   LINK FUNCTIONS
   =========================== */

// Fetch Recommended Link Function

async function fetchRecommendedLink(query) {
   try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const data = await response.json();

    if (data.query.search.length > 0) {
      const title = data.query.search[0].title;
      return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Link fetch failed:", error);
    return null;
  }
}


