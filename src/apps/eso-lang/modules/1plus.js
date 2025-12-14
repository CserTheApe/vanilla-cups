import { arrayRotate, populateOverlay } from "./utils.js";

const SYNTAX = ['#', '(', ')', '1', '[', ']', '+', '*', '"', '/', '\\', '^', '<', '.', ',', ':', ';', '|', '!'];
const MEM_BOX_SIZE = 150;
const MEM_BOX_Y = 100;
const MEM_BOX_X = 100;
const ANIM_TIME = 500;

var animTimestamp;
var debugRunMode = false;
var runSpeed = 1;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

var debugStep = document.getElementById("dbug-step");
var debugStop = document.getElementById("dbug-stop");
var debugRun = document.getElementById("dbug-run");
var codeTextarea = document.getElementById('code-text');
var inputTextarea = document.getElementById('input-text');
var outputTextarea = document.getElementById('output-text');
var codeText = codeTextarea.value;
var inputText = inputTextarea.value;
var codeOverlay = document.getElementById('code-overlay');

var overlayArrays = [], overlayPtrs = [], hashArrays = [];
var memStack = [], subroutineStack = {}, inPtr = 0, val1 = 0, val2 = 0;

function initialise() {
    memStack = [], subroutineStack = {}, hashArrays = [], inPtr = 0, val1 = 0, val2 = 0;
    codeText = codeTextarea.value;
    inputText = inputTextarea.value;
    outputTextarea.value = '';
    debugRunMode = false;
    runSpeed = 1;
}

export function execute1Plus(subroutineName) {
    let codeText;
    if(subroutineName) {
        codeText = subroutineStack[subroutineName];
    }
    else {
        initialise();
        codeText = codeTextarea.value;
    }
    let tempVal1 = 0, tempVal2 = 0, hashList = [], instPtr = 0;

    for (let i = 0; i < codeText.length; i++) {
        switch (codeText[i]) {
            case '#':
                hashList.push(i);
                break;
            case '(':
                tempVal1++;
                break;
            case ')':
                tempVal1--;
                if (tempVal1 < 0) {
                    createNormalModal("Error","Parentheses don't match");
                    return;
                }
                break;
            case '[':
                tempVal2++;
                break;
            case ']':
                tempVal2--;
                if (tempVal2 < 0) {
                    createNormalModal("Error","Brackets don't match");
                    return;
                }
                break;
        }
    }
    if (tempVal1 || tempVal2) {
        createNormalModal("Error","Brackets or parentheses don't match");
        return;
    }

    while(instPtr < codeText.length) {
        switch (codeText[instPtr]) {
            case '1':
                memStack.push(1);
                break;
            case '+':
                if (memStack.length > 1) {
                    memStack.push(memStack.pop() + memStack.pop());
                } else {
                    createNormalModal("Error","Addition requires atleast 2 numbers in stack");
                    return;
                }
                break;
            case '*':
                if (memStack.length > 1) {
                    memStack.push(memStack.pop() * memStack.pop());
                } else {
                    createNormalModal("Error","Multiplication requires atleast 2 numbers in stack");
                    return;
                }
                break;
            case '"':
                if (memStack.length > 0) {
                    memStack.push(memStack[memStack.length - 1]);
                } else {
                    createNormalModal("Error","Nothing in stack to duplicate");
                    return;
                }
                break;
            case '/':
                if (memStack.length > 0)
                    arrayRotate(memStack, true);
                break;
            case '\\':
                if (memStack.length > 0)
                    arrayRotate(memStack);
                break;
            case '^':
                if (memStack.length > 1) {
                    tempVal1 = memStack.pop();
                    tempVal2 = memStack.pop();
                    memStack.push(tempVal1);
                    memStack.push(tempVal2);
                } else {
                    createNormalModal("Error","Swapping requires atleast 2 numbers in stack");
                    return;
                }
                break;
            case '<':
                if (memStack.length > 1) {
                    tempVal1 = memStack.pop();
                    if (tempVal1 < memStack.pop())
                        memStack.push(0);
                    else
                        memStack.push(1);
                } else {
                    createNormalModal("Error","Conditional requires atleast 2 numbers in stack");
                    return;
                }
                break;
            case '.':
                if (inPtr >= inputText.length) {
                    createNormalModal("Error","Input not found");
                    return;
                }
                memStack.push(inputText.charCodeAt(inPtr));
                inPtr++;
                break;
            case ',':
                if (inPtr >= inputText.length) {
                    createNormalModal("Error","Input not found");
                    return;
                }
                tempVal1 = Number(inputText[inPtr]);
                if (isNaN(tempVal1)) {
                    createNormalModal("Error","Input is not a number");
                    return;
                }
                memStack.push(tempVal1);
                inPtr++;
                break;
            case ':':
                if (memStack.length > 0) {
                    outputTextarea.value += memStack.pop();
                } else {
                    createNormalModal("Error","Nothing in stack to output");
                    return;
                }
                break;
            case ';':
                if (memStack.length > 0) {
                    outputTextarea.value += String.fromCharCode(memStack.pop());
                } else {
                    createNormalModal("Error","Nothing in stack to output");
                    return;
                }
                break;
            case '#':
                if (memStack.length > 0) {
                    tempVal1 = memStack.pop();
                    if (tempVal1 >= hashList.length) {
                        createNormalModal("Error","Invalid control jump");
                        return;
                    } else {
                        instPtr = hashList[tempVal1];
                    }
                } else {
                    createNormalModal("Error","Control jump requires a number in stack");
                    return;
                }
                break;
            case '(':
                tempVal1 = 1;
                let subName = '', subCode = '', codeMode = false;
                while(tempVal1 > 0) {
                    instPtr++;
                    let inst = codeText[instPtr];
                    switch (inst) {
                        case '(':
                            tempVal1++;
                            break;
                        case ')':
                            tempVal1--;
                            break;
                        case '|':
                            if (codeMode) {
                                createNormalModal("Error","Subroutine definition error");
                                return;
                            }
                            codeMode = true;
                            break;
                        default:
                            if (codeMode) {
                                subCode += inst;
                            } else {
                                subName += inst;
                            }
                    }
                }
                if (subName.length < 1) {
                    createNormalModal("Error","Subroutine call is empty");
                    return;
                }
                if (subCode.length > 0)
                    subroutineStack[subName] = subCode;
                execute1Plus(subName);
                break;
            case '[':
                tempVal1 = 1;
                while(tempVal1 > 0) {
                    instPtr++;
                    switch (codeText[instPtr]) {
                        case '[':
                            tempVal1++;
                            break;
                        case ']':
                            tempVal1--;
                            break;
                    }
                }
                break;
        }
        instPtr++;
    }
}


