// DOM ELEMENTS
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const themeToggle = document.getElementById('theme-checkbox');
const historyPanel = document.getElementById('history-panel');
const historyToggleBtn = document.getElementById('history-toggle');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');


const OPERATOR_SYMBOLS = {
    add: '+',
    subtract: '-',
    multiply: '*',
    divide: '/'
};

const DISPLAY_SYMBOLS = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷'
};

const MAX_DIGITS = 15;
const MAX_ABS_INTEGER = Math.pow(10, MAX_DIGITS) - 1;
const DIGIT_GROUP_REGEX = /\B(?=(\d{3})+(?!\d))/g;

let tokens = [{ type: 'number', value: '0' }];
let parenthesesBalance = 0;
let resultDisplayed = false;
let calculationHistory = [];

function init() {
    loadTheme();
    loadHistory();

    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    themeToggle.addEventListener('change', toggleTheme);
    historyToggleBtn.addEventListener('click', toggleHistoryPanel);
    clearHistoryBtn.addEventListener('click', clearHistory);

    updateDisplay();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('calculatorTheme', theme);
}

function handleButtonClick(e) {
    const button = e.currentTarget;

    if (button.classList.contains('number')) {
        handleNumber(button.dataset.value);
    } else if (button.classList.contains('operator')) {
        handleOperator(button.dataset.action);
    } else if (button.classList.contains('function')) {
        handleFunction(button.dataset.action);
    } else if (button.classList.contains('equals')) {
        handleEquals();
    }
}

function handleNumber(digit) {
    if (!digit) return;

    if (resultDisplayed) {
        tokens = [{ type: 'number', value: digit }];
        resultDisplayed = false;
        updateDisplay();
        return;
    }

    const lastToken = getLastToken();

    if (lastToken && lastToken.type === 'number') {
        if (getDigitCount(lastToken.value) >= MAX_DIGITS) {
            return;
        }
        if (lastToken.value === '0' && !lastToken.value.includes('.') && digit !== '.') {
            lastToken.value = digit;
        } else {
            lastToken.value += digit;
        }
    } else {
        if (lastToken && lastToken.type === 'parenthesis' && lastToken.value === ')') {
            tokens.push({ type: 'operator', value: '*' });
        }
        tokens.push({ type: 'number', value: digit });
    }

    updateDisplay();
}

function handleOperator(action) {
    const operatorValue = OPERATOR_SYMBOLS[action];
    if (!operatorValue) return;

    if (resultDisplayed) {
        resultDisplayed = false;
    }

    if (!tokens.length) {
        tokens.push({ type: 'number', value: '0' });
    }

    const lastToken = getLastToken();

    if (!lastToken || (lastToken.type === 'parenthesis' && lastToken.value === '(')) {
        tokens.push({ type: 'number', value: '0' });
        tokens.push({ type: 'operator', value: operatorValue });
    } else if (lastToken.type === 'operator') {
        lastToken.value = operatorValue;
    } else {
        tokens.push({ type: 'operator', value: operatorValue });
    }

    updateDisplay();
}

function handleFunction(func) {
    switch (func) {
        case 'clear':
            clearCalculator();
            break;
        case 'decimal':
            addDecimal();
            break;
        case 'sign':
            toggleSign();
            break;
        case 'percentage':
            calculatePercentage();
            break;
        case 'parentheses':
            handleParenthesesToggle();
            break;
    }
}

function clearCalculator() {
    tokens = [{ type: 'number', value: '0' }];
    parenthesesBalance = 0;
    resultDisplayed = false;
    updateDisplay();
}

function addDecimal() {
    if (resultDisplayed) {
        tokens = [{ type: 'number', value: '0.' }];
        resultDisplayed = false;
        updateDisplay();
        return;
    }

    const lastToken = getLastToken();

    if (lastToken && lastToken.type === 'number') {
        if (!lastToken.value.includes('.')) {
            lastToken.value += '.';
        }
    } else {
        if (lastToken && lastToken.type === 'parenthesis' && lastToken.value === ')') {
            tokens.push({ type: 'operator', value: '*' });
        }
        tokens.push({ type: 'number', value: '0.' });
    }

    updateDisplay();
}

function toggleSign() {
    const lastToken = getLastNumberToken();
    if (!lastToken) return;

    if (lastToken.value.startsWith('-')) {
        lastToken.value = lastToken.value.slice(1);
    } else if (lastToken.value !== '0') {
        lastToken.value = `-${lastToken.value}`;
    }

    resultDisplayed = false;
    updateDisplay();
}

function calculatePercentage() {
    const lastToken = getLastNumberToken();
    if (!lastToken) return;

    const value = parseFloat(lastToken.value);
    if (isNaN(value)) return;

    lastToken.value = (value / 100).toString();
    resultDisplayed = false;
    updateDisplay();
}


