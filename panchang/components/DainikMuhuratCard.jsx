import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, Tabs, Tab, Accordion, Card, Row, Col } from "react-bootstrap";
import InputSelectionCard from "./InputSelectionCard";
import useFetchMuhuratData from "../hooks/useFetchMuhuratData";
import { useLocation, useNavigate } from "react-router-dom";
import DetailRow from "../../../components/DetailRow";
import { THEME_COLOR } from "../../../constants/layout-constant";

// List of tabs to render
const tabsList = ["yoga", "choghadiya", "dayMahurat"];

const DainikMahuratCard = () => {
  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState({
    lat: 23.83673,
    lon: 77.34323,
    label: "Bhopal, Madhya Pradesh",
  });
  const [activeTab, setActiveTab] = useState(tabsList[0]);

  const { data, loading, error } = useFetchMuhuratData(
    selectedDay,
    selectedCity,
    i18n.language
  );

  const navigate = useNavigate();
  const location = useLocation();

  // Function to update the URL and the active tab
  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    navigate({
      pathname: location.pathname,
      search: `?tab=${tabKey}`,
    });
  };

  // Update the active tab state if the query string changes
  useEffect(() => {
    const queryTab = new URLSearchParams(location.search).get("tab");
    if (queryTab && tabsList.includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [location.search]);

  const tabTitleStyle = {
    color: THEME_COLOR,
  };

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
      ) : error ? (
        <div className="text-center my-5">
          <p>{t("panchang.muhurat.errorLoadingData")}</p>
        </div>
      ) : data ? (
        <Tabs
          activeKey={activeTab}
          id="muhurat-tabs"
          className="mb-3"
          justify
          onSelect={handleTabSelect}
        >
          {tabsList.map((tabKey) => (
            <Tab
              key={tabKey}
              eventKey={tabKey}
              title={
                <span
                  style={{
                    color: activeTab === tabKey ? THEME_COLOR : "black",
                    fontWeight: activeTab === tabKey ? "bold" : "normal",
                  }}
                >
                  {t(`panchang.muhurat.${tabKey}`)}
                </span>
              }
            >
              {tabKey === "yoga" && <YogaCard cardData={data} />}
              {tabKey === "choghadiya" && <ChoghadiyaCard cardData={data} />}
              {tabKey === "dayMahurat" && <DayMahuratCard cardData={data} />}
            </Tab>
          ))}
        </Tabs>
      ) : (
        <div className="text-center my-5">
          <p>{t("panchang.muhurat.noDataAvailable")}</p>
        </div>
      )}
    </div>
  );
};

export default DainikMahuratCard;

// Reusable DetailList Component for displaying lists of data
const DetailList = ({ items = [], noDataMessage }) => {
  const { t } = useTranslation();
  return (
    <Card className="mb-2 text-center">
      <Card.Body>
        {items.length ? (
          items.map((item) => (
            <DetailRow
              key={item.name}
              label={item.name}
              value={item.value ?? item.time}
              textColor={item.colorFlag}
            />
          ))
        ) : (
          <p>{t(noDataMessage)}</p>
        )}
      </Card.Body>
    </Card>
  );
};

// Reusable CardSection component for displaying day and night sections
const CardSection = ({ title, data }) => {
  // Inline style for section headers
  const sectionHeaderStyle = {
    backgroundColor: "#ffc107", // Bootstrap warning color
    color: "black",
    textAlign: "center",
    padding: "0.5rem",
    borderRadius: "0.25rem",
    marginBottom: "0.5rem",
  };

  return (
    <Col xs={12} md={6}>
      <div style={sectionHeaderStyle}>
        <h5 className="m-0">{title}</h5>
      </div>
      <DetailList
        items={data}
        noDataMessage="panchang.muhurat.noDataAvailable"
      />
    </Col>
  );
};

// YogaCard Component
const YogaCard = ({ cardData }) => (
  <>
    <DetailList
      items={cardData?.yogas ?? []}
      noDataMessage="panchang.muhurat.noYogasData"
    />
    <AccordionComponent cardData={cardData} />
  </>
);

// AccordionComponent for Rituals, Mool, Travel, Extra Yoga
const AccordionComponent = ({ cardData }) => {
  const { t } = useTranslation();

  // Define accordion items with translated titles
  const accordionItems = [
    {
      title: t("panchang.muhurat.rituals"),
      items: cardData?.rituals ?? [],
      noDataMessage: "panchang.muhurat.noRitualsData",
    },
    {
      title: t("panchang.muhurat.mool"),
      items: cardData?.mool ?? [],
      noDataMessage: "panchang.muhurat.noMoolData",
    },
    {
      title: t("panchang.muhurat.travel"),
      items: cardData?.travel ?? [],
      noDataMessage: "panchang.muhurat.noTravelData",
    },
    {
      title: t("panchang.muhurat.extraYoga"),
      items: cardData?.extraYoga ?? [],
      noDataMessage: "panchang.muhurat.noExtraYogaData",
    },
  ];

  const accordionHeaderStyle = {
    color: THEME_COLOR,
  };

  return (
    <Accordion defaultActiveKey="0">
      {accordionItems.map((item, index) => (
        <Accordion.Item eventKey={index.toString()} key={index}>
          <Accordion.Header>
            <span style={accordionHeaderStyle}>{item.title}</span>
          </Accordion.Header>
          <Accordion.Body>
            <DetailList
              items={item?.items ?? []}
              noDataMessage={item.noDataMessage}
            />
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

const ChoghadiyaCard = ({ cardData }) => {
  const { t } = useTranslation();

  return (
    <Row className="my-3 justify-content-center">
      <CardSection
        title={t("panchang.muhurat.day")}
        data={cardData?.choghadiya?.day || []}
      />
      <CardSection
        title={t("panchang.muhurat.night")}
        data={cardData?.choghadiya?.night || []}
      />
    </Row>
  );
};

const DayMahuratCard = ({ cardData }) => {
  const { t } = useTranslation();

  return (
    <Row className="my-3 justify-content-center">
      <CardSection
        title={t("panchang.muhurat.day")}
        data={cardData?.dayMahurat?.day || []}
      />
      <CardSection
        title={t("panchang.muhurat.night")}
        data={cardData?.dayMahurat?.night || []}
      />
    </Row>
  );
};
