const display = document.getElementById('display');

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = "Error";
    }
}

const toggleCheckbox = document.querySelector('.toggle-checkbox');

toggleCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});