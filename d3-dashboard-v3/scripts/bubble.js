// Set the dimensions and margins of the graph
const bubbleWidth = 370;
const bubbleHeight = 205;

// Store data globally to be used by other graphs
let mainData;
let bubbleData;

// Append the svg object to the bubble-viz id of the page
const svg = d3.select("#bubble-viz")
    .append("svg")
    .attr("class", "bubble-svg")
    .attr("width", bubbleWidth)
    .attr("height", bubbleHeight + 100);



// Read data from the provided CSV file
d3.csv('data/world-data-2023-merged.csv').then(data => {
    console.log('Data loaded:', data);
    // Convert numeric fields from string to number and remove commas
    data.forEach(d => {
        d['Density'] = +d['Density\n(P/Km2)'];//.replace(',', '').replace('.00', '');
        d['CO2 Emissions'] = +d['Co2-Emissions'].replace(/,/g, '');
        d['Gasoline Price'] = +d['Gasoline Price'].replace(/[$,]/g, '');
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
        .range([3, 30]); // Circle size range

    // Create a tooltip
    const bubbleTooltip = d3.select("#bubble-viz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
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
            .style("stroke", "black");

  
    };



    const mouseMove = (event, d) => {
        bubbleTooltip
            .html('<u>' + d.Country + '</u>' + "<br>"
                + "Gasoline Price: $" + d['Gasoline Price'] + "/L<br>"
                + "CO2 Emissions: " + d['CO2 Emissions'] + "<br>"
                + "Population Density: " + d['Density'] + " P/Km2<br>"
                + "Urban Population: " + d['Urban Population'] + "<br>"
                + "Land Area: " + d['Land Area'] + " Km2")
            .style("position", "fixed")
            .style("left", (event.x + 15) + "px")
            .style("top", (event.y - (scrollY / 5)) + "px");
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
        .style("stroke-width", 2) // the circles border width
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

});