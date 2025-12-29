import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Col, Row, Spinner, Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useFetchRashiFalData from "../hooks/useFetchRashiFalData";
import { useLocation, useNavigate } from "react-router-dom";
import { THEME_COLOR } from "../../../constants/layout-constant";
import useFetchKoshCategoryData from "../../kosh/hooks/useFetchKoshCategoryData";
import useFetchKoshData from "../../kosh/hooks/useFetchKoshData";
import parse from "html-react-parser";
import { getFilePath } from "../../../utils/utils";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/50?text=Image";
const tabsList = ["monthly", "yearly"];

const RashiFalCard = ({ showInHomePage = false }) => {
  const { t } = useTranslation();
  const { data, loading, error } = useFetchRashiFalData();

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="text-center my-5">
        <p className="text-danger">
          {t(
            error
              ? "panchang.muhurat.errorLoadingData"
              : "panchang.muhurat.noDataAvailable"
          )}
        </p>
      </div>
    );
  }

  return (
    <Row>
      <Col xs={12}>
        <AccordionComponent showInHomePage={showInHomePage} />
      </Col>
    </Row>
  );
};

const AccordionComponent = ({ showInHomePage }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(tabsList[0]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryTab = params.get("tab");
    if (queryTab && tabsList.includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [location.search]);

  const handleTabSelect = useCallback(
    (tabKey) => {
      setActiveTab(tabKey);
      const params = new URLSearchParams(location.search);
      params.set("tab", tabKey);
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate]
  );

  return (
    <Tabs
      activeKey={activeTab}
      id="horoscope-tabs"
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
              {t(`panchang.horoscope.${tabKey}`)}
            </span>
          }
        >
          <MonthlyRashiCard
            categoryId={tabKey === "monthly" ? 15 : 21}
            showInHomePage={showInHomePage}
          />
        </Tab>
      ))}
    </Tabs>
  );
};

const MonthlyRashiCard = ({ categoryId, showInHomePage }) => {
  const { t } = useTranslation();
  const { data, loading, error } = useFetchKoshCategoryData({ categoryId });
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const index = parseInt(params.get("horoscopeTab"), 10);
    if (!isNaN(index) && index >= 0 && index < data?.data?.kosh?.length) {
      setSelectedMonthIndex(index);
    }
  }, [location.search, data]);

  const handleMonthChange = (index) => {
    setSelectedMonthIndex(index);
    const params = new URLSearchParams(location.search);
    params.set("horoscopeTab", index);
    navigate({ search: params.toString() }, { replace: true });
  };

  if (loading) return <SpinnerComponent />;
  if (error || !data?.data?.kosh?.length)
    return <NoDataComponent error={error} />;

  const activeCategory = data.data.kosh[selectedMonthIndex];

  return (
    <>
      <Tabs
        activeKey={selectedMonthIndex}
        onSelect={(k) => handleMonthChange(parseInt(k, 10))}
        className="mb-2"
      >
        {data.data.kosh.map((item, index) => (
          <Tab
            key={index}
            eventKey={index}
            title={
              <span
                style={{
                  color: selectedMonthIndex === index ? THEME_COLOR : "black",
                  fontWeight: selectedMonthIndex === index ? "bold" : "normal",
                }}
              >
                {item.name}
              </span>
            }
          />
        ))}
      </Tabs>
      {!showInHomePage && (
        <RashiListContainer item={activeCategory} categoryId={categoryId} />
      )}
    </>
  );
};

const RashiListContainer = ({ item, categoryId }) => {
  const { t } = useTranslation();
  const { data, loading, error } = useFetchKoshData({
    subCategoryId: item?.id,
    categoryId,
    pageNum: 1,
  });
  const [selectedRashi, setSelectedRashi] = useState(0);

  if (loading) return <SpinnerComponent />;
  if (error || !data?.kosh?.length) return <NoDataComponent error={error} />;

  const activeRashi = data.kosh[selectedRashi];

  return (
    <div>
      {/* Rashi Buttons */}
      <div
        className="d-flex flex-wrap justify-content-center"
        style={{ gap: "15px", marginTop: "15px" }}
      >
        {data.kosh.map((category, index) => (
          <button
            key={category.id}
            onClick={() => setSelectedRashi(index)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border:
                selectedRashi === index
                  ? `2px solid ${THEME_COLOR}`
                  : "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: selectedRashi === index ? "#f0f8ff" : "#fff",
              boxShadow:
                selectedRashi === index
                  ? "0px 4px 10px rgba(0, 0, 0, 0.2)"
                  : "0px 2px 5px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: "6px",
            }}
          >
            <img
              src={
                category.image?.[0]
                  ? getFilePath(category.image?.[0])
                  : "" || PLACEHOLDER_IMAGE
              }
              alt={category.title_hi}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                marginBottom: "8px",
              }}
            />
            {/* Text */}
            <span
              style={{
                fontSize: "14px",
                textAlign: "center",
                color: selectedRashi === index ? THEME_COLOR : "#333",
                fontWeight: selectedRashi === index ? "bold" : "normal",
              }}
            >
              {t(category.title_hi)}
            </span>
          </button>
        ))}
      </div>

      {/* Active Rashi Details */}
      {activeRashi && (
        <Card className="mt-4 text-center border-0 shadow-sm">
          <Card.Header
            style={{
              backgroundColor: THEME_COLOR,
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            {t(activeRashi.title_hi)}
          </Card.Header>
          <Card.Body>{parse(activeRashi.meaning || "")}</Card.Body>
        </Card>
      )}
    </div>
  );
};

const SpinnerComponent = () => (
  <div className="text-center my-5">
    <Spinner animation="border" variant="primary" />
  </div>
);

const NoDataComponent = ({ error }) => (
  <div className="text-center my-5">
    <p className="text-danger">
      {error ? "Error loading data" : "No data available"}
    </p>
  </div>
);

export default RashiFalCard;
