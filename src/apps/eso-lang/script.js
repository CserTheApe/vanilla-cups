import { openUtfTable } from './modules/utils.js'
import { executeBrainfuck, initialiseBrainfuckDebug, debugBrainfuckStep, debugBrainfuckRun } from './modules/brainfuck.js';
import { debug1PlusRun, debug1PlusStep, execute1Plus, initialise1PlusDebug } from './modules/1plus.js';

document.getElementById("utf-button").addEventListener('click', openUtfTable);

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
    // 'Pain',
    // 'Fish',
];
const BREAKPOINTS = ['#', '!'];
var sLang = LANGS[1];
var sBreakpoint = BREAKPOINTS[1];
var breakpointText = document.getElementById('breakpoint-text');

var codeOverlay = document.getElementById('code-overlay');
var debugOptions = document.getElementById('dbug-options');
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var appInputSection = document.getElementById('app-input-section');
var codeTextarea = document.getElementById('code-text');
var outputTextarea = document.getElementById('output-text');

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
    switch(sLang) {
        case 'Brainfuck':
            executeBrainfuck();
            break;
        case '1+':
            execute1Plus();
            break;
    }
    appInputSection.inert = false;
    execBtn.disabled = false;
})

let debugBtn = document.getElementById("dbuggr");
debugBtn.addEventListener("click", () => {
    enableDebug();
    switch(sLang) {
        case 'Brainfuck':
            initialiseBrainfuckDebug();
            break;
        case '1+':
            initialise1PlusDebug();
            break;
    }
})

let debugStop = document.getElementById("dbug-stop");
debugStop.addEventListener("click", () => {
    let aId = requestAnimationFrame(() => {});
    cancelAnimationFrame(aId - 1);
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
            debug1PlusStep();
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
            debug1PlusRun();
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