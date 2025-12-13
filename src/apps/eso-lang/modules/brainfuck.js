import { populateOverlay } from "./utils.js";

const MEM_BOX_SIZE = 150;
const MEM_BOX_Y = 100;
const ANIM_TIME = 400;

var memSizeInput = document.getElementById('mem-size');
memSizeInput.value = 300;
var memory;
var animTimestamp;
var debugRunMode = false;
var runSpeed = 1;
var loopStack = [];

var debugStep = document.getElementById("dbug-step");
var debugStop = document.getElementById("dbug-stop");
var debugRun = document.getElementById("dbug-run");
var codeTextarea = document.getElementById('code-text');
var inputTextarea = document.getElementById('input-text');
var outputTextarea = document.getElementById('output-text');
var codeText = codeTextarea.value;
var inputText = inputTextarea.value;
var codeOverlay = document.getElementById('code-overlay');
var [overlayPtr, inPtr, memPtr] = [0, 0, 0], overlayArray = [];

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

export function executeBrainfuck() {
    initialiseMemory();
    let tempVal, instPtr = 0;
    loopStack = [], inPtr = 0;
    codeText = codeTextarea.value;
    inputText = inputTextarea.value;
    outputTextarea.value = '';
    
    while(instPtr < codeText.length) {
        let inst = codeText[instPtr];
        switch(inst) {
            case '<':
                memPtr = safeMemPtr(memPtr - 1);
                break;
            case '>':
                memPtr = safeMemPtr(memPtr + 1);
                break;
            case '+':
                tempVal = memory[memPtr] + 1;
                if (tempVal > 255) tempVal = 0;
                memory[memPtr] = tempVal;
                break;
            case '-':
                tempVal = memory[memPtr] - 1;
                if (tempVal < 0) tempVal = 255;
                memory[memPtr] = tempVal;
                break;
            case '[':
                if (memory[memPtr] > 0)
                    loopStack.push(instPtr);
                else {
                    do {
                        instPtr++;
                    } while (codeText[instPtr] != ']')
                }
                break;
            case ']':
                if (memory[memPtr] == 0) {
                    loopStack.pop();
                }
                else {
                    instPtr = loopStack[loopStack.length - 1];
                }
                break;
            case '.':
                outputTextarea.value += String.fromCharCode(memory[memPtr]);
                break;
            case ',':
                if (inPtr >= inputText.length) {
                    createNormalModal("Error","Input not found");
                    return;
                }
                memory[memPtr] = inputText.charCodeAt(inPtr);
                inPtr++;
                break;
        }
        instPtr++;
    }
}

export function initialiseBrainfuckDebug() {
    codeText = codeTextarea.value;
    inputText = inputTextarea.value;
    outputTextarea.value = '';
    debugStep.disabled = false;
    debugRun.disabled = false;
    debugStop.disabled = false;
    codeOverlay.style.backgroundColor = 'white';
    initialiseMemory();
    loopStack = [], inPtr = 0;
    overlayArray = populateOverlay(codeText, codeOverlay, ['+', '-', '>', '<', '[', ']', ',', '.', '#']);
    overlayPtr = 0;
    drawMemory();
    checkEndScript();
}

export function debugBrainfuckRun() {
    debugRunMode = true;
    runSpeed = 5;
    debugBrainfuckStep();
}

export function debugBrainfuckStep() {
    document.getElementById(`overlay-${overlayArray[overlayPtr]}`).classList.remove('highlight');

    switch(codeText[overlayArray[overlayPtr]]) {
        case '+':
            bfDebugStepRunning();
            requestAnimationFrame(animPreTextIncrement);
            break;
        case '-':
            bfDebugStepRunning();
            requestAnimationFrame(animPreTextDecrement);
            break;
        case '<':
            bfDebugStepRunning();
            requestAnimationFrame(animPreLeft);
            break;
        case '>':
            bfDebugStepRunning();
            requestAnimationFrame(animPreRight);
            break;
        case '[':
            bfDebugStepRunning();
            if (memory[memPtr] > 0)
                loopStack.push(overlayPtr);
            else {
                do {
                    overlayPtr++;
                } while (codeText[overlayArray[overlayPtr]] != ']')
            }
            drawMemory();
            drawLoop();
            bfDebugStepRunning(false);
            break;
        case ']':
            bfDebugStepRunning();
            let alt = false;
            if (memory[memPtr] == 0) {
                loopStack.pop();
            }
            else {
                overlayPtr = loopStack[loopStack.length - 1];
                alt = true;
            }
            drawMemory();
            drawLoop(alt);
            bfDebugStepRunning(false);
            break;
        case ',':
            bfDebugStepRunning();
            requestAnimationFrame(animPreInput);
            break;
        case '.':
            bfDebugStepRunning();
            requestAnimationFrame(animPreOutput);
            break;
    }
}

function checkEndScript() {
    if (overlayPtr >= overlayArray.length) {
        codeOverlay.style.backgroundColor = '#33aa3377';
        debugStep.disabled = true;
        debugRun.disabled = true;
    }
    else {
        document.getElementById(`overlay-${overlayArray[overlayPtr]}`).classList.add('highlight');
    }
}

