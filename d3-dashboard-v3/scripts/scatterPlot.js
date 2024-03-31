// Set the dimensions and margins of the graph
const margins = { top: 40, right: 20, bottom: 60, left: 80 },
    widths = 960 - margin.left - margin.right,
    heights = 500 - margin.top - margin.bottom;

// Append the scattersvg object to the body of the page
const scattersvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define the div for the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Read the data
d3.csv("./data/world-data-2023-merged.csv").then(function (data) {
    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 50])
        .range([0, width]);
    scattersvg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("class", "axis-label")
        .attr("y", 50)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .text("Birth Rate");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 90])
        .range([height, 0]);
    scattersvg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Life Expectancy");

    // Add dots
    scattersvg.append('g')
        .selectAll("dot")
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