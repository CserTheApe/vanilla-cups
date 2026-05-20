import { initialiseCoinToss, tossCoins } from "./modules/coin-toss.js";
import { initialiseDiceRoll, rollDice } from "./modules/dice-roll.js";
import { initialiseWheel } from "./modules/wheel.js";

const TOOLS = [
    'Coin Toss',
    'Dice Roll',
    'Wheel Picker'
];


var executeButton = document.getElementById("execute");
executeButton.addEventListener("click", () => {
    executeButton.disabled = true;
    switch(selectedTool) {
        case 'Coin Toss':
            tossCoins().finally(() => executeButton.disabled = false);
            break;
        case 'Dice Roll':
            rollDice().finally(() => executeButton.disabled = false);
            break;
    }
});

var toolSelect = document.getElementById("tool-select");
toolSelect.addEventListener("change", (e) => {
    selectedTool = e.target.value;
    switch(selectedTool) {
        case 'Coin Toss':
            executeButton.innerText = "Toss";
            toolNumberInput.value = 1;
            initialiseCoinToss();
            break;
        case 'Dice Roll':
            executeButton.innerText = "Roll";
            toolNumberInput.value = 2;
            initialiseDiceRoll();
            break;
        case 'Wheel Picker':
            initialiseWheel();
            break;
    }
});
for (let tool of TOOLS) {
    const toolOption = document.createElement("option");
    toolOption.value = tool;
    toolOption.innerHTML = tool;
    toolSelect.appendChild(toolOption);
}

var toolNumber = 1;
var toolNumberInput = document.getElementById("tool-number-input");
toolNumberInput.addEventListener("change", (e) => {
    toolNumber = Number(e.target.value);
    switch(selectedTool) {
        case 'Coin Toss':
            initialiseCoinToss(toolNumber);
            break;
        case 'Dice Roll':
            initialiseDiceRoll(toolNumber);
            break;
    }
});



//initialise
var selectedTool = TOOLS[0];
toolNumberInput.value = 1;
initialiseCoinToss();