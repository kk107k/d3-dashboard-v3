// Script to create a World Choropleth Map displaying population data with interactions and a legend
// Load the GeoJSON data for country boundaries

console.log("Hello World!");
d3.json('./data/world-countries.geo.json').then(function (geojsonData) {
    // Load your population data
    d3.csv('./data/world-data-2023.csv').then(function (populationData) {
        

        // Create a map of country names to population for easier lookup
        let populationLookup = {};
        let fertilityRateLookup = {};
        let birthRateLookup = {};
        let agriculturalLandLookup = {};
        let forestedLandLookup = {};
        populationData.forEach(function (row) {
            populationLookup[row.Country] = +row.Population.replace(/,/g, ''); // Convert to number
            fertilityRateLookup[row.Country] = +row['Fertility Rate']; // Convert to number
            birthRateLookup[row.Country] = +row['Birth Rate']; // Convert to number
            // Then you use this function to parse your values:
            agriculturalLandLookup[row.Country] = +row["Agricultural Land(%)"];
            forestedLandLookup[row.Country] = +row["Forested Area(%)"];
            
        });

        // After processing the CSV:
        geojsonData.features.forEach(function (feature) {
            const populationValue = populationLookup[feature.properties.name];
            const fertilityRateValue = fertilityRateLookup[feature.properties.name];
            const birthRateValue = birthRateLookup[feature.properties.name];
            const agriculturalLandValue = agriculturalLandLookup[feature.properties.name];
            const forestedLandValue = forestedLandLookup[feature.properties.name];
            // Assign the population value only if it's a number; otherwise, leave it as undefined
            feature.properties.population = isNaN(populationValue) ? undefined : populationValue;
            feature.properties.fertilityRate = isNaN(fertilityRateValue) ? undefined : fertilityRateValue;
            feature.properties.birthRate = isNaN(birthRateValue) ? undefined : birthRateValue;
            feature.properties.agriculturalLand = isNaN(agriculturalLandValue) ? undefined : agriculturalLandValue;
            feature.properties.forestedLand = isNaN(forestedLandValue) ? undefined : forestedLandValue;

            
            

        });

        // Now that we have the merged data, create the map and bar chart
        createVisualization(geojsonData);

        const defaultCountry = geojsonData.features.find(feature => feature.properties.population === 144373535); //
        
        if (defaultCountry) {
            renderBarChart(defaultCountry.properties);
            renderDonutChart(defaultCountry.properties);
        }


    });
});



const legendDiv = d3.select("#map-legend");
let lastHoveredCountry = null;

// A function to clear charts
function clearCharts() {
    d3.select("#bar-chart").selectAll("*").remove();
    d3.select("#donut-chart").selectAll("*").remove();
}



function createVisualization(geojsonData) {
    const width = 800;
    const height = 380;
    const padding = 20;     

    const mapContainer = d3.select("#visualization")
        .append("svg")
        .attr("width", width + padding)
        .attr("height", height + padding * 2)
        .append("g")
        .attr("transform", `translate(${padding}, ${padding})`);

    const projection = d3.geoMercator()
        .scale(width / (2 * Math.PI))
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Define the zoom behavior
    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            mapContainer.selectAll('path').attr('transform', event.transform);
        });

    mapContainer.call(zoom);

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

    mapContainer.selectAll("path")
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
            clearCharts();
            const populationText = d.properties.population !== undefined
                ? `Population: ${d3.format(",")(d.properties.population)}`
                : "Population: undefined";
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.properties.name}<br>${populationText}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

            // Render the bar chart
            renderBarChart(d.properties);
            // Render the donut chart
            renderDonutChart(d.properties);
        })
        .on("mouseout", function (d) {
            lastHoveredCountry = d.properties;
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            if (lastHoveredCountry) {
                renderBarChart(lastHoveredCountry);
                renderDonutChart(lastHoveredCountry);
            }
        });


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
        mapContainer.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity); // Reset zoom
    }

    // Adding Reset Zoom Event Listener
    d3.select("#reset-zoom").on("click", resetZoom);
}