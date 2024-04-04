console.log("scatterPlot.js loaded");

// Set the dimensions and margins of the graph
const margins = { top: 20, right: 15, bottom: 60, left: 60 },
    widths = 470 - margins.left - margins.right,
    heights = 260 - margins.top - margins.bottom;

// Define scales outside of the CSV callback
const sx = d3.scaleLinear()
    .domain([0, 50])
    .range([0, widths]);
const sy = d3.scaleLinear()
    .domain([0, 90])
    .range([heights, 0]);

// Append the scatterSvg object to the body of the page
const scatterSvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", widths + margins.left + margins.right)
    .attr("height", heights + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

// Define a clipping path with the same dimensions as the graph area
scatterSvg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", widths)
    .attr("height", heights);

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 1000])
    .on("zoom", zoomed);

// Add X axis and assign class for later selection
scatterSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${heights})`)
    .call(d3.axisBottom(sx))
    .attr("color", "white");
scatterSvg.append("text")
    .attr("class", "x-axis-label")
    .style("font-size", "15px")
    .style("font-weight", "100")
    .style("fill", "white")
    .attr("text-anchor", "middle")
    .attr("x", widths / 2)
    .attr("y", heights + margins.bottom - 15) // Adjust position as needed
    .text("Birth Rate");

// Add Y axis and assign class for later selection
scatterSvg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(sy))
    .attr("color", "white");
scatterSvg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .style("font-size", "15px")
    .style("font-weight", "100")
    .style("fill", "white")
    .attr("transform", "rotate(-90)")
    .attr("x", -heights / 2)
    .attr("y", -margins.left + 22) // Adjust position as needed
    .text("Life Expectancy");

// Define the zoomed function
function zoomed(event) {
    // Create new scale objects based on event
    const new_sxScale = event.transform.rescaleX(sx);
    const new_syScale = event.transform.rescaleY(sy);

    // Update axes with these new scales
    scatterSvg.select(".x-axis").call(d3.axisBottom(new_sxScale));
    scatterSvg.select(".y-axis").call(d3.axisLeft(new_syScale));

    // Update circle positions based on new scales
    scatterSvg.selectAll("circle")
        .attr('cx', d => new_sxScale(d['Birth Rate']))
        .attr('cy', d => new_syScale(d['Life expectancy']));

    // Update invisible rectangles based on new scales
    scatterSvg.selectAll(".zoom-area")
        .attr("x", d => new_sxScale(d['Birth Rate']) - 10) // Adjust the size of the zoom area
        .attr("y", d => new_syScale(d['Life expectancy']) - 10); // Adjust the size of the zoom area
}

// Define the div for the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Attach zoom behavior to the scatterSvg
scatterSvg.call(zoom);

// Read the data
d3.csv("./data/world-data-2023.csv").then(function (data) {
    // Apply the clipping path to the group where the dots will be added
    const dotsGroup = scatterSvg.append('g')
        .attr("clip-path", "url(#clip)") // Apply the clip path here
        .attr("class", "dots");

    // Add invisible rectangles for zoom interaction areas
    dotsGroup.selectAll(".zoom-area")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "zoom-area")
        .attr("x", d => sx(d['Birth Rate']) - 10) // Adjust the size of the zoom area
        .attr("y", d => sy(d['Life expectancy']) - 10) // Adjust the size of the zoom area
        .attr("width", 100) // Adjust the size of the zoom area
        .attr("height", 100) // Adjust the size of the zoom area
        .style("fill", "transparent") // Make the rectangle invisible
        .style("pointer-events", "all") // Make the rectangle capture mouse events

    // Add dots
    dotsGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => sx(d['Birth Rate']))
        .attr("cy", d => sy(d['Life expectancy']))
        .attr("r", 6) 
        .style("fill", "#BFF5FF")
        .style("opacity", .4)
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Country: " + d.Country + "<br/>Birth Rate: " + d['Birth Rate'] + "<br/>Life Expectancy: " + d['Life expectancy'])
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        // Function to handle zoom out button click
function zoomOut() {
    // Reset zoom transformation to its initial state
    scatterSvg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
}

// Add event listener to the button
document.getElementById("zoomOutButton").addEventListener("click", zoomOut);


});


