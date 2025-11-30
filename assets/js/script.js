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

/* ===========================
   ARENA MAPPING
   =========================== */

const arenaAssets = {
  generalKnowledge: {
    hero: "assets/images/webp/hydra-me.webp",
    landscape: "assets/images/webp/hydra-landscape.webp",
    easy:   { enemy: "assets/images/webp/hydra-easy.webp" },
    normal: { enemy: "assets/images/webp/hydra-normal.webp" },
    hard:   { enemy: "assets/images/webp/hydra-hard.webp" }
  },
  scienceComputers: {
    hero: "assets/images/webp/troll-me.webp",
    landscape: "assets/images/webp/troll-landscape.webp",
    easy:   { enemy: "assets/images/webp/troll-easy.webp" },
    normal: { enemy: "assets/images/webp/troll-normal.webp" },
    hard:   { enemy: "assets/images/webp/troll-hard.webp" }
  },
  animeManga: {
    hero: "assets/images/webp/dragon-me.webp",
    landscape: "assets/images/webp/dragon-landscape.webp",
    easy:   { enemy: "assets/images/webp/dragon-easy.webp" },
    normal: { enemy: "assets/images/webp/dragon-normal.webp" },
    hard:   { enemy: "assets/images/webp/dragon-hard.webp" }
  },
  history: {
    hero: "assets/images/webp/sorcerer-me.webp",
    landscape: "assets/images/webp/sorcerer-landscape.webp",
    easy:   { enemy: "assets/images/webp/sorcerer-easy.webp" },
    normal: { enemy: "assets/images/webp/sorcerer-normal.webp" },
    hard:   { enemy: "assets/images/webp/sorcerer-hard.webp" }
  }
  // add more categories here as needed
};

/*  ===========================
    HELPER FUNCTIONS
    =========================== */

// Put renderImage() here so other functions can utilise
function renderImage(path, altText) {
  return `<img src="${path}" alt="${altText}">`;
}

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/* ===========================
   START SAGA FUNCTIONS
   =========================== */

// Wire button to initQuiz
document.getElementById("startSagaBtn").onclick = () => {
  const selectedCategoryId = document.getElementById("quizCategory").value;
  const selectedDifficulty = document.getElementById("quizDifficulty").value;

  // Close difficulty modal
  const difficultyModal = bootstrap.Modal.getInstance(
    document.getElementById("difficultyModal"));
  if (difficultyModal) {
    difficultyModal.hide();
  }

  // Init quiz (fetch questions + render arena)
  initQuiz(selectedCategoryId, selectedDifficulty);

  // Open quiz arena modal
  const quizArenaModal = new bootstrap.Modal(
    document.getElementById("quizArenaModal"));
  quizArenaModal.show();
};


// Fetch first using OpenTDB category ID
async function initQuiz(categoryKey, difficulty) {
  quizQuestions = await fetchQuizQuestions(categoryKey, difficulty, 19);
  console.log("QuizQuestions after fetch:", quizQuestions);

  if (quizQuestions.length === 0) {
    console.error("No quiz questions returned from API!");
    return;
  }

  const categoryName = categoryKey;
  startSaga(categoryName, difficulty, quizQuestions); // pass questions in
}




// Start Saga function
function startSaga(categoryName, difficulty, quizQuestions) {
  const internalKey = categoryMap[categoryName];
  if (!internalKey) {
    console.error("No mapping found for category:", categoryName);
    return;
  }

  // Standardise difficulty naming
  const internalDifficulty = (difficulty === "medium") ? "normal" : difficulty;

  console.log("Starting saga with", quizQuestions.length, "questions");

  // Reset state for a fresh battle
  heroLives = 10;
  enemyLives = 10;
  currentIndex = 0;

  // Render arena using internal key + difficulty
  renderArena(internalKey, internalDifficulty);

  // Show hearts at full strength
  renderHearts();

  // Load the first question
  if (quizQuestions && quizQuestions.length > 0) {
    showQuestion(quizQuestions[currentIndex]);
  } else {
    console.error("No quiz questions available!");
  }
}
     
