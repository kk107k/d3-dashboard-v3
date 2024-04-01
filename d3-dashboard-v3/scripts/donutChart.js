function renderDonutChart(countryData) {
    const width = 350;
    const height = 250;
    const radius = Math.min(width, height) / 2 - 20;
    const donutChartContainer = d3.select("#donut-chart")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("align-items", "center")

    // Clear previous chart and legend
    donutChartContainer.selectAll("*").remove();

    const donutsvg = donutChartContainer
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const data = [
        { label: "Agricultural Land", value: countryData.agriculturalLand * 100 },
        { label: "Forested Area", value: countryData.forestedLand * 100 },
        { label: "Urbanized Land", value: (100 - (countryData.forestedLand * 100) - (countryData.agriculturalLand* 100)) }
        
    ];
    console.log(data);

    const pie = d3.pie().value(d => d.value);
    const data_ready = pie(data);
    const arcGenerator = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);
    
    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const tooltip = donutChartContainer.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#4292c6", "#9ecae1", "#deebf7"]);

    const slices = donutsvg.selectAll(".slice")
        .data(data_ready)
        .enter().append("g")
        .attr("class", "slice");

    slices.append("path")
        .attr("d", arcGenerator)
        .attr("fill", d => color(d.data.label))
        .style("stroke", "#fff")
        .style("color", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function (event, d) {
            const percentage = Math.round(d.data.value * 100) / 100;
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`${d.data.label}: ${percentage}%`)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    slices.append("polyline")
        .attr("stroke", "red")
        .style("fill", "none")
        .attr("stroke-width", 3)
        .attr('points', function (d) {
            const posA = arcGenerator.centroid(d);
            const posB = outerArc.centroid(d);
            const posC = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC];
        });

    slices.append("text")
        .style("fill", "white")
        .style("font-size", "30px")
        .text(d => `${Math.round(d.data.value)}%`)
        .attr('transform', function (d) {
            const pos = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .style('text-anchor', function (d) {
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return (midangle < Math.PI ? 'start' : 'end');
        });

    // Add legend
    const legendContainer = donutChartContainer.append("div")
        .attr("class", "legend-container")

    const legend = legendContainer.selectAll(".legend")
        .data(data)
        .enter().append("div")
        .attr("class", "legend")
        .style("display", "flex")
        .style("color", "white")
        .style("align-items", "center")
        .style("margin-bottom", "5px")
        .style("margin-right", "30px")

    legend.append("div")
        .style("width", "18px")
        .style("color", "white")
        .style("height", "18px")
        .style("background-color", d => color(d.label));

    legend.append("span")
        .style("margin-left", "5px")
        .text(d => d.label);
}