function bracketCheck() {
    let tempVal1 = 0, tempVal2 = 0;
    hashArrays.unshift([]);
    
    for (let i = 0; i < overlayArrays[0].length; i++) {
        switch (codeText[overlayArrays[0][i]]) {
            case '#':
                hashArrays[0].push(i);
                break;
            case '(':
                tempVal1++;
                break;
            case ')':
                tempVal1--;
                if (tempVal1 < 0) {
                    createNormalModal("Error","Parentheses don't match");
                    return 1;
                }
                break;
            case '[':
                tempVal2++;
                break;
            case ']':
                tempVal2--;
                if (tempVal2 < 0) {
                    createNormalModal("Error","Brackets don't match");
                    return 1;
                }
                break;
        }
    }
    if (tempVal1 || tempVal2) {
        createNormalModal("Error","Brackets or parentheses don't match");
        return 1;
    }
    return 0;
}

function popOverlay() {
    overlayArrays.shift();
    overlayPtrs.shift();
    hashArrays.shift();
    overlayPtrs[0]++;
}

function isDebugStepRunning(val = true) {
    debugStep.disabled = val;
    debugRun.disabled = val;
    if(!val) {
        if(!debugRunMode) {
            do {
                overlayPtrs[0]++;
            }
            while(codeText[overlayArrays[0][overlayPtrs[0]]] == '!');
            if (overlayPtrs[0] >= overlayArrays[0].length)
                popOverlay();
            checkEndScript();
        }
        else {
            overlayPtrs[0]++;
            while(overlayArrays.length > 0) {
                if (overlayPtrs[0] >= overlayArrays[0].length) {
                    popOverlay();
                    continue;
                }
                if (codeText[overlayArrays[0][overlayPtrs[0]]] == '!') {
                    debugRunMode = false;
                    runSpeed = 1;
                    overlayPtrs[0]++;
                    continue;
                }
                if ([')', ']'].includes(codeText[overlayArrays[0][overlayPtrs[0]]])) {
                    overlayPtrs[0]++;
                    continue;
                }
                break;
            }
            checkEndScript();
            if (overlayArrays.length > 0) debug1PlusStep();
        }
    }
}

