function radarDraw(scope, element) {
  
  // Watch for changes on scope.csv and scope.config
  scope.$watch("[csv, config]", function() {
    var csv = scope.csv; // Get the CSV data from the scope
    var config = scope.config; // Get the configuration from the scope
    var data = csv2json(csv); // Convert the CSV data to JSON format
    RadarChart.draw(element[0], data, config); // Call the RadarChart.draw function to draw the visualization
  });

  // Helper function to convert CSV data to JSON format
  function csv2json(csv) {
    csv = csv.replace(/, /g, ","); // Remove leading whitespace in the CSV file

    var json = d3.csv.parse(csv); // Parse the CSV string into a JSON object

    // Reshape the JSON data
    var data = [];
    var groups = []; // Track unique groups

    json.forEach(function(record) {
      var group = record.group;
      if (groups.indexOf(group) < 0) {
        groups.push(group); // Add the group to the unique groups tracking
        data.push({ // Push a new group node to the data array
          group: group,
          axes: []
        });
      };
      data.forEach(function(d) {
        if (d.group === record.group) { // Check if the record belongs to the current group
          d.axes.push({ // Push the record data into the corresponding group
            axis: record.axis,
            value: parseInt(record.value),
            description: record.description
          });
        }
      });
    });
    return data;
  }
}