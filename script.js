console.log("Scatter loaded");

// Set the dimensions and margins of the graph
const margins = { top: 40, right: 20, bottom: 60, left: 80 },
    widths = 960 - margins.left - margins.right,
    heights = 500 - margins.top - margins.bottom;

// Define scales outside of the CSV callback
const xs = d3.scaleLinear()
    .domain([0, 50])
    .range([0, widths]);
const ys = d3.scaleLinear()
    .domain([0, 90])
    .range([heights, 0]);

// Append the scattersvg object to the body of the page
const scattersvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", widths + margins.left + margins.right)
    .attr("height", heights + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

// Define a clipping path with the same dimensions as the graph area
scattersvg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", widths)
    .attr("height", heights);

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

// Add X axis and assign class for later selection
scattersvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${heights})`)
    .call(d3.axisBottom(xs));
scattersvg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", widths / 2)
    .attr("y", heights + margins.bottom - 10) // Adjust position as needed
    .text("Birth Rate");

// Add Y axis and assign class for later selection
scattersvg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(ys));
scattersvg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -heights / 2)
    .attr("y", -margins.left + 20) // Adjust position as needed
    .text("Life Expectancy");

// Define the zoomed function
function zoomed(event) {
    // Create new scale objects based on event
    const new_xScale = event.transform.rescaleX(x);
    const new_yScale = event.transform.rescaleY(y);

    // Update axes with these new scales
    scattersvg.select(".x-axis").call(d3.axisBottom(new_xScale));
    scattersvg.select(".y-axis").call(d3.axisLeft(new_yScale));

    // Update circle positions based on new scales
    scattersvg.selectAll("circle")
        .attr('cx', d => new_xScale(d['Birth Rate']))
        .attr('cy', d => new_yScale(d['Life expectancy']));
}

// Define the div for the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Attach zoom behavior to the scattersvg
scattersvg.call(zoom);

// Read the data
d3.csv("./data/world-data-2023.csv").then(function (data) {
    // Apply the clipping path to the group where the dots will be added
    const dotsGroup = scattersvg.append('g')
        .attr("clip-path", "url(#clip)") // Apply the clip path here
        .attr("class", "dots");

    // Add dots
    dotsGroup.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d['Birth Rate']))
        .attr("cy", d => y(d['Life expectancy']))
        .attr("r", 5)
        .style("fill", "#69b3a2")
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
});