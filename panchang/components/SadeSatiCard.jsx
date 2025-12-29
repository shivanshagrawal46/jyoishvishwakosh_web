import React, { useState } from "react";
import InputSelectionCard from "./InputSelectionCard";
import useFetchSateSatiData from "../hooks/useFetchSateSatiData";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import CustomTable from "../../../components/CustomTable";

const SadeSatiCard = ({ showInputComponent = true }) => {
  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const { data, loading, error } = useFetchSateSatiData(
    selectedDay,
    i18n.language
  );

  const headers = [
    t("panchang.sadeSati.tableHeading1"),
    t("panchang.sadeSati.tableHeading2"),
    t("panchang.sadeSati.tableHeading3"),
    t("panchang.sadeSati.tableHeading4"),
  ];
  const rows = data?.map((item, i) => {
    return [item?.phase, item?.Rashi, item?.startDate, item?.endDate];
  });
  return (
    <div>
      {showInputComponent && (
        <InputSelectionCard
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <div className="text-center my-5">
          <p>{t("panchang.muhurat.errorLoadingData")}</p>
        </div>
      ) : data ? (
        <CustomTable headers={headers} rows={rows} headerColor="#ffc107" />
      ) : (
        <div className="text-center my-5">
          <p>{t("panchang.muhurat.noDataAvailable")}</p>
        </div>
      )}
    </div>
  );
};

export default SadeSatiCard;
