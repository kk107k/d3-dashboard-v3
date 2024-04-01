// Set the dimensions and margins of the graph
const margins = { top: 40, right: 20, bottom: 60, left: 80 },
    widths = 500 - margins.left - margins.right,
    heights = 350 - margins.top - margins.bottom;

// Append the scattersvg object to the body of the page
const scattersvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", widths + margins.left + margins.right)
    .attr("height", heights + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

// Define the div for the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Read the data
d3.csv("./data/world-data-2023-merged.csv").then(function (data) {
    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 50])
        .range([0, widths])
    scattersvg.append("g")
        .attr("color","white")
        .attr("transform", `translate(0, ${heights})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("class", "axis-label")
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size","15px")
        .style("font-weight","100")
        .style("fill","white")
        .text("Birth Rate");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 90])
        .range([heights, 0]);
    scattersvg.append("g")
        .call(d3.axisLeft(y))
        .attr("color","white")
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -heights / 2)
        .attr("text-anchor", "middle")
        .style("font-size","15px")
        .style("font-weight","100")
        .style("fill","white")
        .text("Life Expectancy");

    // Add dots
    scattersvg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d['Birth Rate']))
        .attr("cy", d => y(d['Life expectancy']))
        .attr("font-size", "30px")
        .style("color","white")
        .attr("r", 5)
        .style("fill", "#BFF5FF")
        .style("opacity", .4)
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
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