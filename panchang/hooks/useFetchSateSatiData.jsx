import { useEffect, useState, useCallback } from "react";
import { kundliAxiosClient } from "../../../utils/axios";

const useFetchSateSatiData = (selectedDay, language) => {
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
    setLoading(true);
    setError(null);

    try {
      const lang = language === "en" ? "en" : "Hi";
      const { year, month, day, hour, minute, second } =
        getFormattedDate(selectedDay);

      const response = await kundliAxiosClient.post(
        `userSearcheds/getSadeSati?q=${lang}`,
        {
          year,
          month,
          day,
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
  }, [selectedDay, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};

export default useFetchSateSatiData;
