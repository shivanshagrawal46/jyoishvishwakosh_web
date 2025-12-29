// useCitySuggestions.js
import { useEffect, useState, useCallback } from "react";
import { kundliAxiosClient } from "../../../utils/axios";

const useCitySuggestions = (searchText) => {
  const [state, setState] = useState({
    data: [],
    error: null,
    loading: false,
  });

  const fetchData = useCallback(async () => {
    let url = "";

    if (!searchText || searchText.trim() === "") {
      url = `cities?filter={"where":{"and":[{"country":{"like":"india","options":"i"}},{"state":{"like":"madhya","options":"i"}}]},"limit":60}`;
    } else {
      const searchTextCapitalized =
        searchText.charAt(0).toUpperCase() + searchText.slice(1);
      url = `cities?filter={"where":{"cityName":{"like":"${searchTextCapitalized}","options":"i"}},"limit":25}`;
    }

    try {
      setState((prevState) => ({ ...prevState, loading: true, error: null }));
      const response = await kundliAxiosClient.get(url);
      if (response.status === 200) {
        const data = response.data;
        setState({ data, error: null, loading: false });
      } else {
        setState({
          data: [],
          error: new Error("Non-200 response").message,
          loading: false,
        });
      }
    } catch (error) {
      setState({ data: [], error, loading: false });
    }
  }, [searchText]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500); // Debounce API calls by 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  return state;
};

export default useCitySuggestions;
