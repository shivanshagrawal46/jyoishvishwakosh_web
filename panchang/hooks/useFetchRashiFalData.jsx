import { useEffect, useState, useCallback } from "react";
import { pathOr } from "ramda";
import { axiosClient } from "../../../utils/axios";

const useFetchRashiFalData = () => {
  const [state, setState] = useState({
    data: [],
    // categoryData: [],
    // filterData: {},
    error: null,
    loading: false,
    hasMore: false,
  });

  const fetchData = useCallback(async () => {
    // if (!categoryId || !subCategoryId) return;

    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    try {
      const response = await axiosClient.get(
        `${import.meta.env.VITE_APP_ID}/master/dataList?type_id=4`
      );
      const data = pathOr([], ["data", "data"], response);

      setState({
        data,
        error: null,
        loading: false,

        // hasMore,
      });
      return;
    } catch (error) {
      setState((prevState) => ({ ...prevState, error, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
};

export default useFetchRashiFalData;