function handleParenthesesToggle() {
    if (resultDisplayed) {
        resultDisplayed = false;
        tokens = [{ type: 'number', value: '0' }];
    }

    const lastToken = getLastToken();
    const canClose = parenthesesBalance > 0 && lastToken && (lastToken.type === 'number' || (lastToken.type === 'parenthesis' && lastToken.value === ')'));

    if (canClose) {
        tokens.push({ type: 'parenthesis', value: ')' });
        parenthesesBalance = Math.max(parenthesesBalance - 1, 0);
    } else {
        if (tokens.length === 1 && tokens[0].type === 'number' && tokens[0].value === '0') {
            tokens = [];
        } else if (lastToken && (lastToken.type === 'number' || (lastToken.type === 'parenthesis' && lastToken.value === ')'))) {
            tokens.push({ type: 'operator', value: '*' });
        }

        tokens.push({ type: 'parenthesis', value: '(' });
        parenthesesBalance += 1;
    }

    updateDisplay();
}

function handleEquals() {
    const preparedTokens = prepareTokensForEvaluation();
    if (!preparedTokens.length) return;

    const expressionString = tokensToExpressionString(preparedTokens);

    try {
        const rawResult = evaluateExpressionString(expressionString);
        const formattedResult = formatResult(rawResult);
        const expressionForHistory = tokensToDisplayString(preparedTokens);

        addToHistory(expressionForHistory, formattedResult);

        tokens = [{ type: 'number', value: formattedResult }];
        parenthesesBalance = 0;
        resultDisplayed = true;
        updateDisplay();
    } catch (error) {
        showError();
    }
}

function prepareTokensForEvaluation() {
    const prepared = [];
    let openParens = 0;

    tokens.forEach(token => {
        if (token.type === 'number') {
            if (token.value === '' || token.value === '-' || token.value === '.') return;
            prepared.push({ ...token });
        } else if (token.type === 'operator') {
            const lastPrepared = prepared[prepared.length - 1];
            if (!lastPrepared || lastPrepared.type === 'operator' || (lastPrepared.type === 'parenthesis' && lastPrepared.value === '(')) {
                if (lastPrepared && lastPrepared.type === 'operator') {
                    lastPrepared.value = token.value;
                }
                return;
            }
            prepared.push({ ...token });
        } else if (token.type === 'parenthesis') {
            if (token.value === '(') {
                openParens += 1;
                prepared.push({ ...token });
            } else if (openParens > 0) {
                const lastPrepared = prepared[prepared.length - 1];
                if (lastPrepared && lastPrepared.type !== 'operator') {
                    openParens -= 1;
                    prepared.push({ ...token });
                }
            }
        }
    });

    while (prepared.length && prepared[prepared.length - 1].type === 'operator') {
        prepared.pop();
    }

    while (openParens > 0) {
        const lastPrepared = prepared[prepared.length - 1];
        if (!lastPrepared || lastPrepared.type === 'operator' || (lastPrepared.type === 'parenthesis' && lastPrepared.value === '(')) {
            prepared.push({ type: 'number', value: '0' });
        }
        prepared.push({ type: 'parenthesis', value: ')' });
        openParens -= 1;
    }

    return prepared;
}

function evaluateExpressionString(expr) {
    const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
    if (sanitized !== expr) {
        throw new Error('Invalid characters in expression');
    }
    return Function(`"use strict"; return (${expr});`)();
}

function formatResult(value) {
    if (!isFinite(value)) {
        throw new Error('Invalid result');
    }

    const rounded = Math.round(value * 100000000) / 100000000;
    const absRounded = Math.abs(rounded);

    if (absRounded !== 0 && absRounded < 0.000001) {
        return rounded.toExponential(6);
    }

    if (Math.trunc(absRounded) > MAX_ABS_INTEGER) {
        throw new Error('Overflow');
    }

    const resultStr = rounded.toString();

    if (!/e/i.test(resultStr) && getDigitCount(resultStr) > MAX_DIGITS) {
        throw new Error('Overflow');
    }

    return resultStr;
}

function showError() {
    display.textContent = 'Error';
    tokens = [{ type: 'number', value: '0' }];
    parenthesesBalance = 0;
    resultDisplayed = true;
}

function getDigitCount(value = '') {
    return value.replace(/[^0-9]/g, '').length;
}

function formatNumberForDisplay(value = '') {
    if (value === '' || value === '-' || value === '.' || value === '-.') {
        return value;
    }

    if (/e/i.test(value)) {
        return value;
    }

    let workingValue = value;
    let suffix = '';

    if (workingValue.endsWith('.')) {
        suffix = '.';
        workingValue = workingValue.slice(0, -1);
    }

    let [integerPart, decimalPart] = workingValue.split('.');
    let sign = '';

    if (integerPart && integerPart.startsWith('-')) {
        sign = '-';
        integerPart = integerPart.slice(1);
    }

    if (integerPart === undefined || integerPart === '') {
        integerPart = '0';
    }

    const groupedInt = integerPart.replace(DIGIT_GROUP_REGEX, ',');
    const decimalSection = decimalPart !== undefined ? `.${decimalPart}` : '';

    return `${sign}${groupedInt}${decimalSection || suffix}`;
}

function updateDisplay() {
    display.textContent = tokensToDisplayString();
}

