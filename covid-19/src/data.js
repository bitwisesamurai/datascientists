import { URL_COVID_CONFIRMED_DEV } from "./constants";

import Papa from "papaparse";

import * as d3 from "d3";

import { margin, width, height } from "./chart";

import { h, render } from "preact";
import Controls from "./Controls";

let totalsByCountry;

Papa.parse(URL_COVID_CONFIRMED_DEV, {
  download: true,
  error: (err, file, inputElem, reason) => {
    // Executed if an error occurs while loading the file or if the `before` callback is aborted
    console.error(`Error: ${err}`);
  },
  complete: (results, file) => {
    /*
      The data is an array of arrays...

      {
        "data": [
          [
            "Province/State",
            "Country/Region",
            "Lat",
            "Long",
            "1/22/20",
            ...

      The first element of `data` is an array that contains the dataset's header. Its first four elements are the data's
      "Province/State", "Country/Region", "Lat", and "Long" columns; every element after that is a column that represents
      a day (In the example above, the fifth column contains the data for 1/22/2020)
    */

    const data = results.data;
    const countries = Array.from(uniqueCountries(data)).sort();
    const dates = uniqueDates(data);

    totalsByCountry = dayTotalsByCountry(data, countries, uniqueDates);

    drawChart(totalsByCountry);

    const mountNode = document.getElementById("controls");

    render(
      <Controls
        countries={countries}
        selectedCountry="US"
        onChangeCountry={handleOnChange}
      />,
      mountNode,
      mountNode.lastChild
    );
  }
});

const uniqueCountries = data => {
  const countries = new Set();

  data.forEach((elem, i) => {
    if (i > 0) {
      countries.add(elem[1]);
    }
  });

  return countries;
};

const uniqueDates = data => data[0].slice(4);

const dayTotalsByCountry = data => {
  const countryTotalsByDay = {};

  data.forEach((elem, i) => {
    if (i > 0) {
      const country = elem[1];
      const rowData = elem.slice(4).map(val => parseInt(val));

      if (countryTotalsByDay.hasOwnProperty(country)) {
        countryTotalsByDay[country] = countryTotalsByDay[country].map(
          (val, i) => val + rowData[i]
        );
      } else {
        // If countryTotalsByDay doesn't contain a key that's equal to the value of country...
        countryTotalsByDay[country] = rowData;
      }
    }
  });

  return countryTotalsByDay;
};

const handleOnChange = event => {
  const country = event.target.value;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "countrySelected",
    country
  });

  const data = totalsByCountry[country];

  updateData(data);
};

var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Scales
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

const lineGenerator = d3
  .line()
  .x((d, i) => xScale(i)) // The line's x values
  .y(d => yScale(d)) // The line's y values
  .curve(d3.curveMonotoneX); // Apply smoothing
let line;

// Axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

const drawChart = (totalsByCountry, country = "US") => {
  const data = totalsByCountry[country];

  // Scale the data's range
  xScale.domain([0, data.length - 1]);
  yScale.domain(d3.extent(data));

  // Add the axes...
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // ...The line...
  line = svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", lineGenerator);

  // ...And a circle for each data point
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => xScale(i))
    .attr("cy", d => yScale(d))
    .attr("r", 5);
};

const updateData = data => {
  // Scale the data's range
  xScale.domain([0, data.length - 1]);
  yScale.domain(d3.extent(data));

  const svg = d3.select("#chart").transition();

  // Update the line and its points...
  line
    .datum(data)
    .transition()
    .duration(750)
    .attr("d", lineGenerator);
  d3.selectAll(".dot")
    .data(data)
    .transition()
    .duration(750)
    .attr("cx", (d, i) => xScale(i))
    .attr("cy", d => yScale(d));

  // ...And the axes
  svg
    .select(".x.axis")
    .duration(750)
    .call(xAxis);
  svg
    .select(".y.axis")
    .duration(750)
    .call(yAxis);
};
