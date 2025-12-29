// CitySelector.js
import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { kundliAxiosClient } from "../../../utils/axios";

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "40px",
    borderRadius: "4px",
    borderColor: "#ced4da",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#80bdff",
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6c757d",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#495057",
  }),
};

const CitySelector = ({ selectedCity, onCitySelect }) => {
  const loadOptions = async (inputValue) => {
    let url = "";

    if (!inputValue || inputValue.trim() === "") {
      url = `cities?filter={"where":{"and":[{"country":{"like":"india","options":"i"}},{"state":{"like":"madhya","options":"i"}}]},"limit":60}`;
    } else {
      const searchTextCapitalized =
        inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
      url = `cities?filter={"where":{"cityName":{"like":"${searchTextCapitalized}","options":"i"}},"limit":25}`;
    }

    try {
      const response = await kundliAxiosClient.get(url);
      if (response.status === 200) {
        const cities = response.data;
        const options = cities.map((city) => ({
          value: city.id, // Assuming 'id' is a unique identifier for the city
          label: `${city.cityName}, ${city.state}, ${city.country}`,
          lat: city.lat,
          lon: city.lng,
        }));
        return options;
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const loadingMessage = () => "Loading...";
  const noOptionsMessage = () => "No options";

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      value={selectedCity}
      onChange={onCitySelect}
      loadOptions={loadOptions}
      placeholder="Select a city"
      isClearable
      styles={customStyles}
      loadingMessage={loadingMessage}
      noOptionsMessage={noOptionsMessage}
    />
  );
};

export default CitySelector;