function tokensToDisplayString(list = tokens) {
    if (!list.length) return '0';

    let output = '';

    list.forEach(token => {
        if (token.type === 'operator') {
            output += ` ${DISPLAY_SYMBOLS[token.value] || token.value} `;
        } else if (token.type === 'parenthesis') {
            output += token.value;
        } else {
            output += formatNumberForDisplay(token.value);
        }
    });

    const normalized = output.replace(/\s+/g, ' ').trim();
    return normalized.length ? normalized : '0';
}

function tokensToExpressionString(list) {
    return list.map(token => token.value).join('');
}

function getLastToken() {
    return tokens[tokens.length - 1];
}

function getLastNumberToken() {
    for (let i = tokens.length - 1; i >= 0; i -= 1) {
        if (tokens[i].type === 'number') {
            return tokens[i];
        }
        if (tokens[i].type === 'parenthesis' && tokens[i].value === ')') {
            break;
        }
    }
    return null;
}

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
    } else if (e.key === '+') {
        handleOperator('add');
    } else if (e.key === '-') {
        handleOperator('subtract');
    } else if (e.key === '*') {
        handleOperator('multiply');
    } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('divide');
    } else if (e.key === '(') {
        insertSpecificParenthesis('open');
    } else if (e.key === ')') {
        insertSpecificParenthesis('close');
    } else if (e.key === '.') {
        addDecimal();
    } else if (e.key === '%') {
        calculatePercentage();
    } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        clearCalculator();
    } else if (e.key === 'Backspace') {
        handleBackspace();
    }
});

function insertSpecificParenthesis(type) {
    if (resultDisplayed) {
        resultDisplayed = false;
        tokens = [{ type: 'number', value: '0' }];
        parenthesesBalance = 0;
    }

    if (type === 'open') {
        if (tokens.length === 1 && tokens[0].type === 'number' && tokens[0].value === '0') {
            tokens = [];
        } else if (!resultDisplayed) {
            const lastToken = getLastToken();
            if (lastToken && (lastToken.type === 'number' || (lastToken.type === 'parenthesis' && lastToken.value === ')'))) {
                tokens.push({ type: 'operator', value: '*' });
            }
        }
        tokens.push({ type: 'parenthesis', value: '(' });
        parenthesesBalance += 1;
    } else if (type === 'close' && parenthesesBalance > 0) {
        const lastToken = getLastToken();
        if (lastToken && (lastToken.type === 'number' || (lastToken.type === 'parenthesis' && lastToken.value === ')'))) {
            tokens.push({ type: 'parenthesis', value: ')' });
            parenthesesBalance = Math.max(parenthesesBalance - 1, 0);
        }
    }

    resultDisplayed = false;
    updateDisplay();
}

function handleBackspace() {
    if (resultDisplayed) {
        clearCalculator();
        return;
    }

    const lastToken = getLastToken();
    if (!lastToken) {
        clearCalculator();
        return;
    }

    if (lastToken.type === 'number') {
        if (lastToken.value.length > 1) {
            lastToken.value = lastToken.value.slice(0, -1);
        } else {
            tokens.pop();
        }
    } else {
        if (lastToken.type === 'parenthesis') {
            if (lastToken.value === '(') {
                parenthesesBalance = Math.max(parenthesesBalance - 1, 0);
            } else if (lastToken.value === ')') {
                parenthesesBalance += 1;
            }
        }
        tokens.pop();
    }

    if (!tokens.length) {
        tokens = [{ type: 'number', value: '0' }];
    }

    updateDisplay();
}

function toggleHistoryPanel() {
    historyPanel.classList.toggle('active');
    historyToggleBtn.classList.toggle('active');
}

function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        renderHistory();
    }
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
}

function addToHistory(expression, result) {
    const historyItem = {
        expression,
        result,
        timestamp: new Date().toISOString()
    };

    calculationHistory.unshift(historyItem);

    if (calculationHistory.length > 50) {
        calculationHistory.pop();
    }

    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (!calculationHistory.length) {
        historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
        return;
    }

    historyList.innerHTML = '';

    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        const formattedResult = formatNumberForDisplay(item.result.toString());
        historyItem.innerHTML = `
            <div class="history-content">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${formattedResult}</div>
            </div>
            <button class="history-delete" data-index="${index}" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        const historyContent = historyItem.querySelector('.history-content');
        historyContent.addEventListener('click', () => {
            tokens = [{ type: 'number', value: item.result.toString() }];
            parenthesesBalance = 0;
            resultDisplayed = true;
            updateDisplay();

            if (window.innerWidth <= 480 && historyPanel.classList.contains('active')) {
                toggleHistoryPanel();
            }
        });

        const deleteBtn = historyItem.querySelector('.history-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHistoryItem(index);
        });

        historyList.appendChild(historyItem);
    });
}

function deleteHistoryItem(index) {
    calculationHistory.splice(index, 1);
    saveHistory();
    renderHistory();
}

function clearHistory() {
    if (!calculationHistory.length) return;

    if (confirm('Clear all calculation history?')) {
        calculationHistory = [];
        saveHistory();
        renderHistory();
    }
}

init();