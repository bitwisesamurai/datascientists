import { h } from "preact";
import { useState } from "preact/hooks";

import { CHART_DIED, CHART_RECOVERED } from "./constants";

const _ = h("");

const Charts = () => {
  const [selectedTab, setSelectedTab] = useState(CHART_DIED);

  const tabClass = name => `tab-item${selectedTab === name ? " active" : ""}`;
  const tabContentClass = visible => (visible ? "d-block" : "d-none");

  const handleClickTab = name => {
    setSelectedTab(name);
  };

  return (
    <div class="container">
      <div id="infected"></div>
      <ul class="tab tab-block">
        <li class={tabClass(CHART_DIED)}>
          <a href="#" onClick={() => handleClickTab(CHART_DIED)}>
            Died
          </a>
        </li>
        <li class={tabClass(CHART_RECOVERED)}>
          <a href="#" onClick={() => handleClickTab(CHART_RECOVERED)}>
            Recovered
          </a>
        </li>
      </ul>
      <div id="died" class={tabContentClass(selectedTab === CHART_DIED)}></div>
      <div
        id="recovered"
        class={tabContentClass(selectedTab === CHART_RECOVERED)}
      ></div>
    </div>
  );
};

export default Charts;