/* ===========================
   BATTLE FUNCTIONS
   =========================== */
   
// Render arena based on selected category and difficulty
function renderArena(categoryKey, difficulty) {
  const assets = arenaAssets[categoryKey];
  if (!assets) {
    console.error("No assets for category:", categoryKey);
    return;
  }

  // Landscape images
  document.getElementById("hero-landscape").src = assets.landscape;
  document.getElementById("enemy-landscape").src = assets.landscape;

  // Hero + enemy images (update src only)
  document.getElementById("hero-img").src = assets.hero;
  document.getElementById("enemy-img").src = assets[difficulty].enemy;
}

// Render Hearts Function
function renderHearts() {
  heroHearts.innerHTML = "";
  enemyHearts.innerHTML = "";

  const totalHearts = 10;
  const radius = 70; // distance from center (adjust for mobile/desktop)

  for (let i = 0; i < totalHearts; i++) {
    const angle = (i / totalHearts)
     * 2 * Math.PI; // distribute evenly around circle

    // Hero hearts
    const heroHeart = document.createElement("img");
    heroHeart.src = i < heroLives
      ? "assets/images/webp/full-heart.webp"
      : "assets/images/webp/empty-heart.webp";
    heroHeart.alt = i < heroLives ? "full heart" : "empty heart";
    heroHeart.style.position = "absolute";
    heroHeart.style.width = "24px";
    heroHeart.style.height = "24px";
    heroHeart.style.left = `${50 + radius * Math.cos(angle)}%`;
    heroHeart.style.top = `${50 + radius * Math.sin(angle)}%`;
    heroHeart.style.transform = "translate(-50%, -50%)";
    heroHearts.appendChild(heroHeart);

    // Enemy hearts
    const enemyHeart = document.createElement("img");
    enemyHeart.src = i < enemyLives
      ? "assets/images/webp/full-heart.webp"
      : "assets/images/webp/empty-heart.webp";
    enemyHeart.alt = i < enemyLives ? "full heart" : "empty heart";
    enemyHeart.style.position = "absolute";
    enemyHeart.style.width = "24px";
    enemyHeart.style.height = "24px";
    enemyHeart.style.left = `${50 + radius * Math.cos(angle)}%`;
    enemyHeart.style.top = `${50 + radius * Math.sin(angle)}%`;
    enemyHeart.style.transform = "translate(-50%, -50%)";
    enemyHearts.appendChild(enemyHeart);
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

  // Update visuals
  renderHearts();

  // Check if battle has ended
  checkBattleEnd();
}

// Check battle end conditions
function checkBattleEnd() {
  if (heroLives <= 0) {
    quizFeedback.innerHTML = `
      <div class="alert alert-danger">
        💀 The hero has fallen! Enemy wins.
      </div>
    `;
    return;
  }

  if (enemyLives <= 0) {
    quizFeedback.innerHTML = `
      <div class="alert alert-success">
        🏆 Victory! The hero triumphs.
      </div>
    `;
    return;
  }

  if (currentIndex >= quizQuestions.length) {
    quizFeedback.innerHTML = `
      <div class="alert alert-info">
        📜 The battle ends — all questions answered.
      </div>
    `;
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
        ${card.link ? '<p><a href="' + card.link + '" target="_blank">Learn more</a></p>' : ""}
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

// Render quiz
function showQuestion(q) {
  // Render question card
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
  const feedbackEl = document.getElementById("quizFeedback"); // <- use this

  quizOptions.innerHTML = "";

  // Shuffle answers
  const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1";
    btn.textContent = decodeHtml(option);

    btn.onclick = () => {
      const isCorrect = option === q.correct_answer;

      if (isCorrect) {
        feedbackEl.innerHTML = `<div class="alert alert-success">Correct! ⚔️</div>`;
        handleAnswer(true);
      } else {
        feedbackEl.innerHTML = `
          <div class="alert alert-danger">Wrong! ❌</div>
          <button id="addFlashcardBtn" class="btn btn-warning">Add to Flashcards</button>
        `;
        handleAnswer(false);

        // Flashcard button
        const addBtn = document.getElementById("addFlashcardBtn");
        if (addBtn) {
            addBtn.onclick = () => {
                if (!flashcards.some(fc => fc.question === q.question)) {
                    flashcards.push({
                        question: decodeHtml(q.question),
                        userAnswer: decodeHtml(option), // what the player picked
                        correctAnswer: decodeHtml(q.correct_answer),
                        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(q.correct_answer)}`
                    });
                }
                renderFlashcards();

                addBtn.remove();
            };
        }
      }

      // Show Next Question button (only once per question)
      if (!document.getElementById("nextBtn")) {
        const nextBtn = document.createElement("button");
        nextBtn.id = "nextBtn";
        nextBtn.className = "btn btn-primary mt-2";
        nextBtn.textContent = "Next Question";
        nextBtn.onclick = nextQuestion;
        feedbackEl.appendChild(nextBtn);
      }
    };

    quizOptions.appendChild(btn);
  });
}
function nextQuestion() {
  // Check battle state first
  if (heroLives <= 0) {
    endBattle("Hero defeated!");
    return;
  }
  if (enemyLives <= 0) {
    endBattle("Enemy defeated!");
    return;
  }

  // Progress to next question
  currentIndex++;
  if (currentIndex < quizQuestions.length) {
    showQuestion(quizQuestions[currentIndex]);
  } else {
    // If questions run out but hearts remain, fetch more
    fetchMoreQuestions();
  }
}


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
  animeManga: 31, 
  history: 23
};

// Fetch quiz questions from OpenTDB
async function fetchQuizQuestions(categoryName, difficulty, amount = 19) {
  const categoryId = openTdbCategoryIds[categoryName];
  const apiDifficulty = mapDifficulty(difficulty);

  console.log(
    `Fetching quiz: categoryName=${categoryName}, categoryId=${categoryId}, difficulty=${apiDifficulty}, amount=${amount}`
  );


  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${apiDifficulty}&type=multiple`
    );
    const data = await response.json();
    console.log("API raw data:", data);

    return data.results || [];
  } catch (error) {
    console.error("Quiz fetch failed:", error);
    return [];
  }
}

/* ===========================
   NAME MAPPING
   =========================== */

// Bridge between OpenTDB names and our internal keys)
const categoryMap = {
  "generalKnowledge": "generalKnowledge",
  "scienceComputers": "scienceComputers",
  "animeManga": "animeManga",
  "history": "history"
};

 /* ===========================
   PAGE LOAD FUNCTIONS
   =========================== */

// Trigger intro modal on page load

// PAGE LOAD FUNCTIONS (testing version delete after testing)
document.addEventListener("DOMContentLoaded", function() {
  document.addEventListener("click", function handler() {
    var introModalEl = document.getElementById("introModal");
    var introModal = new bootstrap.Modal(introModalEl);

    introModal.show();

    // Wait until modal is fully open before moving focus
    introModalEl.addEventListener("shown.bs.modal", function () {
      // Safe to move focus now
      introModalEl.querySelector(".btn-primary").focus();
    }, { once: true });

    document.removeEventListener("click", handler);
  }, { once: true });
});


/** document.addEventListener("DOMContentLoaded", function() {
  if (!localStorage.getItem("introModalShown")) {
    document.addEventListener("click", function handler() {
      var introModalEl = document.getElementById("introModal");
      var introModal = new bootstrap.Modal(introModalEl);
      introModal.show();

      introModalEl.addEventListener("shown.bs.modal", function () {
        introModalEl.querySelector(".btn-primary").focus();
      });

      localStorage.setItem("introModalShown", "true");
      document.removeEventListener("click", handler);
    }, { once: true });
  }
}); **/

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
