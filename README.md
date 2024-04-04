# World Data Visualization Project

## Overview
This project harnesses the power of D3.js to create interactive, web-based data visualizations. It aims to present complex datasets in an accessible manner, enabling insights into global trends across various indicators such as population, employment rates, land use, and more. Through diverse chart types like bar, pie, donut, radar, scatter plots, and a world map choropleth, users can explore intricate relationships and patterns within the data.

## Technologies Used
- **D3.js v7**: For crafting interactive visualizations.
- **HTML5 & CSS3**: For structuring and styling the web interface.
- **GeoJSON**: Utilized in rendering geographical features for the world map visualization.

## Getting Started
To run this project locally, follow these steps:
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to view the project. No additional setup or dependencies are required, as all visualizations run in-browser.

## File Structure
- `index.html`: Entry point showcasing the visualizations.
- `css/`: Contains CSS stylesheets for visual styling.
  - `main.css`: Main styling rules.
  - `style.css`: Additional visualization-specific styles.
  - `constants.css`: Defines CSS variables and constants.
- `js/`: JavaScript files for each D3 visualization.
  - `barChart.js`: Generates the bar chart.
  - `pieChart.js`: Manages pie chart creation.
  - `donutChart.js`, `scatterPlot.js`, `bubble.js`, etc.: Each file corresponds to a specific chart type included in the project.
- `data/`: Directory containing CSV and GeoJSON data files utilized across various visualizations.

## Features
This project offers a suite of interactive visualizations allowing users to:
- Zoom and pan on geographical maps.
- Hover over chart elements to display detailed data tooltips.
- Switch between datasets and visualization types for comprehensive analysis.
Each chart type provides a unique perspective on the dataset, from global demographic distributions on the world map to detailed statistical breakdowns in bar and pie charts.

## How to Use
Interact with the visualizations directly through the web interface:
- Use mouse actions to explore charts, such as hovering for details or clicking to filter.
- Navigate the world map to view country-specific data, with choropleth shading indicating variable magnitudes.
- Utilize the provided controls to switch between different datasets or visualization types.

## Acknowledgements
- **D3.js Documentation**: For detailed information on utilizing D3.js for data visualization.
- **GeoJSON Data**: For geographical features utilized in map visualizations.

This project is a demonstration of the capabilities of modern web technologies in making data visualization interactive and engaging. Through the exploration of various datasets, it provides valuable insights into world data trends.

## Gitlab Link

https://gitlab-student.macs.hw.ac.uk/ba2009/f20dv-group-project