export function initialise1PlusDebug() {
    initialise();
    debugStep.disabled = false;
    debugRun.disabled = false;
    debugStop.disabled = false;
    codeOverlay.style.backgroundColor = 'white';
    overlayArrays = [populateOverlay(codeText, codeOverlay, SYNTAX)];
    overlayPtrs = [0];
    let res = bracketCheck();
    if (res === 0 && overlayPtrs[0] < overlayArrays[0].length) {
        drawMemory();
        checkEndScript();
    }
    else {
        popOverlay();
        checkEndScript();
        debugStep.disabled = true;
        debugRun.disabled = true;
    }
}

export function debug1PlusRun() {
    debugRunMode = true;
    runSpeed = 5;
    debug1PlusStep();
}

export function debug1PlusStep() {
    document.querySelectorAll('#code-overlay > span').forEach(x => x.classList.remove('highlight'));

    switch(codeText[overlayArrays[0][overlayPtrs[0]]]) {
        case '1':
            isDebugStepRunning();
            if (memStack.length > 0)
                requestAnimationFrame(anim1MoveStack);
            else
                requestAnimationFrame(anim1CreateBox);
            break;
        case '+':
            isDebugStepRunning();
            if (memStack.length > 1) {
                requestAnimationFrame(animPlusGet1);
            } else {
                createNormalModal("Error","Addition requires atleast 2 numbers in stack");
                return;
            }
            break;
        case '*':
            isDebugStepRunning();
            if (memStack.length > 1) {
                requestAnimationFrame(animProductGet1);
            } else {
                createNormalModal("Error","Multiplication requires atleast 2 numbers in stack");
                return;
            }
            break;
        case '"':
            isDebugStepRunning();
            if (memStack.length > 0) {
                requestAnimationFrame(animDuplicateMoveStack);
            } else {
                createNormalModal("Error","Nothing in stack to duplicate");
                return;
            }
            break;
        case '/':
            isDebugStepRunning();
            if (memStack.length > 0) {
                arrayRotate(memStack);
                requestAnimationFrame(animRotateT2B);
            }
            else
                isDebugStepRunning(false);
            break;
        case '\\':
            isDebugStepRunning();
            if (memStack.length > 0) {
                arrayRotate(memStack, true);
                requestAnimationFrame(animRotateB2T);
            }
            else
                isDebugStepRunning(false);
            break;
        case '^':
            isDebugStepRunning();
            if (memStack.length > 1) {
                val1 = memStack[0];
                memStack[0] = memStack[1];
                memStack[1] = val1;
                val1 = 0;
                requestAnimationFrame(animSwap);
            } else {
                createNormalModal("Error","Swapping requires atleast 2 numbers in stack");
                return;
            }
            break;
        case '<':
            isDebugStepRunning();
            if (memStack.length > 1) {
                requestAnimationFrame(animCondGet1);
            } else {
                createNormalModal("Error","Conditional requires atleast 2 numbers in stack");
                return;
            }
            break;
        case ',':
            isDebugStepRunning();
            if (inPtr >= inputText.length) {
                createNormalModal("Error","Input not found");
                return;
            }
            if (memStack.length > 0)
                requestAnimationFrame(animInNumMove);
            else
                requestAnimationFrame(animInNumCreateBox);
            break;
        case '.':
            isDebugStepRunning();
            if (inPtr >= inputText.length) {
                createNormalModal("Error","Input not found");
                return;
            }
            val1 = Number(inputText[inPtr]);
            if (isNaN(val1)) {
                createNormalModal("Error","Input is not a number");
                return;
            }
            if (memStack.length > 0)
                requestAnimationFrame(animInUniMove);
            else
                requestAnimationFrame(animInUniCreateBox);
            break;
        case ':':
            isDebugStepRunning();
            if (memStack.length > 0) {
                requestAnimationFrame(animOutNumGet);
            } else {
                createNormalModal("Error","Nothing in stack to output");
                return;
            }
            break;
        case ';':
            isDebugStepRunning();
            if (memStack.length > 0) {
                requestAnimationFrame(animOutUniGet);
            } else {
                createNormalModal("Error","Nothing in stack to output");
                return;
            }
            break;
        case '#':
            isDebugStepRunning();
            if (memStack.length > 0) {
                requestAnimationFrame(animJumpGet);
            } else {
                createNormalModal("Error","Control jump requires a number in stack");
                return;
            }
            break;
        case '(':
            isDebugStepRunning();
            let openVal = overlayArrays[0][overlayPtrs[0]], bracketCount = 1;
            let breakVal = openVal;
            while(![')', '|'].includes(codeText[breakVal])) {
                breakVal++;
            }
            if (breakVal <= openVal + 1) {
                createNormalModal("Error","Subroutine name is empty");
                return;
            }
            if (codeText[breakVal] == '|') {
                let subName = codeText.substring(openVal + 1, breakVal);
                let closeVal = breakVal;
                while (bracketCount > 0) {
                    closeVal++;
                    switch(codeText[closeVal]) {
                        case '(':
                            bracketCount++;
                            break;
                        case ')':
                            bracketCount--;
                            break;
                    }
                }
                let subCodeArray = [];
                for (let i = breakVal + 1; i < closeVal; i++) {
                    if (overlayArrays[0].includes(i)) {
                        subCodeArray.push(i);
                    }
                }
                overlayPtrs[0] = overlayArrays[0].indexOf(closeVal);
                subroutineStack[subName] = subCodeArray;
                overlayArrays.unshift(subroutineStack[subName]);
                overlayPtrs.unshift(-1);
                let res = bracketCheck();
                if (res === 0) {
                    drawMemory();
                    isDebugStepRunning(false);
                }
            }
            else {
                overlayPtrs[0] = overlayArrays[0].indexOf(breakVal);
                let srKey = codeText.substring(openVal + 1, breakVal);
                if (!(srKey in subroutineStack)) {
                    createNormalModal("Error","Subroutine not found");
                    return;
                }
                overlayArrays.unshift(subroutineStack[srKey]);
                overlayPtrs.unshift(-1);
                let res = bracketCheck();
                if (res === 0) {
                    drawMemory();
                    isDebugStepRunning(false);
                }
            }
            break;
        case '[':
            isDebugStepRunning();
            val1 = 1;
            while(val1 > 0) {
                overlayPtrs[0]++;
                switch (codeText[overlayArrays[0][overlayPtrs[0]]]) {
                    case '[':
                        val1++;
                        break;
                    case ']':
                        val1--;
                        break;
                }
            }
            isDebugStepRunning(false);
            break;
        case '!':
            isDebugStepRunning();
            isDebugStepRunning(false);
    }
}

