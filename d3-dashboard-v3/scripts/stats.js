// Function to animate counting
function animateCount(element, targetValue, suffix = "") {
    let currentValue = parseFloat(element.textContent);
    let increment = (targetValue - currentValue) / 50; // Adjust the duration by changing the division value
    let count = currentValue;

    let timer = setInterval(() => {
        count += increment;
        element.textContent = count.toFixed(1) + suffix;
        if (Math.abs(targetValue - count) < Math.abs(increment)) {
            clearInterval(timer);
            element.textContent = targetValue.toFixed(1) + suffix;
        }
    }, 50); // Adjust the interval for smoothness
}

// Trigger animation when document is ready
document.addEventListener("DOMContentLoaded", function() {
    const populationElement = document.getElementById("population");
    const lifeExpectancyElement = document.getElementById("life_expectancy");

    animateCount(populationElement, 7.9, " billion"); // Example: 7.9 billion
    animateCount(lifeExpectancyElement, 73.3, " years"); // Example: 73.3 years
});