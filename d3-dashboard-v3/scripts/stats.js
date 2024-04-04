// Function to animate counting
function animateCount(element, targetValue, suffix = "") {
    // Check if the targetValue is for "countries"
    if (element.id === "countries") {
        targetValue = parseInt(targetValue);
    }
    
    let currentValue = parseFloat(element.textContent);
    let increment = (targetValue - currentValue) / 50; // Adjust the duration by changing the division value
    let count = currentValue;

    let timer = setInterval(() => {
        count += increment;
        element.textContent = (element.id === "countries" ? Math.round(count) : count.toFixed(1)) + suffix;
        if (Math.abs(targetValue - count) < Math.abs(increment)) {
            clearInterval(timer);
            element.textContent = (element.id === "countries" ? targetValue : targetValue.toFixed(1)) + suffix;
        }
    }, 50); // Adjust the interval for smoothness
}


// Trigger animation when document is ready
document.addEventListener("DOMContentLoaded", function() {
    const populationElement = document.getElementById("population");
    const lifeExpectancyElement = document.getElementById("life_expectancy");
    const countriesElement = document.getElementById("countries");
    const emissionsElement = document.getElementById("emissions");

    animateCount(populationElement, 7.9, " billion"); 
    animateCount(lifeExpectancyElement, 73.3, " years"); 
    animateCount(countriesElement, 194);
    animateCount(emissionsElement, 43.6);
});