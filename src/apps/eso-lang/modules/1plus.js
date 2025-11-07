import { arrayRotate } from "./utils.js";

export function execute1Plus(codeText, inputText, outputText, outputTextarea, memStack, inPtr, subroutineStack) {
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
                    outputText += memStack.pop();
                    outputTextarea.value = outputText;
                } else {
                    createNormalModal("Error","Nothing in stack to output");
                    return;
                }
                break;
            case ';':
                if (memStack.length > 0) {
                    outputText += String.fromCharCode(memStack.pop());
                    outputTextarea.value = outputText;
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
                execute1Plus(subroutineStack[subName], inputText, outputText, outputTextarea, memStack, inPtr, subroutineStack);
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