function bfDebugStepRunning(val = true) {
    debugStep.disabled = val;
    debugStop.disabled = val;
    debugRun.disabled = val;
    if(!val) {
        if(!debugRunMode) {
            do {overlayPtr++} while(codeText[overlayArray[overlayPtr]] == '#');
            checkEndScript();
        }
        else {
            overlayPtr++;
            if (codeText[overlayArray[overlayPtr]] == '#') {
                debugRunMode = false;
                runSpeed = 1;
                overlayPtr++;
                checkEndScript();
            }
            else {
                checkEndScript();
                if (overlayPtr < overlayArray.length) debugBrainfuckStep();
            }
        }
    }
}

function initialiseMemory() {
    let memSize = Number(memSizeInput.value);
    memory = new Array(memSize >= 10 && memSize <= 30000 ? memSize : 300).fill(0);
    memPtr = 0;
}

function safeMemPtr(val) {
    let memSize = memory.length;
    if (val >= memSize)
        return val - memSize;
    if (val < 0)
        return val + memSize;
    return val;
}

function drawMemory(offset = 0, textSize = 40) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMemArray(offset);
    drawMemPtr();
    drawMemData(offset, textSize);
}

function drawMemArray(offset = 0) {
    let leftOrigin = (canvas.width / 2) - (MEM_BOX_SIZE / 2) + offset;
    ctx.fillStyle = "#d1bea866";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.fillRect(0, MEM_BOX_Y, canvas.width, MEM_BOX_SIZE / 3);
    ctx.strokeStyle = "#6f4a3b";
    ctx.rect(leftOrigin, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin - MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin + MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin - 2 * MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin + 2 * MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin - 3 * MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin + 3 * MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin - 4 * MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin + 4 * MEM_BOX_SIZE, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.stroke();
}

function drawMemPtr() {
    let leftOrigin = (canvas.width / 2) - (MEM_BOX_SIZE / 2);
    ctx.strokeStyle = "#ac876fff";
    ctx.fillStyle = "#ac876fff";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.rect(leftOrigin, MEM_BOX_Y, MEM_BOX_SIZE, MEM_BOX_SIZE);
    ctx.rect(leftOrigin, MEM_BOX_Y - (MEM_BOX_SIZE / 10), MEM_BOX_SIZE, (MEM_BOX_SIZE / 20));
    ctx.rect(leftOrigin, MEM_BOX_Y + MEM_BOX_SIZE, MEM_BOX_SIZE, (MEM_BOX_SIZE / 20));
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo((canvas.width / 2) - (MEM_BOX_SIZE / 5), MEM_BOX_Y - 3 * (MEM_BOX_SIZE / 10));
    ctx.lineTo((canvas.width / 2) + (MEM_BOX_SIZE / 5), MEM_BOX_Y - 3 * (MEM_BOX_SIZE / 10));
    ctx.lineTo((canvas.width / 2), MEM_BOX_Y - (MEM_BOX_SIZE / 10));
    ctx.fill();
}

function drawMemData(offset = 0, textSize = 40) {
    let leftOrigin = (canvas.width / 2) + offset;
    ctx.font = '24px Arial';
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#6f4a3b";
    ctx.fillStyle = "#6f4a3b";
    ctx.fillText(memPtr, leftOrigin, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr - 1), leftOrigin - MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr + 1), leftOrigin + MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr - 2), leftOrigin - 2 * MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr + 2), leftOrigin + 2 * MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr - 3), leftOrigin - 3 * MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr + 3), leftOrigin + 3 * MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr - 4), leftOrigin - 3 * MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);
    ctx.fillText(safeMemPtr(memPtr + 4), leftOrigin + 3 * MEM_BOX_SIZE, MEM_BOX_Y + MEM_BOX_SIZE/6);

    ctx.font = `${textSize}px Arial`;
    ctx.fillText(memory[memPtr], leftOrigin, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.font = '40px Arial';
    ctx.fillText(memory[safeMemPtr(memPtr - 1)], leftOrigin - MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr + 1)], leftOrigin + MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr - 2)], leftOrigin - 2 * MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr + 2)], leftOrigin + 2 * MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr - 3)], leftOrigin - 3 * MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr + 3)], leftOrigin + 3 * MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr - 4)], leftOrigin - 3 * MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
    ctx.fillText(memory[safeMemPtr(memPtr + 4)], leftOrigin + 3 * MEM_BOX_SIZE, MEM_BOX_Y + 2 * MEM_BOX_SIZE/3);
}

function drawLoop(alt = false) {
    ctx.font = '48px Arial';
    ctx.lineWidth = 5;
    if (alt)
        ctx.fillText('Looping back', canvas.width/2, MEM_BOX_Y + 2 * MEM_BOX_SIZE);
    else
        ctx.fillText(`Loop depth: ${loopStack.length}`, canvas.width/2, MEM_BOX_Y + 2 * MEM_BOX_SIZE);
}

