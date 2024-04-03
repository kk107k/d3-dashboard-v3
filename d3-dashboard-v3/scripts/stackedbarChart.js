// Function to display details in a separate panel or element
function displayDetails(data) {
    const detailsPanel = d3.select("#details-panel")
        .style("font-size", "12px") //font size for the information displayed on the box
    detailsPanel.html(
        "Country: " + data.data.Country + "<br>" +
        "GDP: " + data.data.originalGDP + "<br>" +
        "Total Tax Rate: " + data.data.Total_tax_rate + "<br>" +
        "Tax Revenue: " + data.data.Tax_revenue
    );
}

// Set the dimensions and margins of the graph
const Smargin = { top: 50, right: 20, bottom: 100, left: 40 },
    Swidth = 5000 - Smargin.left - Smargin.right,
    Sheight = 300 - Smargin.top - Smargin.bottom;

// Set the ranges
const x = d3.scaleBand().rangeRound([0, 6000]),
    y = d3.scaleLinear().rangeRound([Sheight, 0]);

// Define the Scolors for the stacked bars
const Scolor = d3.scaleOrdinal()
    .domain(["GDP", "Total_tax_rate", "Tax_revenue"])
    .range([ "#BFF5FF" ,"#00a7e1", "#80EBFF" ]);

// Append the SVG object to the div
const stackedsvg = d3.select("#stackedchart").append("svg")
    .attr("width", Swidth + Smargin.left + Smargin.right)
    .attr("height", Sheight + Smargin.top + Smargin.bottom)
    .append("g")
    .attr("transform", "translate(" + Smargin.left + "," + Smargin.top + ")");

// Load the data
d3.csv("data/world-data-2023.csv").then(data => {
    data.forEach(d => {

        d.originalGDP = d.GDP;

        if (d.GDP) {
            d.GDP = d.GDP.replace(/\$|,/g, '');
            
        }
        // Scale the GDP data to be between 100 and 1000
        if (d.GDP && d.GDP.trim() !== '') {
            // Convert GDP to number
            d.GDP = +d.GDP /100000000;
            // Scale the GDP data to be between 1 and 50
            d.GDP = d3.scaleLinear()
                .domain([d3.min(data, d => d.GDP), d3.max(data, d => d.GDP)])
                .range([1, 50])(d.GDP);
        }  else {
            d.GDP = "Not Available"; // Assign "Not Available" if empty
        }

        // Check if Total tax rate value is present and not empty
        if (d['Total tax rate'] && d['Total tax rate'].trim() !== '') {
            d.Total_tax_rate = +d['Total tax rate'].replace('%', '');
        } else {
            d.Total_tax_rate = "Not Available"; // Assign "Not Available" if empty
        }

        if (d['Tax revenue (%)'] && d['Tax revenue (%)'].trim() !== '') {
            d.Tax_revenue = parseFloat(d['Tax revenue (%)'].replace('%', ''));
            if (isNaN(d.Tax_revenue)) { // Check if the parsing resulted in NaN
                d.Tax_revenue = "Not Available";
            }
        } else {
            d.Tax_revenue = "Not Available";
        }
    });



    // Stack the data
    const keys = ["Total_tax_rate", "Tax_revenue", "GDP"];
    const stack = d3.stack().keys(keys)(data);

    // Scale the range of the data
    x.domain(data.map(d => d.Country));
    y.domain([0, d3.max(stack[stack.length - 2], d => d[1])]).nice();

    // Add the x-axis
    stackedsvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (Sheight + 2 ) + ")")
        .call(d3.axisBottom(x))
        .attr("color","white")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-35)")
        .attr("color","white")
        .attr("font-size", "12px");

    // Add the y-axis
    stackedsvg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
        .attr("color","white");

    // Add the bars
    const layer = stackedsvg.selectAll(".layer")
        .data(stack)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", d => Scolor(d.key))



    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
        layer.selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.data.Country))
        .attr("y", d => y(d[1]))
        .attr("height", d => {return y(d[0]) - y(d[1]);})
        .attr("width", x.bandwidth())
        .attr("stroke", "black")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
                tooltip.html("Country: " + d.data.Country + "<br/> "+ getValueLabel(d)) // Use actual data attributes
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (event, d) {
            displayDetails(d);
        });
        function getValueLabel(d) {
            console.log("Current Data (d):", d);
  
            // Round the difference between upper and lower bounds of the bar
            const barValue = Math.round(d[1] - d[0]);
        
            // Mapping object for displaying user-friendly labels
            const fieldLabels = {
                "Total_tax_rate": "Total Tax Rate",
                "Tax_revenue": "Tax Revenue",
                "GDP": "GDP"
            };
        
            const dataFields = ["Total_tax_rate", "Tax_revenue", "GDP"];
            for (const field of dataFields) {
                // Check if the difference between barValue and data field value is within ±1
                if (Math.abs(barValue - d.data[field]) <= 1) {
                    // Use the display name from fieldLabels if available
                    const displayName = fieldLabels[field] || field;
                    // Return the label with the user-friendly display name
                    return `${displayName}: ${field === "GDP" ? d.data.originalGDP : d.data[field]}`;
                }
            }
        
            // If no match is found within the tolerance range, return "Not Available"
            return "Not Available";
        }
        
});

// Append a group for the legend
const legend = stackedsvg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 7)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(Scolor.domain().slice().reverse())
    .enter().append("g")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

legend.append("rect")
    .attr("x", Swidth - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", Scolor);

legend.append("text")
    .attr("x", Swidth - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(d => d);
