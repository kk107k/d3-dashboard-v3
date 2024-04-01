function renderBarChart(countryData) {
    const width = 400;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };

    // Remove the fixed positioning and dimensions
    const barChartContainer = d3.select("#bar-chart");

    const svg = barChartContainer
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
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

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Value");

        svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-40)");

    svg.selectAll(".bar")
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

    svg.selectAll(".bar-label")
        .data(data)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.label) + y.bandwidth() / 2)
        .attr("dy", "0.35em")

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`${countryData.name} Statistics`);

    const tooltip = barChartContainer.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px");
}