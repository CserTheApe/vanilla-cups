import { delay, getRandom, until, maxObjectImageSize } from './utils.js'

const appMain = document.getElementById("app-main");
const imageSection = document.getElementById("image-section");
const imageExtra = document.getElementById("image-extra");
const canvasExtra = document.getElementById("canvas-extra");
const canvasSection = document.getElementById("canvas-section");
const resultsSection = document.getElementById("results-section");

export class Coin {
    constructor(image) {
        this.image = image;
        this.delayTime = getRandom();
        this.animId = undefined;
    }

    static size = maxObjectImageSize;

    async spin() {
        this.animId = this.image.animate(
            {
                backgroundPositionX: ["0px", `${Coin.size * 20}px`],
                easing: ['steps(20, end)']
            },
            {
                duration: 500,
                iterations: Infinity,
            }
        );
        await delay(this.delayTime);
        let num = Math.floor(getRandom() * 2);
        await until(_ => getComputedStyle(this.image).backgroundPositionX == `${num * Coin.size * 10}px`);
        this.animId.pause();
        return num;
    }
}


var coins = [];


const coinNumberChange = toolNumber => {
    coins = [];
    Coin.size = 100
    for (let i = 0; i < toolNumber; i++) {
        let temp_image = document.createElement("div");
        temp_image.style.width = `${Coin.size}px`;
        temp_image.style.height = `${Coin.size}px`;
        temp_image.style.backgroundImage = 'url("/assets/coin-sprite-sheet.png")';
        temp_image.style.backgroundSize = `auto ${Coin.size}px`;
        coins.push(new Coin(temp_image));
        imageSection.appendChild(temp_image);
    }
}

export function initialiseCoinToss(num = 1) {
    appMain.style.flexDirection = "column";
    canvasSection.style.display = "none";
    canvasExtra.style.display = "none";
    imageExtra.style.display = "flex";
    imageSection.style.display = "flex";
    imageSection.innerText = '';
    resultsSection.innerText = '';
    coinNumberChange(num);
}

export async function tossCoins() {
    coins.forEach(x => x.animId?.cancel());
    let results = [0, 0];
    (await Promise.all(coins.map(x => x.spin()))).forEach(x => (results[x]++));
    resultsSection.innerText = '';
    results.forEach((val, ind) => {
        let valWrapper = document.createElement("div");
        valWrapper.style.display = 'flex';
        valWrapper.style.alignItems = 'center';
        let valImage = document.createElement("div");
        valImage.classList.add("result-coin");
        valImage.style.backgroundPositionX = `${ind * 500}px`;
        valWrapper.appendChild(valImage);
        let valText = document.createElement("span");
        valText.innerHTML = `&nbsp;= ${val}`;
        valWrapper.appendChild(valText);
        resultsSection.appendChild(valWrapper);
    });
}