function checkEndScript() {
    if (overlayArrays.length < 1) {
        codeOverlay.style.backgroundColor = '#33aa3377';
        debugStep.disabled = true;
        debugRun.disabled = true;
    }
    else {
        let elem = document.getElementById(`overlay-${overlayArrays[0][overlayPtrs[0]]}`);
        elem.classList.add('highlight');
        elem.scrollIntoView({behavior: 'smooth', container: 'nearest', block: 'center'});

        if (elem.innerText == '(') {
            let iPtr = overlayPtrs[0], inst;
            val2 = 1;
            while(val2 > 0) {
                iPtr++;
                inst = document.getElementById(`overlay-${overlayArrays[0][iPtr]}`);
                switch (inst.innerText) {
                    case '(':
                        val2++;
                        break;
                    case ')':
                        val2--;
                }
            }
            inst.classList.add('highlight');
        }
    }
}


const drawMemory = (offset = 0) => {
    let memLength = memStack.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 8;
    if (memLength < 4) {
        ctx.fillStyle = "#d1bea866";
        if (memLength == 0 && offset == MEM_BOX_SIZE)
            ctx.fillRect(MEM_BOX_X/2, MEM_BOX_Y + MEM_BOX_SIZE, MEM_BOX_X + MEM_BOX_SIZE, 100);
        else
            ctx.fillRect(MEM_BOX_X/2, MEM_BOX_Y + Math.max(memLength, 1) * MEM_BOX_SIZE + offset, MEM_BOX_X + MEM_BOX_SIZE, 100);
    }
    ctx.strokeStyle = "#6f4a3b";
    ctx.fillStyle = "#6f4a3b";
    ctx.textAlign = 'center';
    ctx.font = '32px Arial';
    ctx.lineWidth = 5;
    for (let i = 0; i < Math.min(memLength, 4); i++) {
        ctx.strokeRect(MEM_BOX_X, MEM_BOX_Y + i * MEM_BOX_SIZE + offset, MEM_BOX_SIZE, MEM_BOX_SIZE);
        ctx.fillText(memStack[i], MEM_BOX_X + MEM_BOX_SIZE/2, MEM_BOX_Y + i * MEM_BOX_SIZE + offset + MEM_BOX_SIZE/2);
    }

    ctx.fillStyle = "#6f4a3b";
    ctx.textAlign = 'left';
    ctx.font = '24px Arial';
    ctx.fillText(`Memory size: ${memLength}`, canvas.width - 240, canvas.height - 80);
    ctx.fillText(`Iteration depth: ${overlayArrays.length}`, canvas.width - 240, canvas.height - 40);
}

