// Set the dimensions and margins of the graph
const bubbleWidth = 370;
const bubbleHeight = 100;

// Store data globally to be used by other graphs
let mainData;
let bubbleData;

// Append the svg object to the bubble-viz id of the page
const svg = d3.select("#bubble-viz")
    .append("svg")
    .attr("class", "bubble-svg")
    .attr("width", bubbleWidth)
    .attr("height", bubbleHeight + 200)
    .append("g")
    .attr("transform", "translate(-35, 70)"); // Move everything down by 100 pixels



// Read data from the provided CSV file
d3.csv('data/world-data-2023-merged.csv').then(data => {
    console.log('Data loaded:', data);
    // Convert numeric fields from string to number and remove commas
    data.forEach(d => {
        d['Density'] = +d['Density\n(P/Km2)'];//.replace(',', '').replace('.00', '');
        // d['CO2 Emissions'] = +d['Co2-Emissions'].replace(/,/g, '');
        // d['Gasoline Price'] = +d['Gasoline Price'].replace(/[$,]/g, '');
        d['Land Area'] = +d['Land Area(Km2)'].replace(/,/g, '');
        d['Urban Population'] = +d['Urban_population'].replace(/,/g, '');
    });

    // Store the filtered data globally
    bubbleData = data.filter(d => d.Country !== '');
    mainData = data;

    // Color palette for land area
    const color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(bubbleData, d => d['Land Area'])]);

    // Size scale for bubbles (using urban population)
    const size = d3.scaleSqrt()
        .domain([0, d3.max(bubbleData, d => d['Urban Population'])])
        .range([3, 25]); // Circle size range

    // Create a tooltip
    const bubbleTooltip = d3.select("#bubble-viz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("padding", "0.3em");

    const mouseOver = (event, d) => {
        bubbleTooltip.style("opacity", 1);
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .3);
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black"); //leaves a color on the bubbles that have been hovered over


    };

    const mouseMove = (event, d) => {
        bubbleTooltip
            .html('<u>' + d.Country + '</u>' + "<br>"
                // + "Gasoline Price: $" + d['Gasoline Price'] + "/L<br>"
                // + "CO2 Emissions: " + d['CO2 Emissions'] + "<br>"
                + "Population Density: " + d['Density'] + " P/Km2<br>"
                + "Urban Population: " + d['Urban Population'] + "<br>"
                + "Land Area: " + d['Land Area'] + " Km2")
            .style("position", "fixed")
            .style("left", (event.x + 15) + "px")
            .style("top", (event.y - (scrollY / 5)) + "px")
            
    };

    const mouseLeave = (event, d) => {
        bubbleTooltip.style("opacity", 0);
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 1);

        // Clear the histogram when mouse leaves the bubble
        histogramSvg.selectAll(".bar").remove();
    };

    // Initialize the circles: all located at the center of the svg area
    const node = svg.append("g")
        .selectAll("circle")
        .data(bubbleData)
        .join("circle")
        .attr("class", d => `node Country ${d.Country.replace(/\s/g, '')}`)
        .attr("r", d => size(d['Urban Population']))
        .style("fill", d => color(d['Land Area'])) // Color representing land area
        .style("fill-opacity", 1)
        .attr("stroke", "black")
        .style("stroke-width", 1) // the circles border width
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    // Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(bubbleWidth / 2).y(bubbleHeight / 2))
        .force("charge", d3.forceManyBody().strength(5))
        .force("collide", d3.forceCollide().strength(0.2).radius(d => size(d['Urban Population']) + 3).iterations(1)); //

    // Update the positions after each tick of the simulation
    simulation
        .nodes(bubbleData)
        .on("tick", function (d) {
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
    
// Define the gradient for the legend
const defs = svg.append("defs");
const linearGradient = defs.append("linearGradient")
    .attr("id", "landAreaGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%"); // Change the y2 value to 100%

// Define the color stops of the gradient
linearGradient.selectAll("stop")
    .data(color.range())
    .enter().append("stop")
    .attr("offset", (d, i) => `${(i / (color.range().length - 1)) * 100}%`)
    .attr("stop-color", d => d);

// Draw the rectangle for the legend
const legendWidth = 10; // Decrease the width
const legendHeight = 200; // Increase the height
const legendX = bubbleWidth - legendWidth + 1;
const legendY = bubbleHeight - 150; // Adjust the y-coordinate

svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#landAreaGradient)");

// Add legend text
svg.append("text")
    .attr("x", legendX + 170) // Adjust the x-coordinate
    .attr("y", legendY + legendHeight + 20)
    .attr("fill", "white")
    .text("Land Area (Km²)")
    .style("text-anchor", "end") // Align text to the right
    .attr("transform", "rotate(-90, " + (legendX - 10) + "," + (legendY + legendHeight + 20) + ")"); // Rotate the text by -90 degrees

// Add min and max values for the legend
const landAreaMin = d3.min(bubbleData, d => d['Land Area']);
const landAreaMax = d3.max(bubbleData, d => d['Land Area']);

svg.append("text")
    .attr("x", legendX - 10)
    .attr("y", legendY)
    .attr("fill", "white")
    .text(d3.format(".2s")(landAreaMin))
    .style("text-anchor", "end");

svg.append("text")
    .attr("x", legendX - 10)
    .attr("y", legendY + legendHeight)
    .attr("fill", "white")
    .text(d3.format(".2s")(landAreaMax))
    .style("text-anchor", "end");

});