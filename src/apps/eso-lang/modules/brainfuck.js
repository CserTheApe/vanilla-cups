export function executeBrainfuck(codeText, inputText, outputText, outputTextarea, inPtr, memPtr, memSize) {
    let memory = new Array(memSize >= 10 && memSize <= 30000 ? memSize : 300).fill(0);
    let tempVal, instPtr = 0, loopStack = [];
    
    while(instPtr < codeText.length) {
        let inst = codeText[instPtr];
        switch(inst) {
            case '<':
                memPtr--;
                if (memPtr < 0) memPtr += memory.length;
                break;
            case '>':
                memPtr++;
                if (memPtr >= memory.length) memPtr = 0;
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
                loopStack.push(instPtr);
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
                outputText += String.fromCharCode(memory[memPtr]);
                outputTextarea.value = outputText;
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