const drawVal = (valText, extra) => {
    ctx.fillStyle = "#6f4a3b";
    ctx.textAlign = 'center';
    ctx.font = '32px Arial';
    ctx.lineWidth = 5;
    ctx.fillText(valText, canvas.width - 100, MEM_BOX_Y + MEM_BOX_SIZE/2);
    if (extra)
        ctx.fillText(extra, canvas.width - 100, MEM_BOX_Y + MEM_BOX_SIZE/2 + 50);
}
const drawValArrow = (ratio, reverse = false) => {
    ctx.strokeStyle = "#6f4a3b";
    ctx.lineWidth = 8;
    ctx.beginPath();
    if(reverse) {
        ctx.moveTo(canvas.width - 250 - 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(canvas.width - 400 - 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(canvas.width - 365 - 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2 - 35);
        ctx.lineTo(canvas.width - 400 - 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(canvas.width - 365 - 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2 + 35);
    }
    else {
        ctx.moveTo(canvas.width - 500 + 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(canvas.width - 350 + 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(canvas.width - 385 + 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2 - 35);
        ctx.lineTo(canvas.width - 350 + 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(canvas.width - 385 + 100 * ratio, MEM_BOX_Y + MEM_BOX_SIZE/2 + 35);
    }
    ctx.stroke();
}
const drawRotateArrow = (reverse = false) => {
    ctx.strokeStyle = "#6f4a3b";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + MEM_BOX_SIZE/2);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 130, MEM_BOX_Y + MEM_BOX_SIZE/2);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 130, MEM_BOX_Y + MEM_BOX_SIZE/2 + 100);
    if(reverse) {
        ctx.moveTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 70, MEM_BOX_Y + MEM_BOX_SIZE/2 + 40);
        ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + MEM_BOX_SIZE/2);
        ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 70, MEM_BOX_Y + MEM_BOX_SIZE/2 - 40);
    }
    else {
        ctx.moveTo(MEM_BOX_X + MEM_BOX_SIZE + 130, MEM_BOX_Y + MEM_BOX_SIZE/2 + 100);
        ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 90, MEM_BOX_Y + MEM_BOX_SIZE/2 + 60);
        ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 130, MEM_BOX_Y + MEM_BOX_SIZE/2 + 100);
        ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 170, MEM_BOX_Y + MEM_BOX_SIZE/2 + 60);
    }
    ctx.stroke();
}
const drawSwapArrow = () => {
    ctx.strokeStyle = "#6f4a3b";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + MEM_BOX_SIZE, MEM_BOX_SIZE/2, -Math.PI / 2, Math.PI / 2);
    ctx.moveTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + MEM_BOX_SIZE/2);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 60, MEM_BOX_Y + MEM_BOX_SIZE/2 + 30);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + MEM_BOX_SIZE/2);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 60, MEM_BOX_Y + MEM_BOX_SIZE/2 - 30);
    ctx.moveTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + 3 * MEM_BOX_SIZE/2);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 60, MEM_BOX_Y + 3 * MEM_BOX_SIZE/2 + 30);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 30, MEM_BOX_Y + 3 * MEM_BOX_SIZE/2);
    ctx.lineTo(MEM_BOX_X + MEM_BOX_SIZE + 60, MEM_BOX_Y + 3 * MEM_BOX_SIZE/2 - 30);
    ctx.stroke();
}

