// DainikPanchangCard.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Row, Col, Image, Spinner } from "react-bootstrap";
import InputSelectionCard from "./InputSelectionCard";
import KundliChart from "../../../components/KundliChart";
import useDeviceType, { DEVICE_TYPES } from "../../../hooks/useDeviceType";
import useFetchPanchangData from "./../hooks/useFetchPanchangData";
import DetailRow from "../../../components/DetailRow";
import { generateChartData } from "../../../constants/layout-constant";
// Constants and utility functions
const headingKeys = [
  "purnimantMaah",
  "paksha",
  "tithi",
  "hinduDay",
  "nakshatra",
];
const topDetailsKeys = [
  "tithi",
  "paksha",
  "day",
  "solarMaah",
  "nakshatra",
  "yoga",
  "ayan",
  "rashi",
  "karan",
  "lagna",
  "lagnaLord",
  "sunSign",
  "moonSign",
];
const nakshatraPadaKeys = [
  "padaSamay",
  "padaSamay2",
  "padaSamay3",
  "padaSamay4",
];
const sunOptionKeys = ["suryodaya", "suryast", "dinman"];
const moonOptionKeys = ["chandrodaya", "chandrast", "ratriman"];

const capitalize = (string) =>
  string && typeof string === "string"
    ? string.charAt(0).toUpperCase() + string.slice(1)
    : "";

const decimalToHHMM = (decimal) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal % 1) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const formatTime = (timeString) =>
  timeString?.substring(timeString.indexOf(",") + 2);

// Main component
const DainikPanchangCard = () => {
  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState({
    lat: 23.83673,
    lon: 77.34323,
    label: "Bhopal, Madhya Pradesh",
  });
  const { data, loading, error } = useFetchPanchangData(
    selectedDay,
    selectedCity,
    i18n.language
  );
  const gocharChartData = generateChartData(
    data?.lagna?.chart ?? [],
    [],
    i18n.language
  );
  const timeKeys = useMemo(() => {
    const keys = [
      "tithi",
      "rashi",
      "nakshatra",
      "yoga",
      "karan",
      "karanSamay2",
    ].map((i) => {
      if ((data?.details ?? {}).hasOwnProperty(`${i}Samay`)) {
        return `${i}Samay`;
      } else if ((data?.details ?? {}).hasOwnProperty(i)) {
        return data?.details[i];
      }
      return undefined;
    });
    return [
      ...keys,
      "tithi2",
      "tithiSamay2",
      "sunrise",
      "sunset",
      "moonRise",
      "moonSet",
      "dayDuration",
    ];
  }, [data]);

  const skipKeys = useMemo(
    () => [
      ...headingKeys,
      ...topDetailsKeys,
      ...nakshatraPadaKeys,
      ...sunOptionKeys,
      ...moonOptionKeys,
      ...timeKeys,
      "pada",
    ],
    [timeKeys]
  );

  const setDateData = useCallback((detailsData, index) => {
    let caseValue = "";
    switch (index) {
      case "tithi":
        caseValue = detailsData.tithiSamay || "";
        if (detailsData.tithi2) {
          const caseValue2 = `\n${detailsData.tithi2} ${detailsData.tithiSamay2}`;
          return caseValue + caseValue2;
        }
        return caseValue;
      case "rashi":
        return detailsData.rashiSamay || "";
      case "nakshatra":
        return detailsData.nakshatraSamay || "";
      case "yoga":
        return detailsData.yogaSamay || "";
      case "karan":
        return detailsData.karanSamay || "";
      case "karan2":
        return detailsData.karanSamay2 || "";
      default:
        return "";
    }
  }, []);
  return (
    <div>
      <InputSelectionCard
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : data ? (
        <>
          <TopHeadingCard
            detailsData={data.details}
            subHeadingKeys={[
              data?.details?.vikramSamvat
                ? `${t("panchang.dainik.vikramSamvat1")} - ${
                    data.details.vikramSamvat
                  }`
                : "",
              data?.details?.shakSamvat
                ? `${t("panchang.dainik.shakSamvat1")} - ${
                    data.details.shakSamvat
                  }`
                : "",
              data?.details?.gol
                ? `${t("panchang.dainik.gol")} - ${
                    data.details.gol.split(" ")[0]
                  }`
                : "",
              data?.details?.ayan
                ? `${t("panchang.dainik.ayan")} - ${
                    data.details.ayan.split(" ")[0]
                  }`
                : "",
              data?.details?.retu
                ? `${t("panchang.dainik.retu")} - ${
                    data.details.retu.split(" ")[0]
                  }`
                : "",
              `${selectedDay.getDate()}/${
                selectedDay.getMonth() + 1
              }/${selectedDay.getFullYear()}, ${selectedCity.label}`,
            ].filter(Boolean)}
          />
          <Row className="my-1">
            <Col xs={12} md={5}>
              <TopDetailCard
                detailsData={data.details}
                setDateData={setDateData}
              />
              <NakshatraDetailCard detailsData={data.details} />
              <Card className="mb-2 bg-warning text-dark text-center p-0">
                <div className="mb-2 bg-warning text-dark text-center p-2 rounded">
                  <h5 className="d-flex justify-content-center flex-wrap m-0">
                    <span className="mx-2 font-weight-bold">
                      {t("panchang.dainik.gocharKundli")}
                    </span>
                  </h5>
                </div>
                <Card.Body
                  id="gocharChart"
                  className="d-flex justify-content-center flex-wrap p-0"
                >
                  <KundliChart
                    chartData={gocharChartData}
                    text={selectedCity.label}
                    date={selectedDay.toDateString()}
                    // showSymbol={false}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={7}>
              <Card className="mb-3">
                <Card.Body>
                  {Object.keys(data.details)
                    .filter((key) => !skipKeys.includes(key))
                    .map((key) => (
                      <DetailRow
                        key={key}
                        label={t(`panchang.dainik.${key}`)}
                        value={data.details[key]}
                      />
                    ))}
                </Card.Body>
              </Card>
              <SunOptionButtonContainer
                detailsData={data.details}
                selectedCity={selectedCity}
              />
              <MoonOptionButtonContainer
                detailsData={data.details}
                selectedCity={selectedCity}
              />
            </Col>
          </Row>
        </>
      ) : (
        <div className="text-center my-5">
          <p>{t("panchang.dainik.errorLoadingData")}</p>
        </div>
      )}
    </div>
  );
};

