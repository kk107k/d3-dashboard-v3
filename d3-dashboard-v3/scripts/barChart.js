function renderBarChart(countryData) {
    const width = 250;
    const height = 150;
    const margin = { top: 40, right: 20, bottom: 60, left: 150 }; // Increased left margin

    const barsvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
    const x = d3.scaleLinear()
        .range([0, width]);

    const y = d3.scaleBand()
        .range([height, 0])
        .padding(0.2);

    const data = [
        { label: "Fertility Rate", value: countryData.fertilityRate },
        { label: "Birth Rate", value: countryData.birthRate }
    ];

    x.domain([0, d3.max(data, d => d.value)]);
    y.domain(data.map(d => d.label));

    barsvg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5))
        .attr("color","white")
        .attr("opacity", 0.7)
        .style("font-size", "20px")
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Value");

        barsvg.append("g")
        .call(d3.axisLeft(y))
        .attr("color","white")
        .attr("opacity", 0.7)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("fill", "#ffffff")
        .attr("font-size", "20px");

    barsvg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.label))
        .attr("width", d => x(d.value))
        .attr("fill", "#4292c6")
        .on("mouseover", function (event, d) {
            const tooltip = d3.select(".tooltip");
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`${d.label}: ${d.value.toFixed(2)}`)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            d3.select(".tooltip")
                .transition()
                .duration(500)
                .style("opacity", 0);
        });

    barsvg.selectAll(".bar-label")
        .data(data)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.label) + y.bandwidth() / 2)
        .attr("dy", "0.35em")

    barsvg.append("text")
        .attr("x", width / 2.1)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .attr("fill", "#ffffff")
        .attr("opacity", 0.7)
        .text(`${countryData.name} Statistics`);

}