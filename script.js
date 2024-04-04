// Script to create a World Choropleth Map displaying population data with interactions and a legend
// Load the GeoJSON data for country boundaries
d3.json('world-countries.geo.json').then(function (geojsonData) {
    // Load your population data
    d3.csv('world-data-2023.csv').then(function (populationData) {
        // Create a map of country names to population for easier lookup
        let populationLookup = {};
        populationData.forEach(function (row) {
            populationLookup[row.Country] = +row.Population.replace(/,/g, ''); // Convert to number
        });

        // After processing the CSV:
        geojsonData.features.forEach(function (feature) {
            const populationValue = populationLookup[feature.properties.name];
            // Assign the population value only if it's a number; otherwise, leave it as undefined
            feature.properties.population = isNaN(populationValue) ? undefined : populationValue;
        });

        // Now that we have the merged data, create the map
        createMap(geojsonData);
    });
});

function createMap(geojsonData) {
    const width = 960;
    const height = 600;
    const padding = 20; 

    const svg = d3.select("#choropleth-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .scale(width / (2 * Math.PI))
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Define the zoom behavior
    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            svg.selectAll('path').attr('transform', event.transform);
        });

    svg.call(zoom);

    const populationScale = d3.scaleThreshold()
        .domain([1, 100000, 1000000, 10000000, 50000000, 250000000, 500000000])
        .range([
            "#deebf7",
            "#c6dbef",
            "#9ecae1",
            "#6baed6",
            "#4292c6",
            "#2171b5",
            "#08519c",
            "#08306b"  
        ]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(geojsonData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            if (d.properties.population === undefined) {
                return "#000000"; 
            } else if (d.properties.population < 100000) {
                return "#deebf7";
            } else {
                return populationScale(d.properties.population);
            }
        })
        .attr("stroke", "#fff")
        .on("mouseover", function (event, d) {
            const populationText = d.properties.population !== undefined
                ? `Population: ${d3.format(",")(d.properties.population)}`
                : "Population: undefined";
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.properties.name}<br>${populationText}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    const legendDiv = d3.select("#map-legend");

    const legendRanges = [0, 100000, 1000000, 10000000, 50000000, 250000000, 500000000];
    const legendTexts = [
        "0 – 100k",
        "100k - 1M",
        "1M – 10M",
        "10M – 50M",
        "50M – 250M",
        "250M - 500M",
        "500M+"
    ];

    legendDiv.selectAll("div")
        .data(legendRanges)
        .enter().append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .html(function (d, i) {
            var color = populationScale(d);
            var nextDomain = (i < legendRanges.length - 1) ? populationScale.domain()[i + 1] : null;
            var text = nextDomain ? `${d3.format(".1s")(d)} - ${d3.format(".1s")(nextDomain)}` : `${d3.format(".1s")(d)}+`;

            return `<div style="width: 20px; height: 20px; background-color: ${color};"></div>` +
                `<span style="margin-left: 5px;">${text}</span>`;
        });

    // Reset Zoom Functionality
    function resetZoom() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity); // Reset zoom
    }

    // Adding Reset Zoom Event Listener
    d3.select("#reset-zoom").on("click", resetZoom);
}