export default DainikPanchangCard;

// Sub-components

const TopHeadingCard = ({ detailsData, subHeadingKeys = [] }) => {
  return (
    <div className="mb-2 bg-warning text-dark text-center p-2 rounded">
      <h6 className="d-flex justify-content-center flex-wrap m-0">
        {subHeadingKeys.map(
          (key, index) =>
            key && (
              <span key={key} className="mx-2 ">
                {key}
                {index < key.length - 1 && ","}
              </span>
            )
        )}
      </h6>
      <h6 className="d-flex justify-content-center flex-wrap m-0">
        {headingKeys.map(
          (key, index) =>
            detailsData[key] && (
              <span key={key} className="mx-2 font-weight-bold">
                {detailsData[key]}
                {index < headingKeys.length - 1 && ","}
              </span>
            )
        )}
      </h6>
    </div>
  );
};

const TopDetailCard = ({ detailsData, setDateData }) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-2 text-center">
      <Card.Body>
        {topDetailsKeys.map(
          (key) =>
            detailsData[key] && (
              <DetailRow
                key={key}
                label={t(`panchang.dainik.${key}`)}
                value={`${capitalize(detailsData[key])} ${setDateData(
                  detailsData,
                  key
                )}`}
              />
            )
        )}
      </Card.Body>
    </Card>
  );
};