const drawCreateBox = (ratio) => {
    drawMemory(MEM_BOX_SIZE);
    ctx.strokeStyle = "#6f4a3b";
    ctx.strokeRect(MEM_BOX_X * (1.5 - 0.5 * ratio), MEM_BOX_Y * (1.5 - 0.5 * ratio), MEM_BOX_SIZE * ratio, MEM_BOX_SIZE * ratio);
}
const drawDeleteBox = (ratio) => {
    drawMemory(MEM_BOX_SIZE);
    ctx.strokeStyle = "#6f4a3b";
    ctx.strokeRect(MEM_BOX_X * (1.5 - 0.5 * (1 -ratio)), MEM_BOX_Y * (1.5 - 0.5 * (1 -ratio)), MEM_BOX_SIZE * (1 -ratio), MEM_BOX_SIZE * (1 -ratio));
}

const drawGet1 = (ratio) => {
    drawMemory();
    drawVal(memStack[0]);
    drawValArrow(ratio);
}
const drawGet2 = (ratio, state = 0) => {
    drawMemory();
    drawVal(`${val1} ${state == 1 ? '*' : state == 2 ? '>=' : '+'} ${memStack[0]}`);
    drawValArrow(ratio);
}




const getAnimTimeRatio = (timestamp) => {
    if(animTimestamp === undefined)
        animTimestamp = timestamp;
    return (timestamp - animTimestamp) / (ANIM_TIME / runSpeed);
}

const anim1MoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * timeRatio);
        requestAnimationFrame(anim1MoveStack);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(anim1CreateBox);
    }
}
const anim1CreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        requestAnimationFrame(anim1CreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(1);
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animPlusGet1 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawGet1(timeRatio);
        requestAnimationFrame(animPlusGet1);
    }
    else {
        animTimestamp = undefined;
        val1 = memStack.shift();
        requestAnimationFrame(animPlusDeleteBox1);
    }
}
const animPlusDeleteBox1 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(val1);
        requestAnimationFrame(animPlusDeleteBox1);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animPlusMoveStack);
    }
}
const animPlusMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * (1 - timeRatio));
        drawVal(val1);
        requestAnimationFrame(animPlusMoveStack);
    }
    else {
        animTimestamp = undefined;
        drawMemory();
        drawVal(val1);
        requestAnimationFrame(animPlusGet2);
    }
}
const animPlusGet2 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawGet2(timeRatio);
        requestAnimationFrame(animPlusGet2);
    }
    else {
        animTimestamp = undefined;
        val2 = memStack.shift();
        requestAnimationFrame(animPlusDeleteBox2);
    }
}
const animPlusDeleteBox2 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(`${val1} + ${val2}`);
        requestAnimationFrame(animPlusDeleteBox2);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animPlusCreateBox);
    }
}
const animPlusCreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        drawValArrow(timeRatio, true);
        drawVal(`${val1} + ${val2}`);
        requestAnimationFrame(animPlusCreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(val1 + val2);
        val1 = 0, val2 = 0;
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animProductGet1 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawGet1(timeRatio);
        requestAnimationFrame(animProductGet1);
    }
    else {
        animTimestamp = undefined;
        val1 = memStack.shift();
        requestAnimationFrame(animProductDeleteBox1);
    }
}
const animProductDeleteBox1 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(val1);
        requestAnimationFrame(animProductDeleteBox1);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animProductMoveStack);
    }
}
const animProductMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * (1 - timeRatio));
        drawVal(val1);
        requestAnimationFrame(animProductMoveStack);
    }
    else {
        animTimestamp = undefined;
        drawMemory();
        drawVal(val1);
        requestAnimationFrame(animProductGet2);
    }
}
const animProductGet2 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawGet2(timeRatio, 1);
        requestAnimationFrame(animProductGet2);
    }
    else {
        animTimestamp = undefined;
        val2 = memStack.shift();
        requestAnimationFrame(animProductDeleteBox2);
    }
}
const animProductDeleteBox2 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(`${val1} * ${val2}`);
        requestAnimationFrame(animProductDeleteBox2);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animProductCreateBox);
    }
}
const animProductCreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        drawValArrow(timeRatio, true);
        drawVal(`${val1} * ${val2}`);
        requestAnimationFrame(animProductCreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(val1 * val2);
        val1 = 0, val2 = 0;
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animDuplicateMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * timeRatio);
        requestAnimationFrame(animDuplicateMoveStack);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animDuplicateCreateBox);
    }
}
const animDuplicateCreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        requestAnimationFrame(animDuplicateCreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(memStack[0]);
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animRotateT2B = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory();
        drawRotateArrow();
        requestAnimationFrame(animRotateT2B);
    }
    else {
        animTimestamp = undefined;
        isDebugStepRunning(false);
    }
}
const animRotateB2T = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory();
        drawRotateArrow(true);
        requestAnimationFrame(animRotateB2T);
    }
    else {
        animTimestamp = undefined;
        isDebugStepRunning(false);
    }
}
const animSwap = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory();
        drawSwapArrow();
        requestAnimationFrame(animSwap);
    }
    else {
        animTimestamp = undefined;
        isDebugStepRunning(false);
    }
}