function drawInput(ratio) {
    let topOrigin = MEM_BOX_Y + 3 * MEM_BOX_SIZE/2;
    let offset = -50 * ratio;
    ctx.strokeStyle = "#6f4a3b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - 40, topOrigin + offset + 40);
    ctx.lineTo(canvas.width/2, topOrigin + offset);
    ctx.lineTo(canvas.width/2 + 40, topOrigin + offset + 40);
    ctx.moveTo(canvas.width/2, topOrigin + offset);
    ctx.lineTo(canvas.width/2, topOrigin + offset + MEM_BOX_SIZE);
    ctx.stroke();
    ctx.fillText(inputText[inPtr], canvas.width/2, topOrigin + MEM_BOX_SIZE + 40);
}

function drawOutput(ratio) {
    let topOrigin = MEM_BOX_Y + 3 * MEM_BOX_SIZE/2;
    let offset = 50 * ratio;
    ctx.strokeStyle = "#6f4a3b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, topOrigin + offset - 50);
    ctx.lineTo(canvas.width/2, topOrigin + offset + MEM_BOX_SIZE - 50);
    ctx.moveTo(canvas.width/2 - 40, topOrigin + offset + MEM_BOX_SIZE - 90);
    ctx.lineTo(canvas.width/2, topOrigin + offset + MEM_BOX_SIZE - 50);
    ctx.lineTo(canvas.width/2 + 40, topOrigin + offset + MEM_BOX_SIZE - 90);
    ctx.stroke();
    ctx.fillText(String.fromCharCode(memory[memPtr]), canvas.width/2, topOrigin + MEM_BOX_SIZE + 40);
}


const animPreTextIncrement = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }

    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        let textSize = 40 + (20 * timeDiff / (ANIM_TIME / runSpeed));
        drawMemory(0, textSize);
        requestAnimationFrame(animPreTextIncrement);
    }
    else {
        animTimestamp = undefined;
        let tempVal = memory[memPtr] + 1;
        if (tempVal > 255) tempVal = 0;
        memory[memPtr] = tempVal;
        requestAnimationFrame(animPostTextIncrement);
    }
}
const animPostTextIncrement = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }
    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        let textSize = 60 - (20 * timeDiff / (ANIM_TIME / runSpeed));
        drawMemory(0, textSize);
        requestAnimationFrame(animPostTextIncrement);
    }
    else {
        animTimestamp = undefined;
        bfDebugStepRunning(false);
    }
}

const animPreTextDecrement = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }

    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        let textSize = 40 + (20 * timeDiff / (ANIM_TIME / runSpeed));
        drawMemory(0, textSize);
        requestAnimationFrame(animPreTextDecrement);
    }
    else {
        animTimestamp = undefined;
        let tempVal = memory[memPtr] - 1;
        if (tempVal < 0) tempVal = 255;
        memory[memPtr] = tempVal;
        requestAnimationFrame(animPostTextDecrement);
    }
}
const animPostTextDecrement = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }
    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        let textSize = 60 - (20 * timeDiff / (ANIM_TIME / runSpeed));
        drawMemory(0, textSize);
        requestAnimationFrame(animPostTextDecrement);
    }
    else {
        animTimestamp = undefined;
        bfDebugStepRunning(false);
    }
}

const animPreLeft = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }

    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        let offset = (MEM_BOX_SIZE * timeDiff / (ANIM_TIME / runSpeed));
        drawMemory(offset);
        requestAnimationFrame(animPreLeft);
    }
    else {
        animTimestamp = undefined;
        memPtr = safeMemPtr(memPtr - 1);
        bfDebugStepRunning(false);
    }
}

const animPreRight = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }

    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        let offset = -(MEM_BOX_SIZE * timeDiff / (ANIM_TIME / runSpeed));
        drawMemory(offset);
        requestAnimationFrame(animPreRight);
    }
    else {
        animTimestamp = undefined;
        memPtr = safeMemPtr(memPtr + 1);
        bfDebugStepRunning(false);
    }
}

const animPreInput = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }

    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        drawMemory();
        drawInput(timeDiff/(ANIM_TIME / runSpeed));
        requestAnimationFrame(animPreInput);
    }
    else {
        animTimestamp = undefined;
        if (inPtr >= inputText.length) {
            createNormalModal("Error","Input not found");
            return;
        }
        memory[memPtr] = inputText.charCodeAt(inPtr);
        drawMemory();
        drawInput(1);
        inPtr++;
        bfDebugStepRunning(false);
    }
}

const animPreOutput = (timestamp) => {
    if(animTimestamp === undefined) {
        animTimestamp = timestamp;
    }

    let timeDiff = timestamp - animTimestamp;

    if (timeDiff <= (ANIM_TIME / runSpeed)) {
        drawMemory();
        drawOutput(timeDiff/(ANIM_TIME / runSpeed));
        requestAnimationFrame(animPreOutput);
    }
    else {
        animTimestamp = undefined;
        outputTextarea.value += String.fromCharCode(memory[memPtr]);
        bfDebugStepRunning(false);
    }
}