const NakshatraDetailCard = ({ detailsData }) => {
  const { t } = useTranslation();
  const pada = parseInt(detailsData.pada);

  const renderData = () => {
    return nakshatraPadaKeys.map((key, index) => {
      const padaSamay = detailsData[key];
      if (!padaSamay) return null;

      const currentPada = (pada + index) % 4 || 4;
      const nakshatraName =
        index + pada <= 4
          ? detailsData.nakshatra
          : detailsData.nakshatra2 || detailsData.nakshatra;

      return (
        <DetailRow
          key={key}
          label={`${capitalize(nakshatraName)} ${t(
            "panchang.dainik.pada"
          )} ${currentPada}`}
          value={padaSamay}
        />
      );
    });
  };

  return (
    <>
      <div className="mb-2 bg-warning text-dark text-center p-2 rounded">
        <h5 className="d-flex justify-content-center flex-wrap m-0">
          <span className="mx-2 font-weight-bold">
            {t("panchang.dainik.padaHeading")}
          </span>
        </h5>
      </div>
      <Card className="mb-2 text-center">
        <Card.Body>{renderData()}</Card.Body>
      </Card>
    </>
  );
};
const OptionButtonContainer = ({
  options,
  selectedOption,
  onOptionChange,
  renderContent,
}) => {
  const isMobileView = useDeviceType([DEVICE_TYPES.MOBILE]);

  return (
    <Row className="my-3">
      <Col
        xs={12}
        md={2}
        className={`d-flex ${
          isMobileView
            ? "justify-content-center"
            : "flex-column align-items-center"
        } mb-3 flex-wrap`}
      >
        {options.map((option) => (
          <Button
            key={option.key}
            variant={selectedOption === option.key ? "warning" : "light"}
            className="mx-2 mb-2"
            onClick={() => onOptionChange(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </Col>
      <Col xs={12} md={10}>
        {renderContent()}
      </Col>
    </Row>
  );
};

const SunOptionButtonContainer = ({ detailsData, selectedCity }) => {
  const { t } = useTranslation();
  const [sunOption, setSunOption] = useState("suryodaya");

  const sunOptions = [
    { key: "suryodaya", label: t("panchang.dainik.suryodaya") },
    { key: "suryast", label: t("panchang.dainik.suryast") },
    { key: "dinman", label: t("panchang.dainik.dinman") },
  ];

  const renderSunContent = () => {
    if (!detailsData) return null;

    const contentMap = {
      suryodaya: detailsData.sunrise && formatTime(detailsData.sunrise),
      suryast: detailsData.sunset && formatTime(detailsData.sunset),
      dinman: detailsData.dayDuration && decimalToHHMM(detailsData.dayDuration),
    };

    const content = contentMap[sunOption];

    return content ? (
      <Card className="mb-3 text-center">
        <Card.Body>
          <Row className="my-3 align-items-center">
            <Col sm={4} className="text-center mb-3 mb-sm-0">
              <Image
                src={`/images/panchang/${sunOption}.png`}
                alt={sunOption}
                height="80"
                width="80"
              />
            </Col>
            <Col xs={12} sm={8}>
              <h3>{content}</h3>
              <p>
                {t(`panchang.dainik.${sunOption}`)} {selectedCity?.label ?? ""}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ) : null;
  };

  return (
    <OptionButtonContainer
      options={sunOptions}
      selectedOption={sunOption}
      onOptionChange={setSunOption}
      renderContent={renderSunContent}
    />
  );
};

const MoonOptionButtonContainer = ({ detailsData, selectedCity }) => {
  const { t } = useTranslation();
  const [moonOption, setMoonOption] = useState("chandrodaya");

  const moonOptions = [
    { key: "chandrodaya", label: t("panchang.dainik.chandrodaya") },
    { key: "chandrast", label: t("panchang.dainik.chandrast") },
    { key: "ratriman", label: t("panchang.dainik.ratriman") },
  ];

  const renderMoonContent = () => {
    if (!detailsData) return null;

    const nightDuration = decimalToHHMM(
      24 - parseFloat(detailsData.dayDuration || "0")
    );

    const contentMap = {
      chandrodaya: detailsData.moonRise
        ? formatTime(detailsData.moonRise)
        : t("panchang.dainik.noRise"),
      chandrast: detailsData.moonSet
        ? formatTime(detailsData.moonSet)
        : t("panchang.dainik.noSet"),
      ratriman: nightDuration,
    };
    const content = contentMap[moonOption];

    return content ? (
      <Card className="mb-3 text-center">
        <Card.Body>
          <Row className="my-3 align-items-center">
            <Col xs={12} sm={4} className="text-center mb-3 mb-sm-0">
              <Image
                src={`/images/panchang/${moonOption}.png`}
                alt={moonOption}
                height="80"
                width="80"
              />
            </Col>
            <Col xs={12} sm={8}>
              <h3>{content}</h3>
              <p>
                {t(`panchang.dainik.${moonOption}`)} {selectedCity?.label ?? ""}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ) : null;
  };

  return (
    <OptionButtonContainer
      options={moonOptions}
      selectedOption={moonOption}
      onOptionChange={setMoonOption}
      renderContent={renderMoonContent}
    />
  );
};
