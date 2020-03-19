import * as d3 from "d3";

const chart = document.getElementById("chart");

export const margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width = chart.clientWidth - margin.left - margin.right,
  height = chart.clientHeight - margin.top - margin.bottom;
