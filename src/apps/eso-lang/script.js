import { initialiseUtf, populateOverlay } from './modules/utils.js'
import { executeBrainfuck, initialiseBrainfuckDebug, debugBrainfuckStep, debugBrainfuckRun } from './modules/brainfuck.js';
import { execute1Plus } from './modules/1plus.js';

initialiseUtf();

const LANGS = [
    'Brainfuck',
    '1+',
    // 'Boolfuck',
    // 'Morsefuck',
    // 'BoolX',
    // 'bitch',
    // 'BitChanger',
    // 'Bitter',
    // 'Boolet',
];
const BREAKPOINTS = ['#', '!'];
var sLang = LANGS[0];
var sBreakpoint = BREAKPOINTS[0];
var breakpointText = document.getElementById('breakpoint-text');

var codeOverlay = document.getElementById('code-overlay');
var debugOptions = document.getElementById('dbug-options');
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var appInputSection = document.getElementById('app-input-section');
var codeTextarea = document.getElementById('code-text');
var inputTextarea = document.getElementById('input-text');
var outputTextarea = document.getElementById('output-text');
var codeText = codeTextarea.value;
var inputText = inputTextarea.value;

var langSelect = document.getElementById("lang-select");
langSelect.addEventListener("change", (e) => {
    sLang = e.target.value;
    sBreakpoint = BREAKPOINTS[LANGS.indexOf(sLang)];
    breakpointText.innerText = sBreakpoint;
});
for (let lang of LANGS) {
    const langOption = document.createElement("option");
    langOption.value = lang;
    langOption.innerHTML = lang;
    langSelect.appendChild(langOption);
}

let execBtn = document.getElementById("execute");
execBtn.addEventListener("click", () => {
    appInputSection.inert = true;
    execBtn.disabled = true;
    codeText = codeTextarea.value;
    inputText = inputTextarea.value;
    outputTextarea.value = '';
    switch(sLang) {
        case 'Brainfuck':
            executeBrainfuck();
            break;
        case '1+':
            execute1Plus(codeText, inputText, '', outputTextarea, [], 0, {});
            break;
    }
    appInputSection.inert = false;
    execBtn.disabled = false;
})

let debugBtn = document.getElementById("dbuggr");
debugBtn.addEventListener("click", () => {
    codeText = codeTextarea.value;
    enableDebug();
    
    let overlayArray;
    switch(sLang) {
        case 'Brainfuck':
            initialiseBrainfuckDebug();
            break;
        case '1+':
            overlayArray = populateOverlay(codeText, codeOverlay, ['#', '(', ')', '1', '[', ']', '+', '*', '"', '/', '\\', '^', '<', '.', ',', ':', ';', '|']);
            break;
    }
})

let debugStop = document.getElementById("dbug-stop");
debugStop.addEventListener("click", () => {
    enableDebug(false);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

let debugStep = document.getElementById("dbug-step");
debugStep.addEventListener("click", () => {
    switch(sLang) {
        case 'Brainfuck':
            debugBrainfuckStep();
            break;
        case '1+':
            // overlayArray = populateOverlay(codeText, codeOverlay, ['#', '(', ')', '1', '[', ']', '+', '*', '"', '/', '\\', '^', '<', '.', ',', ':', ';', '|']);
            break;
    }
})
let debugRun = document.getElementById("dbug-run");
debugRun.addEventListener("click", () => {
    switch(sLang) {
        case 'Brainfuck':
            debugBrainfuckRun();
            break;
        case '1+':
            // overlayArray = populateOverlay(codeText, codeOverlay, ['#', '(', ')', '1', '[', ']', '+', '*', '"', '/', '\\', '^', '<', '.', ',', ':', ';', '|']);
            break;
    }
})


function enableDebug(inp = true) {
    debugBtn.style.display = inp ? 'none' : 'block';
    debugOptions.style.display = inp ? 'block' : 'none';
    codeTextarea.style.display = inp ? 'none' : 'block';
    codeOverlay.style.display = inp ? 'block' : 'none';
    appInputSection.inert = inp ? true : false;
    execBtn.disabled = inp ? true : false;
    outputTextarea.inert = inp ? true : false;
}