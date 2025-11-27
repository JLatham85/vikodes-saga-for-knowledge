// All game state variables at top of script for ease of viewing

let flashcards = [];
let currentIndex = 0;
let heroLives = 10;
let enemyLives = 10;
let selectedCatergory = null;


// Trigger intro modal on page load

document.addEventListener("DOMContentLoaded", function() {
  var introModal = new bootstrap.Modal(document.getElementById('introModal'));
  introModal.show();
});

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


// Add a flashcard in array session storage only 

function addToFlashcards(question, correctAnswer, userAnswer) {
  fetchRecommendedLink(question).then(link => {
    flashcards.push({ question, correctAnswer, userAnswer, link });
    renderFlashcards(); // Only render AFTER the link is ready
  });
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

// Heart Rendering Function
function renderHearts() {
  const heroHearts = document.getElementById("hero-hearts");
  const enemyHearts = document.getElementById("enemy-hearts");

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

// Fetch quiz questions based on chosen category and difficulty from OpenTDB
async function fetchQuizQuestions(category, difficulty, amount = 10) {
  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Quiz fetch failed:", error);
    return [];
  }
}

// Start quiz after choices
async function startQuiz() {
  const category = document.getElementById("quizCategory").value;
  const difficulty = document.getElementById("quizDifficulty").value;

  const questions = await fetchQuizQuestions(category, difficulty, 5);
  renderQuiz(questions); // call the next function
}

// Render quiz (separate function, defined AFTER startQuiz)
function renderQuiz(questions) {
  const quizContainer = document.getElementById("quizContainer");
  quizContainer.innerHTML = "";

  let currentIndex = 0;

  function showQuestion(index) {
    const q = questions[index];
    quizContainer.innerHTML = `
      <h3>${q.question}</h3>
      <div id="quizOptions"></div>
      <div id="quizFeedback"></div>
    `;

    const options = [...q.incorrect_answers, q.correct_answer];
    options.sort(() => Math.random() - 0.5);

    const quizOptions = document.getElementById("quizOptions");
    options.forEach(option => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary m-2";
      btn.textContent = option;

      btn.onclick = () => {
        const feedback = document.getElementById("quizFeedback");
        if (option === q.correct_answer) {
          feedback.innerHTML = `<div class="alert alert-success">Correct! ⚔️</div>`;
        } else {
          feedback.innerHTML = `
            <div class="alert alert-danger">Wrong! ❌</div>
            <button class="btn btn-warning btn-sm mt-2"
              onclick="addToFlashcards('${q.question}', '${q.correct_answer}', '${option}')">
              Add to Flashcards
            </button>
          `;
        }

        // Move to next question
        setTimeout(() => {
          currentIndex++;
          if (currentIndex < questions.length) {
            showQuestion(currentIndex);
          } else {
            quizContainer.innerHTML = `<div class="alert alert-info">Raid complete! 🪓🏹</div>`;
          }
        }, 1500);
      };

      quizOptions.appendChild(btn);
    });
  }

  showQuestion(currentIndex);
}


