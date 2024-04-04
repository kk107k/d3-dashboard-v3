// Load the world CSV data
const parsedData = [];
d3.text('./data/world-data-2023.csv').then(function(csvData) {
  const parsedData = d3.csvParse(csvData, d => {
    // Remove currency symbols and percentage signs, then parse as float
    const minWage = parseFloat(d['Minimum wage'].replace(/[^0-9.]/g, ''));
    const unemployment = parseFloat(d['Unemployment rate'].replace(/[^0-9.]/g, ''));
    
    // Return an object with the min wage and unemployment rate
    return {
      country: d['Country'],
      minWage: minWage,
      unemployment: unemployment
    };
  });

  // Call datasets generation functions after parsedData is ready
  const pieDataset = generateMinWageDataset(parsedData);
  console.log(pieDataset);
  
  const pieUnemploymentDataset = generateUnemploymentDataset(parsedData);
  console.log(pieUnemploymentDataset);

  let currentDataset = pieDataset; // Set the initial dataset

  // Function to generate the minimum wage dataset
  function generateMinWageDataset(data) {
    const minWages = d3.rollup(
      data,
      (v) => v.length, // Count the number of elements
      (d) => getMinWageRange(d.minWage) // Group by minimum wage range
    );

    // Convert the rollup result to an array of objects with label, count, and enabled properties
    return Array.from(minWages, ([label, count]) => ({ label, count, enabled: true }));
  }

  // Function to generate the unemployment dataset
  function generateUnemploymentDataset(data) {
    const unemployment = d3.rollup(
      data,
      (v) => v.length, // Count the number of elements
      (d) => getUnemploymentRange(d.unemployment) // Group by unemployment range
    );

    // Convert the rollup result to an array of objects with label, count, and enabled properties
    return Array.from(unemployment, ([label, count]) => ({ label, count, enabled: true }));
  }

  // Helper function to get the minimum wage range
  function getMinWageRange(minWage) {
    if (minWage <= 1) {
      return "≤ $1";
    } else if (minWage <= 5) {
      return "$1 - $5";
    } else if (minWage <= 10) {
      return "$5 - $10";
    } else {
      return "> $10";
    }
  }

  // Helper function to get the unemployment range
  function getUnemploymentRange(unemployment) {
    if (unemployment <= 5) {
      return "≤ 5%";
    } else if (unemployment <= 10) {
      return "5% - 10%";
    } else if (unemployment <= 15) {
      return "10% - 15%";
    } else {
      return "> 15%";
    }
  }

  // Set chart dimensions
  const pieWidth = 720; //increase to make chart go right
  const pieHeight = 170; //increase to make chart bigger

  // Calculate the radius of the pie chart based on the dimensions
  const pieRadius = Math.min(pieWidth, pieHeight) / 2;

  // Set legend dimensions
  const pieLegendRectSize = 20;
  const pieLegendSpacing = 10;

  // Define custom colors for the pie chart segments
  const customColors = ['#BFF5FF', '#ffffff', '#00a7e1', '#80EBFF', '#00859D'];

  // Create a color scale for the pie chart segments
  const pieColor = d3.scaleOrdinal()
      .domain(pieDataset.map(d => d.label))
      .range(customColors);

  // Create an SVG container for the pie chart
  const pieSvg = d3.select('#piechart')
    .append('svg')
    .attr('width', pieWidth)
    .attr('height', pieHeight + 20)
    .append('g')
    .attr('transform', `translate(${pieWidth / 2 - 230}, ${pieHeight / 2 + 10 })`); //moving the chart

  // Define the arc generator for the pie chart segments
  const pieArc = d3.arc()
    .innerRadius(0)
    .outerRadius(pieRadius);

  // Define the pie layout for the pie chart segments
  const piePie = d3.pie()
    .value(d => d.count)
    .sort(null);
  
  // Create the tooltip element with required HTML structure
  const pieTooltip = d3.select("body").append("div")
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Append elements with appropriate classes for label, count, and percent
  pieTooltip.append('div').attr('class', 'label');
  pieTooltip.append('div').attr('class', 'count');
  pieTooltip.append('div').attr('class', 'percent');


  // Function to update the pie chart with the selected dataset
  function updatePie(selectedDataset) {
    // Transition out old arcs by shrinking them to the core
    pieSvg.selectAll('path')
      .data(piePie(selectedDataset.filter(d => d.enabled)), d => d.data.label) // Bind filtered dataset for exit selection
      .exit()
      .transition().duration(500)
      .attrTween('d', function(d) {
        const end = {startAngle: 0, endAngle: 0}; // Target state: shrunk to the center
        const interpolate = d3.interpolate(this._current, end);
        return function(t) {
          return pieArc(interpolate(t));
        };
      })
      .remove();

    // Immediately start the enter/update transition for new arcs
    const paths = pieSvg.selectAll('path')
      .data(piePie(selectedDataset.filter(d => d.enabled)), d => d.data.label) // Key function for object constancy
      .join(
        enter => enter.append('path')
          .attr('fill', d => pieColor(d.data.label))
          .each(function(d) { this._current = {startAngle: 0, endAngle: 0}; }) // Initialize new arcs at the center
          .attr('d', pieArc)
          .transition().duration(500)
          .attrTween('d', function(d) {
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return pieArc(interpolate(t));
            };
          }),
        update => update
          .transition().duration(500)
          .attrTween('d', function(d) {
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return pieArc(interpolate(t));
            };
          }),
        exit => exit.remove() // Handled above, but included for clarity
      );

    // Update the tooltip event listeners
    paths.on('mouseover', function(event, d) {
      const total = d3.sum(selectedDataset.filter(d => d.enabled).map(d => d.count));
      const percent = Math.round(1000 * d.data.count / total) / 10;
      console.log(d);
      pieTooltip.select('.label').text(d.data.label);
      pieTooltip.select('.count').text(d.data.count + " Countries");
      pieTooltip.select('.percent').text(percent + '%');
      pieTooltip.style('display', 'block')
        .style('opacity', 1);
    })
    .on('mouseout', function() {
      pieTooltip.style('display', 'none')
        .style('opacity', 0);
    })
    .on('mousemove', function(event) {
      pieTooltip.style('top', (event.layerY + 10) + 'px')
        .style('left', (event.layerX + 10) + 'px');
    });

    // Update the legend
    updateLegend(selectedDataset);
  }

  // Function to update the legend based on the current dataset
  function updateLegend(currentDataset) {
    // Data join for legend groups
    const legendUpdate = pieSvg.selectAll('.legend')
      .data(currentDataset.map((d, i) => ({ label: d.label, index: i, enabled: d.enabled })), d => d.label);

    // Enter selection for new legend items
    const legendEnter = legendUpdate.enter().append('g')
      .attr('class', 'legend')
      .attr('cursor', 'pointer')
      .style('fill', 'white')
      .attr("font-size", "12px")
      .attr('opacity', 0) // Start them as invisible
      .on('click', function(event, d) {
        currentDataset[d.index].enabled = !currentDataset[d.index].enabled;
        updatePie(currentDataset);
      });

    // Append rectangles for color indicators
    legendEnter.append('rect')
      .attr('width', pieLegendRectSize)
      .attr('height', pieLegendRectSize)
      .attr('rx', 2)
      .attr('ry', 2)

    // Append text for the legend
    legendEnter.append('text')
      .attr('x', pieLegendRectSize + pieLegendSpacing) //move the text of the legend
      .attr('y', pieLegendRectSize - pieLegendSpacing + 3.5); //move the text of the legend

    // Merge enter and update selections and apply transitions
    // This ensures that both new and existing elements are transitioned
    legendUpdate.merge(legendEnter)
      .transition().duration(500)
      .attr('opacity', 1)
      .attr('transform', (d, i) => {
        const height = pieLegendRectSize + pieLegendSpacing;
        const offset = height * currentDataset.length / 2; // Adjust offset based on current dataset length
        const horz = 5 * pieLegendRectSize; // MARGIN BETWEEN THE PIE CHART AND LEGEND
        const vert = i * height - offset;
        return `translate(${horz}, ${vert})`;
      });

    // Update text for both new and existing items
    // This is done separately to ensure text content is updated correctly
    pieSvg.selectAll('.legend text')
      .data(currentDataset.map((d, i) => ({ label: d.label, index: i, enabled: d.enabled })), d => d.label)
      .text(d => d.label);

    // Update rectangles for both new and existing items
    pieSvg.selectAll('.legend rect')
      .data(currentDataset.map((d, i) => ({ label: d.label, index: i, enabled: d.enabled })), d => d.label)
      .style('fill', d => d.enabled ? pieColor(d.label) : 'red')

    // Exit selection
    legendUpdate.exit()
      .transition().duration(500)
      .attr('opacity', 0)
      .remove();
  }

  // Initial render
  updatePie(currentDataset);

  // Add radio buttons to switch between datasets
  const radioContainer = d3.select('#piechart')
    .append('div')
    .style('text-align', 'center');

  const radioGroup = radioContainer.append('div')
    .style('color', 'white')
    .style("font-size", "15px")
    .style('margin', '15px 10px 0px 0px')
    .attr('id', 'radio-group');

  const radioButton1 = radioGroup.append('input')
    .attr('type', 'radio')
    .attr('id', 'radio1')
    .attr('name', 'dataset')
    .attr('value', 'pieDataset')
    .attr('checked', true)
    .on('change', function() {
      currentDataset = pieDataset;
      updatePie(currentDataset);
    });

  radioGroup.append('label')
    .attr('for', 'radio1')
    .text('Minimum Wage');

  const radioButton2 = radioGroup.append('input')
    .attr('type', 'radio')
    .attr('id', 'radio2')
    .attr('name', 'dataset')
    .attr('value', 'pieUnemploymentDataset')
    .on('change', function() {
      currentDataset = pieUnemploymentDataset;
      updatePie(currentDataset);
    });

  radioGroup.append('label')
    .attr('for', 'radio2')
    .text('Unemployment');

  // Now, parsedData is ready to be used
  console.log(parsedData);
}).catch(function(error) {
  console.log('Error loading or parsing CSV');
});