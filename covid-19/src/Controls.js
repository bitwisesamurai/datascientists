import { h } from "preact";

const _ = h("");

const Controls = ({ countries, selectedCountry, onChangeCountry }) => (
  <div class="control-container">
    <label>Country:</label>
    <select onChange={onChangeCountry}>
      {countries.map(country => (
        <option value={country} selected={country === selectedCountry}>
          {country}
        </option>
      ))}
    </select>
  </div>
);

export default Controls;