const animCondGet1 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawGet1(timeRatio);
        requestAnimationFrame(animCondGet1);
    }
    else {
        animTimestamp = undefined;
        val1 = memStack.shift();
        requestAnimationFrame(animCondDeleteBox1);
    }
}
const animCondDeleteBox1 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(val1);
        requestAnimationFrame(animCondDeleteBox1);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animCondMoveStack);
    }
}
const animCondMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * (1 - timeRatio));
        drawVal(val1);
        requestAnimationFrame(animCondMoveStack);
    }
    else {
        animTimestamp = undefined;
        drawMemory();
        drawVal(val1);
        requestAnimationFrame(animCondGet2);
    }
}
const animCondGet2 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawGet2(timeRatio, 2);
        requestAnimationFrame(animCondGet2);
    }
    else {
        animTimestamp = undefined;
        val2 = memStack.shift();
        requestAnimationFrame(animCondDeleteBox2);
    }
}
const animCondDeleteBox2 = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(`${val1} >= ${val2}`);
        requestAnimationFrame(animCondDeleteBox2);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animCondCreateBox);
    }
}
const animCondCreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        drawValArrow(timeRatio, true);
        drawVal(`${val1} >= ${val2}`);
        requestAnimationFrame(animCondCreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(val1 >= val2 ? 1 : 0);
        val1 = 0, val2 = 0;
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animInNumMove = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * timeRatio);
        drawVal(inputText.charCodeAt(inPtr), 'INPUT');
        drawValArrow(timeRatio, true);
        requestAnimationFrame(animInNumMove);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animInNumCreateBox);
    }
}
const animInNumCreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        drawVal(inputText.charCodeAt(inPtr), 'INPUT');
        drawValArrow(timeRatio, true);
        requestAnimationFrame(animInNumCreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(inputText.charCodeAt(inPtr));
        inPtr++;
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animInUniMove = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * timeRatio);
        drawVal(val1, 'INPUT');
        drawValArrow(timeRatio, true);
        requestAnimationFrame(animInUniMove);
    }
    else {
        animTimestamp = undefined;
        requestAnimationFrame(animInUniCreateBox);
    }
}
const animInUniCreateBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawCreateBox(timeRatio);
        drawVal(val1, 'INPUT');
        drawValArrow(timeRatio, true);
        requestAnimationFrame(animInUniCreateBox);
    }
    else {
        animTimestamp = undefined;
        memStack.unshift(val1);
        inPtr++;
        drawMemory();
        isDebugStepRunning(false);
    }
}

