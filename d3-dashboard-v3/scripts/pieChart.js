// Define your datasets
const pieDataset = [
  {'label': '$0-$6', 'count': 160, 'enabled': true},
  {'label': '$6-$12', 'count': 21, 'enabled': true},
  {'label': '$12-$18', 'count': 6, 'enabled': true},
  {'label': '$18-$23', 'count': 4, 'enabled': true},
  {'label': '$23-$29', 'count': 1, 'enabled': true}
];

const pieUnemploymentDataset = [
  {'label': '0%-6%', 'count': 20, 'enabled': true},
  {'label': '6%-12%', 'count': 30, 'enabled': true},
  {'label': '12%-18%', 'count': 70, 'enabled': true},
  {'label': '18%-23%', 'count': 23, 'enabled': true},
  {'label': '23%-29%', 'count': 80, 'enabled': true}
];

let currentDataset = pieDataset; // Set the initial dataset

// chart dimensions
const pieWidth = 800;
const pieHeight = 300;

// a circle chart needs a radius
const pieRadius = Math.min(pieWidth, pieHeight) / 2;

// legend dimensions
const pieLegendRectSize = 20;
const pieLegendSpacing = 10;

const customColors = ['#BFF5FF', '#ffffff', '#00a7e1', '#80EBFF', '#00859D'];

const pieColor = d3.scaleOrdinal()
    .domain(pieDataset.map(d => d.label))
    .range(customColors);

const pieSvg = d3.select('#piechart')
  .append('svg')
  .attr('width', pieWidth)
  .attr('height', pieHeight)
  .append('g')
  .attr('transform', `translate(${pieWidth / 2 - 220}, ${pieHeight / 2})`);

const pieArc = d3.arc()
  .innerRadius(0)
  .outerRadius(pieRadius);

const piePie = d3.pie()
  .value(d => d.count)
  .sort(null);




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
    pieTooltip.select('.label').text(d.data.label);
    pieTooltip.select('.count').text(d.data.count + " Countries");
    pieTooltip.select('.percent').text(percent + '%');
    pieTooltip.style('display', 'block');
  })
  .on('mouseout', function() {
    pieTooltip.style('display', 'none');
  })
  .on('mousemove', function(event) {
    pieTooltip.style('top', (event.layerY + 10) + 'px')
      .style('left', (event.layerX + 10) + 'px');
  });

  // Update the legend
  updateLegend(selectedDataset);
}

function updateLegend(currentDataset) {
  // Data join for legend groups
  const legendUpdate = pieSvg.selectAll('.legend')
    .data(currentDataset.map((d, i) => ({ label: d.label, index: i, enabled: d.enabled })), d => d.label);

  // Enter selection for new legend items
  const legendEnter = legendUpdate.enter().append('g')
    .attr('class', 'legend')
    .attr('cursor', 'pointer')
    .style('fill', 'white')
    .attr("font-size", "15px")
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
    .attr('x', pieLegendRectSize + pieLegendSpacing)
    .attr('y', pieLegendRectSize - pieLegendSpacing);

  // Merge enter and update selections and apply transitions
  // This ensures that both new and existing elements are transitioned
  legendUpdate.merge(legendEnter)
    .transition().duration(500)
    .attr('opacity', 1)
    .attr('transform', (d, i) => {
      const height = pieLegendRectSize + pieLegendSpacing;
      const offset = height * currentDataset.length / 2; // Adjust offset based on current dataset length
      const horz = 9 * pieLegendRectSize; // MARGIN BETWEEN THE PIE CHART AND LEGEND
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
    .style('fill', d => d.enabled ? pieColor(d.label) : 'white')
    .style('stroke', d => d.enabled ? pieColor(d.label) : '#aaa');

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
  .style("font-size", "20px")
  .style('margin', '20px 10px 0px 0px')
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