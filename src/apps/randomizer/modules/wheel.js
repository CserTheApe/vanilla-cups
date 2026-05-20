import { getRandom } from "./utils.js";


const appMain = document.getElementById("app-main");
const imageSection = document.getElementById("image-section");
const imageExtra = document.getElementById("image-extra");
const canvasExtra = document.getElementById("canvas-extra");
const canvasSection = document.getElementById("canvas-section");
const resultsSection = document.getElementById("results-section");

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const itemColors = [
    "#99ff99",
    "#ff9999",
    "#9999ff",
];
var baseAngle = 0;
var itemNames = [];

export const initialiseWheel = () => {
    appMain.style.flexDirection = "row";
    imageSection.style.display = "none";
    imageExtra.style.display = "none";
    canvasExtra.style.display = "flex";
    canvasSection.style.display = "flex";
    resultsSection.innerText = '';

    drawWheel();
    // ctx.beginPath();
    // ctx.arc(500, 500, 250, 0, Math.PI);
    // ctx.moveTo(500, 500);
    // ctx.arc(500, 500, 250, Math.PI, Math.PI * 2);
    // // ctx.arc(500, 500, 50, 0, Math.PI * 2);
    // ctx.stroke();
    // ctx.closePath();
}

const drawWheel = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBigWheel();
    drawItems();
    drawSmallWheel();
    drawArrow();
}

const drawBigWheel = () => {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(500, 500, 450, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
}

const drawSmallWheel = () => {
    ctx.fillStyle = "#6f4a3b";
    ctx.beginPath();
    ctx.arc(500, 500, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

const drawArrow = () => {
    ctx.fillStyle = "#6f4a3b";
    ctx.beginPath();
    ctx.moveTo(930, 500);
    ctx.lineTo(980, 450);
    ctx.lineTo(980, 550);
    ctx.lineTo(930, 500);
    ctx.fill();
    ctx.closePath();
}

const drawItems = () => {
    let itemCount = itemNames.length;
    // let fontSize = 32;
    let fontSize = 12 + 18 * Math.min((100 - itemCount) / 90, 1);
    ctx.font = fontSize+"px verdana";
    for (let i = 0; i < itemCount; i++) {
        // draw and fill arc
        ctx.beginPath();
        ctx.fillStyle = itemColors[i % 3];
        ctx.moveTo(500, 500);
        ctx.arc(500, 500, 450, baseAngle + i * ((Math.PI * 2) / itemCount), baseAngle + (i + 1) * ((Math.PI * 2) / itemCount));
        ctx.lineTo(500, 500);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        // draw name
        let textAngle = baseAngle + ((i + 0.5) * ((Math.PI * 2) / itemCount));
        let printText = itemNames[i];
        if (printText.length > 20) {
            printText = printText.substring(0, 16) + '...';
        }
        ctx.fillStyle = "#000000";
        ctx.save();
        ctx.translate(500 + 430 * Math.cos(textAngle), 500 + 430 * Math.sin(textAngle));
        ctx.rotate(textAngle);
        ctx.textAlign = "right";
        ctx.fillText(printText, 0, 0);
        ctx.restore();
    }
}



const textarea = document.getElementById("canvas-text");
const spinButton = document.getElementById("spin-it");

const textareaUpdateFunction = () => {
    itemNames = textarea.value.split("\n").map(x => x.trim()).filter(x => x.length > 0).slice(0, 100);
    if (itemNames.length > 0) {
        spinButton.disabled = false;
    }
    else {
        spinButton.disabled = true;
    }
    drawWheel();
}

textarea.addEventListener("input", textareaUpdateFunction);
textareaUpdateFunction();

spinButton.addEventListener("click", async () => {
    spinButton.disabled = true;
    textarea.disabled = true;
    textarea.value = itemNames.join("\n");
    requestAnimationFrame(startSpinWheel);
});

const getItemIndexAtZero = () => {
    let modBase = baseAngle % (Math.PI * 2);
    let zeroAngleRelativeToBase = ((Math.PI * 2) - modBase) % (Math.PI * 2);
    let i = Math.floor((zeroAngleRelativeToBase / (Math.PI * 2)) * itemNames.length);
    return i;
}

const deleteItemAtIndex = (i) => {
    itemNames.splice(i, 1);
    textarea.value = itemNames.join("\n");
    textareaUpdateFunction();
}

const checkSpinResult = () => {
    let i = getItemIndexAtZero();
    createNormalModal("Selected", itemNames[i], () => {deleteItemAtIndex(i)}, false);
}


const spinAccelTime = 1500;
const minSpinTime = 2000;
const maxSpinSpeed = 0.08;
var initTimestamp;
const startSpinWheel = (timestamp) => {
    if(initTimestamp === undefined) {
        initTimestamp = timestamp;
    }

    let timeDiff = timestamp - initTimestamp;

    if (timeDiff <= spinAccelTime) {
        let spinSpeed = maxSpinSpeed * timeDiff / spinAccelTime;
        baseAngle += spinSpeed;
        drawWheel();
        requestAnimationFrame(startSpinWheel);
    }
    else {
        initTimestamp = undefined;
        requestAnimationFrame(midSpinWheel);
    }
}
const midSpinWheel = (timestamp) => {
    if(initTimestamp === undefined) {
        initTimestamp = timestamp;
    }

    let timeDiff = timestamp - initTimestamp;

    if ((timeDiff > minSpinTime) && (getRandom() < 0.1)) {
        initTimestamp = undefined;
        requestAnimationFrame(stopSpinWheel);
    }
    else {
        baseAngle += maxSpinSpeed;
        drawWheel();
        requestAnimationFrame(midSpinWheel);
    }
}
const stopSpinWheel = (timestamp) => {
    if(initTimestamp === undefined) {
        initTimestamp = timestamp;
    }

    let timeDiff = timestamp - initTimestamp;

    if (timeDiff <= spinAccelTime) {
        let spinSpeed = maxSpinSpeed * (1 - timeDiff / spinAccelTime);
        baseAngle += spinSpeed;
        drawWheel();
        requestAnimationFrame(stopSpinWheel);
    }
    else {
        initTimestamp = undefined;
        spinButton.disabled = false;
        textarea.disabled = false;
        checkSpinResult();
    }
}