const animOutNumGet = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory();
        drawVal(memStack[0], 'OUTPUT');
        drawValArrow(timeRatio);
        requestAnimationFrame(animOutNumGet);
    }
    else {
        animTimestamp = undefined;
        val1 = memStack.shift();
        outputTextarea.value += val1;
        requestAnimationFrame(animOutNumDeleteBox);
    }
}
const animOutNumDeleteBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(val1, 'OUTPUT');
        drawValArrow(timeRatio);
        requestAnimationFrame(animOutNumDeleteBox);
    }
    else {
        animTimestamp = undefined;
        if(memStack.length > 0)
            requestAnimationFrame(animOutNumMoveStack);
        else {
            drawMemory();
            drawVal(val1, 'OUTPUT');
            val1 = 0;
            isDebugStepRunning(false);
        }
    }
}
const animOutNumMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * (1 - timeRatio));
        drawVal(val1, 'OUTPUT');
        drawValArrow(timeRatio);
        requestAnimationFrame(animOutNumMoveStack);
    }
    else {
        animTimestamp = undefined;
        drawMemory();
        drawVal(val1, 'OUTPUT');
        val1 = 0;
        isDebugStepRunning(false);
    }
}

const animOutUniGet = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory();
        drawVal(String.fromCharCode(memStack[0]), 'OUTPUT');
        drawValArrow(timeRatio);
        requestAnimationFrame(animOutUniGet);
    }
    else {
        animTimestamp = undefined;
        val1 = String.fromCharCode(memStack.shift());
        outputTextarea.value += val1;
        requestAnimationFrame(animOutUniDeleteBox);
    }
}
const animOutUniDeleteBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(val1, 'OUTPUT');
        drawValArrow(timeRatio);
        requestAnimationFrame(animOutUniDeleteBox);
    }
    else {
        animTimestamp = undefined;
        if(memStack.length > 0)
            requestAnimationFrame(animOutUniMoveStack);
        else {
            drawMemory();
            drawVal(val1, 'OUTPUT');
            val1 = 0;
            isDebugStepRunning(false);
        }
    }
}
const animOutUniMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * (1 - timeRatio));
        drawVal(val1, 'OUTPUT');
        drawValArrow(timeRatio);
        requestAnimationFrame(animOutUniMoveStack);
    }
    else {
        animTimestamp = undefined;
        drawMemory();
        drawVal(val1, 'OUTPUT');
        val1 = 0;
        isDebugStepRunning(false);
    }
}

const animJumpGet = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory();
        drawVal(memStack[0], 'JUMP');
        drawValArrow(timeRatio);
        requestAnimationFrame(animJumpGet);
    }
    else {
        animTimestamp = undefined;
        val1 = memStack.shift();
        if (val1 >= hashArrays[0].length) {
            createNormalModal("Error","Invalid control jump");
            return;
        } else {
            overlayPtrs[0] = hashArrays[0][val1];
        }
        requestAnimationFrame(animJumpDeleteBox);
    }
}
const animJumpDeleteBox = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawDeleteBox(timeRatio);
        drawVal(val1, 'JUMP');
        drawValArrow(timeRatio);
        requestAnimationFrame(animJumpDeleteBox);
    }
    else {
        animTimestamp = undefined;
        if(memStack.length > 0)
            requestAnimationFrame(animJumpMoveStack);
        else {
            drawMemory();
            drawVal(val1, 'JUMP');
            val1 = 0;
            isDebugStepRunning(false);
        }
    }
}
const animJumpMoveStack = (timestamp) => {
    let timeRatio = getAnimTimeRatio(timestamp);
    if (timeRatio <= 1) {
        drawMemory(MEM_BOX_SIZE * (1 - timeRatio));
        drawVal(val1, 'JUMP');
        drawValArrow(timeRatio);
        requestAnimationFrame(animJumpMoveStack);
    }
    else {
        animTimestamp = undefined;
        drawMemory();
        drawVal(val1, 'JUMP');
        val1 = 0;
        isDebugStepRunning(false);
    }
}