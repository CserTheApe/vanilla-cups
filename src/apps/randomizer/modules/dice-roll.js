import { delay, getRandom, until, maxObjectImageSize } from './utils.js'

const appMain = document.getElementById("app-main");
const imageSection = document.getElementById("image-section");
const imageExtra = document.getElementById("image-extra");
const canvasExtra = document.getElementById("canvas-extra");
const canvasSection = document.getElementById("canvas-section");
const resultsSection = document.getElementById("results-section");

export class Die {
    constructor(image) {
        this.image = image;
        this.delayTime = getRandom();
        this.animId = undefined;
    }

    static size = maxObjectImageSize;

    async roll() {
        this.animId = this.image.animate(
            {
                backgroundPositionX: ["0px", `${-Die.size * 6}px`],
                easing: ['steps(6, end)']
            },
            {
                duration: 2000,
                iterations: Infinity,
            }
        );
        await delay(this.delayTime);
        let num = Math.floor(getRandom() * 6);
        await until(_ => getComputedStyle(this.image).backgroundPositionX == `${num * -Die.size}px`);
        this.animId.pause();
        return num;
    }
}


var dice = [];


const diceNumberChange = toolNumber => {
    dice = [];
    Die.size = 100
    for (let i = 0; i < toolNumber; i++) {
        let temp_image = document.createElement("div");
        temp_image.style.width = `${Die.size}px`;
        temp_image.style.height = `${Die.size}px`;
        temp_image.style.backgroundImage = 'url("/assets/dice-sprite-sheet.png")';
        temp_image.style.backgroundSize = `auto ${Die.size}px`;
        dice.push(new Die(temp_image));
        imageSection.appendChild(temp_image);
    }
}

export function initialiseDiceRoll(num = 2) {
    appMain.style.flexDirection = "column";
    canvasSection.style.display = "none";
    canvasExtra.style.display = "none";
    imageExtra.style.display = "flex";
    imageSection.style.display = "flex";
    imageSection.innerText = '';
    resultsSection.innerText = '';
    diceNumberChange(num);
}

export async function rollDice() {
    dice.forEach(x => x.animId?.cancel());
    let results = [0, 0, 0, 0, 0, 0];

    (await Promise.all(dice.map(x => x.roll()))).forEach(x => (results[x]++));
    resultsSection.innerText = '';
    results.forEach((val, ind) => {
        let valWrapper = document.createElement("div");
        valWrapper.style.display = 'flex';
        valWrapper.style.alignItems = 'center';
        let valImage = document.createElement("div");
        valImage.classList.add("result-die");
        valImage.style.backgroundPositionX = `${ind * -50}px`;
        valWrapper.appendChild(valImage);
        let valText = document.createElement("span");
        valText.innerHTML = `&nbsp;= ${val}`;
        valWrapper.appendChild(valText);
        resultsSection.appendChild(valWrapper);
    });
}