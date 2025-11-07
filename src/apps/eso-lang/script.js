import { initialiseUtf } from './modules/utils.js'
import { executeBrainfuck } from './modules/brainfuck.js';
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
let sLang = LANGS[0];

let appInputSection = document.getElementById('app-input-section');
let codeTextarea = document.getElementById('code-text');
let inputTextarea = document.getElementById('input-text');
let outputTextarea = document.getElementById('output-text');
let memSizeInput = document.getElementById('mem-size');
memSizeInput.value = 300;

let langSelect = document.getElementById("lang-select");
langSelect.addEventListener("change", (e) => {
    sLang = e.target.value;
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
    let codeText = codeTextarea.value;
    let inputText = inputTextarea.value;
    outputTextarea.value = '';
    switch(sLang) {
        case 'Brainfuck':
            executeBrainfuck(codeText, inputText, '', outputTextarea, 0, 0, Number(memSizeInput.value));
            break;
        case '1+':
            execute1Plus(codeText, inputText, '', outputTextarea, [], 0, {});
            break;
    }
    appInputSection.inert = false;
    execBtn.disabled = false;
})
