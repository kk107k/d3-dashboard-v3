
console.log("hello");

function RadarChart(id, data, options) {
  var cfg = {
      w: 100,                // Width of the circle
      h: 100,                // Height of the circle
      margin: {top: 20, right: 20, bottom: 20, left: 20}, // The margins of the SVG
      levels: 3,             // How many levels or inner circles should there be drawn
      maxValue: 1,           // What is the value that the biggest circle will represent
      labelFactor: 1.25,     // How much farther than the radius of the outer circle should the labels be placed
      wrapWidth: 60,         // The number of pixels after which a label needs to be given a new line
      opacityArea: 0.35,     // The opacity of the area of the blob
      dotRadius: 4,          // The size of the colored circles of each blog
      opacityCircles: 0.1,   // The opacity of the circles of each blob
      strokeWidth: 2,        // The width of the stroke around each blob
      roundStrokes: false,   // If true the area and stroke will follow a round path (cardinal-closed)
      color: d3.scaleOrdinal(d3.schemeCategory10) // Color function
  };

  // Put all of the options into a variable called cfg
  if ('undefined' !== typeof options) {
      for (var i in options) {
          if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
      } // for i
  } // if

  // Calculate the maximum value among the data points across all axes in the dataset
  var maxValue = Math.max(cfg.maxValue, d3.max(data, i => d3.max(i.axes.map(o => o.value))));


  var allAxis = data[0].axes.map(i => i.axis), // Names of each axis
      total = allAxis.length,             // The number of different axes
      radius = Math.min(cfg.w / 2, cfg.h / 2), // Radius of the outermost circle
      Format = d3.format('.0%'),          // Percentage formatting
      angleSlice = Math.PI * 2 / total;   // The width in radians of each "slice"

  // Scale for the radius
  var rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, maxValue]);

  // Remove whatever chart with the same id/class was present before
  d3.select(id).select("svg").remove();

  // Initiate the radar chart SVG
  var svg = d3.select(id).append("svg")
          .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
          .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
          .attr("class", "radar" + id);

  // Append a g element
  var g = svg.append("g")
          .attr("transform", `translate(${cfg.w / 2 + cfg.margin.left}, ${cfg.h / 2 + cfg.margin.top})`);

  // Create the radial line generator
  var radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

  if (cfg.roundStrokes) {
      radarLine.curve(d3.curveCardinalClosed);
  }

  // Create a wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");

  // Draw the background circles
  axisGrid.selectAll(".levels")
      .data(d3.range(1, (cfg.levels + 1)).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", d => radius / cfg.levels * d)
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", cfg.opacityCircles);

  // Text indicating at what % each level is
  axisGrid.selectAll(".axisLabel")
      .data(d3.range(1, (cfg.levels + 1)).reverse())
      .enter().append("text")
      .attr("class", "axisLabel")
      .attr("x", 4)
      .attr("y", d => -d * radius / cfg.levels)
      .attr("dy", "0.4em")
      .style("font-size", "10px")
      .attr("fill", "#737373")
      .text(d => Format(maxValue * d / cfg.levels));
  // Draw the axes
  var axes = axisGrid.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");
  
  // Append the lines for each axis
  axes.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("class", "line")
      .style("stroke", "white")
      .style("stroke-width", "2px");

  // Append the labels at each axis
  axes.append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d)
      .call(wrap, cfg.wrapWidth);

  // Create the blobs
  var blobs = g.selectAll(".radarWrapper")
      .data(data)
      .enter().append("g")
      .attr("class", "radarWrapper");

  // Append the radar areas
  blobs.append("path")
      .attr("class", "radarArea")
      .attr("d", d => radarLine(d.axes))
      .style("fill", d => d.color)
      .style("fill-opacity", cfg.opacityArea)
      .on('mouseover', function(event, d) {
          d3.selectAll(".radarArea")
              .transition().duration(200)
              .style("fill-opacity", 0.1);
          d3.select(this)
              .transition().duration(200)
              .style("fill-opacity", 0.7);
      })
      .on('mouseout', function() {
          d3.selectAll(".radarArea")
              .transition().duration(200)
              .style("fill-opacity", cfg.opacityArea);
      });

  // Append the radar strokes
  blobs.append("path")
      .attr("class", "radarStroke")
      .attr("d", d => radarLine(d.axes))
      .style("stroke-width", cfg.strokeWidth + "px")
      .style("fill", d => d.color)
      .style("fill", "none");

  // Append the circles
  blobs.selectAll(".radarCircle")
      .data(d => d.axes)
      .enter().append("circle")
      .attr("class", "radarCircle")
      .attr("r", cfg.dotRadius)
      .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().color) 
      .style("fill-opacity", 0.8);

  // Tooltip
  var tooltip = g.append("text")
      .attr("class", "tooltip")
      .style("opacity", 0);

  function wrap(text, width) {
      text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.4, // ems
              y = text.attr("y"),
              x = text.attr("x"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
          
          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
          }
      });
  }
  // Optional: Implement the tooltip's visibility on circle hover
  // This assumes your data includes meaningful 'value' fields for tooltips.
  blobs.selectAll(".radarCircle")
      .on('mouseover', function(event, d) {
          tooltip
              .attr('x', this.cx.baseVal.value - 10)
              .attr('y', this.cy.baseVal.value - 10)
              .text(Format(d.value))
              .transition().duration(200)
              .style('opacity', 1)
              .text(d.displayValue);
      })
      .on('mouseout', function() {
          tooltip.transition().duration(200)
              .style('opacity', 0);
      });

  // Optional: Implement additional interactions or visual enhancements
  // This could include highlighting specific aspects of the data on hover,
  // or adding more detailed interactions specific to your application's needs.
}
var margin = {top: 20, right: 60, bottom: 100, left: 100},
        width = Math.min(400, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    // Placeholder for radar chart options
    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 1,
        levels: 5,
        roundStrokes: true,
        color: color
    };

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Assuming radarChart.js defines a RadarChart function correctly
    d3.csv("./data/world-data-2023-merged.csv").then(function(data) {
        

        let processedData = data.map(d => ({
            name: d.Country,
            axes: [
                {axis: "GDP", value: +d.GDP_formatted, displayValue: "GDP: " + d.GDP},
                {axis: "Life Expectancy", value: +d.Life_expectancy_formatted, displayValue: "Life: " + d['Life expectancy']+ " Years Old"},
                {axis: "Tax Revenue", value: +d.Tax_revenue_formatted, displayValue: "Tax: " + d['Tax revenue (%)']},
                {axis: "Unemployment Rate", value: +d.Unemployment_rate_formatted, displayValue: "Unemployment: " + d['Unemployment rate']}
            ],
            color: color(d.Country)
        }));

        console.log(processedData);
        // Initialize the radar chart with processed data
        RadarChart(".radarChart", processedData, radarChartOptions);

        // Initialize Select2 for country selection
        var select = $('<select multiple="multiple"></select>').appendTo('#countrySelector');
        data.forEach(function(d) {
            select.append($('<option></option>').attr("value", d.Country).text(d.Country));
        });
        $(select).select2({width: 'resolve'});

        // Update radar chart based on selection
        $(select).on('change', function() {
            var selectedCountries = $(this).val();
            var selectedData = processedData.filter(d => selectedCountries.includes(d.name));
            RadarChart(".radarChart", selectedData, radarChartOptions);
        });
    });