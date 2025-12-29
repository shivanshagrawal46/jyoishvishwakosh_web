import { useEffect, useState, useCallback } from "react";
import { kundliAxiosClient } from "../../../utils/axios";

const useFetchPanchangData = (selectedDay, selectedCity, language) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFormattedDate = (date) => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  });

  const fetchData = useCallback(async () => {
    if (!selectedCity) return;
    setLoading(true);
    setError(null);

    try {
      const lang = language === "en" ? "en" : "Hi";
      const { year, month, day, hour, minute, second } =
        getFormattedDate(selectedDay);

      const response = await kundliAxiosClient.post(
        `userSearcheds/panchang/date?q=${lang}`,
        {
          year,
          month,
          day,
          lat: selectedCity.lat,
          lon: selectedCity.lon,
          hour,
          minute,
          second,
        }
      );
      setData(response.data.response);
    } catch (error) {
      setError(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDay, selectedCity, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};

export default useFetchPanchangData;
