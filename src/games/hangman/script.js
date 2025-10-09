const WORDS = {
    Animals: ["KOALA", "CAPYBARA", "PORCUPINE", "PLATYPUS"],
    Birds: ["PARROT", "CROW", "PIGEON", "EAGLE", "VULTURE"],
    Fruits: ["APPLE", "BANANA", "ORANGE", "PEACH", "WATERMELON"],
    Countries: ["CANADA", "INDIA", "AUSTRALIA", "GERMANY", "ITALY", "IRELAND"],
};
const initContainer = document.getElementById("init-container");
const playContainer = document.getElementById("play-container");
const finalContainer = document.getElementById("final-container");
const newGameButton = document.getElementById("new-game-button");
let word = WORDS.Animals[0];
let selectedCategory = "";
let wordFillCount = 0,
    wrongCount = 0,
    maxWrongCount = 6;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.lineWidth = 20;
ctx.strokeStyle = "#6f4a3b";

const drawers = [
    () => {
        ctx.beginPath();
        ctx.moveTo(200, 100);
        ctx.lineTo(200, 800);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(190, 100);
        ctx.lineTo(600, 100);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(300, 100);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(600, 90);
        ctx.lineTo(600, 200);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.arc(600, 250, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(600, 300);
        ctx.lineTo(600, 500);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(600, 300);
        ctx.lineTo(500, 400);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(600, 300);
        ctx.lineTo(700, 400);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(600, 490);
        ctx.lineTo(520, 640);
        ctx.stroke();
        ctx.closePath();
    },
    () => {
        ctx.beginPath();
        ctx.moveTo(600, 490);
        ctx.lineTo(680, 640);
        ctx.stroke();
        ctx.closePath();
        gameOver(false);
    },
];

function deleteChildren(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.firstChild);
    }
}

function clickSelectBox(box) {
    selectedCategory = box.innerText;
    let categoryButtons = document.getElementsByClassName("selectbox");
    for (let cat of categoryButtons) {
        cat.classList.remove("selected");
    }
    box.classList.add("selected");
    newGameButton.disabled = false;
}

function populateSelectCategory() {
    selectedCategory = "";
    let allKeys = Object.keys(WORDS);
    let options = [];
    while (options.length < 3) {
        const items = allKeys.splice(
            Math.floor(Math.random() * allKeys.length),
            1
        );
        options.push(items[0]);
    }
    let selectCategoriesSection = document.getElementById("select-categories");
    deleteChildren(selectCategoriesSection);
    for (let item of options) {
        const categoryButton = document.createElement("div");
        categoryButton.classList.add("selectbox");
        categoryButton.innerHTML = item;
        categoryButton.addEventListener("click", (e) =>
            clickSelectBox(e.target)
        );
        selectCategoriesSection.appendChild(categoryButton);
    }
}

function initializeInitContainer() {
    initContainer.style.display = "flex";
    playContainer.style.display = "none";
    finalContainer.style.display = "none";
    newGameButton.disabled = true;
    populateSelectCategory();
    let range = document.getElementById("incorrect-range");
    let rangeText = document.getElementById("incorrect-range-value");
    rangeText.innerText = range.value;
    wrongCount = 10 - range.value;
    range.addEventListener("input", (e) => {
        wrongCount = 10 - e.target.value;
        rangeText.innerText = e.target.value;
    });
}

function initializePlayContainer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(100, 800);
    ctx.lineTo(800, 800);
    ctx.stroke();
    ctx.closePath();
    wordFillCount = 0;
    //initialize word section
    let wordChoices = WORDS[selectedCategory];
    word = wordChoices[Math.floor(Math.random() * wordChoices.length)];
    let wordSection = document.getElementById("word-section");
    deleteChildren(wordSection);
    for (let i of word) {
        const letterBox = document.createElement("div");
        letterBox.classList.add("letterbox");
        wordSection.appendChild(letterBox);
    }

    //initialize letters section
    let lettersSection = document.getElementById("letters-section");
    deleteChildren(lettersSection);
    for (let i of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        const letter = document.createElement("button");
        letter.classList.add("letter-button");
        letter.innerText = i;
        letter.addEventListener("click", (ev) => {
            checkLetter(i);
            ev.target.disabled = "true";
        });
        lettersSection.appendChild(letter);
    }

    initContainer.style.display = "none";
    playContainer.style.display = "flex";
    finalContainer.style.display = "none";

    for (let i = 0; i < wrongCount; i++) {
        drawers[i]();
    }
}

function checkLetter(letr) {
    if (word.indexOf(letr) > -1) {
        const boxes = document.getElementsByClassName("letterbox");
        for (let i in word) {
            if (word[i] === letr) {
                boxes[i].innerHTML = letr;
                wordFillCount += 1;
                if (wordFillCount === word.length) {
                    gameOver(true);
                }
            }
        }
    } else {
        drawers[wrongCount]();
        wrongCount += 1;
    }
}

function gameOver(result) {
    let letters = document.getElementsByClassName("letter-button");
    for (const letter of letters) {
        letter.disabled = true;
    }
    setTimeout(() => {
        initContainer.style.display = "none";
        playContainer.style.display = "none";
        finalContainer.style.display = "flex";

        let finalHeader = document.getElementById("final-header");
        if (result) finalHeader.innerText = "You win!";
        else finalHeader.innerText = "You lose!";
        let wordSection = document.getElementById("final-word-section");
        deleteChildren(wordSection);
        for (let i of word) {
            const letterBox = document.createElement("div");
            letterBox.classList.add("letterbox");
            letterBox.innerText = i;
            wordSection.appendChild(letterBox);
        }
    }, 1500);
}

initializeInitContainer();
