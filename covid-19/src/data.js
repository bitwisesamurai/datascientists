import {
  URL_COVID_CONFIRMED_DEV,
  URL_COVID_DIED_DEV,
  URL_COVID_RECOVERED_DEV,
  CHART_INFECTED,
  CHART_DIED,
  CHART_RECOVERED
} from "./constants";

import Papa from "papaparse";

import { drawChart, updateChart } from "./chart";

import { h, render } from "preact";
import Charts from "./Charts";
import Controls from "./Controls";

const fetchData = url =>
  new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      error: err => {
        // Executed if an error occurs while loading the file or if the `before` callback is aborted
        reject(err);
      },
      complete: results => {
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
        resolve(results.data);
      }
    });
  });

const data = {};

const handleError = err => {
  console.error(`Error: ${err}`);
};

const infected = fetchData(URL_COVID_CONFIRMED_DEV);
const died = fetchData(URL_COVID_DIED_DEV);
const recovered = fetchData(URL_COVID_RECOVERED_DEV);

Promise.all([infected, died, recovered]).then(values => {
  data[CHART_INFECTED] = dayTotalsByCountry(values[0], CHART_INFECTED);
  data[CHART_DIED] = dayTotalsByCountry(values[1], CHART_DIED);
  data[CHART_RECOVERED] = dayTotalsByCountry(values[2], CHART_RECOVERED);

  renderCharts();

  const countries = Array.from(uniqueCountries(values[0])).sort();
  // const dates = uniqueDates(data);

  [CHART_INFECTED, CHART_DIED, CHART_RECOVERED].forEach(element =>
    drawChart(element, data[element])
  );

  renderControls(countries);
}, handleError);

const renderCharts = () => {
  const mountNode = document.getElementById("charts");

  render(<Charts />, mountNode, mountNode.lastChild);
};

const renderControls = countries => {
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
};

const uniqueCountries = data => {
  const countries = new Set();

  data.forEach((element, i) => {
    if (i > 0) {
      countries.add(element[1]);
    }
  });

  return countries;
};

const uniqueDates = data => data[0].slice(4);

const dayTotalsByCountry = data => {
  const countryTotalsByDay = {};

  data.forEach((element, i) => {
    if (i > 0) {
      const country = element[1];
      const rowData = element.slice(4).map(val => parseInt(val));

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

  [CHART_INFECTED, CHART_DIED, CHART_RECOVERED].forEach(element =>
    updateChart(element, data[element][country])
  );
};
