import * as d3 from "d3";

import { CHART_DIED, CHART_RECOVERED } from "./constants";

const margin = { top: 50, right: 50, bottom: 50, left: 50 };

const chartElement = id => document.getElementById(id);

const getDimensions = element => ({
  width: element.clientWidth - margin.left - margin.right,
  height: element.clientHeight - margin.top - margin.bottom
});

// Scale builders
const getXScale = width => d3.scaleLinear().range([0, width]);
const getYScale = height => d3.scaleLinear().range([height, 0]);

// Axis builders
const getXAxis = xScale => d3.axisBottom(xScale);
const getYAxis = yScale => d3.axisLeft(yScale);

const lineGenerator = (xScale, yScale) =>
  d3
    .line()
    .x((d, i) => xScale(i)) // The line's x values
    .y(d => yScale(d)) // The line's y values
    .curve(d3.curveMonotoneX); // Apply smoothing

const charts = {};

export const drawChart = (id, totals, country = "US") => {
  const data = totals[country];

  // Get the chart's dimensions (The result contains the chart's width and height)
  const dimensions = getDimensions(
    id === CHART_RECOVERED ? chartElement(CHART_DIED) : chartElement(id)
  );

  // Scales
  const xScale = getXScale(dimensions.width).domain([0, data.length - 1]);
  const yScale = getYScale(dimensions.height).domain(d3.extent(data));

  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", dimensions.width + margin.left + margin.right)
    .attr("height", dimensions.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Axes
  const xAxis = getXAxis(xScale);
  const yAxis = getYAxis(yScale);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${dimensions.height})`)
    .call(xAxis);
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // The line
  const line = svg
    .append("path")
    .datum(data)
    .attr("class", `line ${id}`)
    .attr("d", lineGenerator(xScale, yScale));

  // The circles for each data point
  const dots = svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", `dot ${id}`)
    .attr("cx", (d, i) => xScale(i))
    .attr("cy", d => yScale(d))
    .attr("r", 5);

  charts[id] = {
    xScale,
    yScale,
    svg,
    line,
    dots
  };
};

export const updateChart = (id, data) => {
  const chart = charts[id];

  const xScale = chart.xScale.domain([0, data.length - 1]);
  const yScale = chart.yScale.domain(d3.extent(data));

  const svg = chart.svg.transition();

  // Update the line and its points...
  chart.line
    .datum(data)
    .transition()
    .duration(750)
    .attr("d", lineGenerator(xScale, yScale));
  chart.dots
    .data(data)
    .transition()
    .duration(750)
    .attr("cx", (d, i) => xScale(i))
    .attr("cy", d => yScale(d));

  // ...And the axes
  svg
    .select(".x.axis")
    .duration(750)
    .call(getXAxis(xScale));
  svg
    .select(".y.axis")
    .duration(750)
    .call(getYAxis(yScale));
};
