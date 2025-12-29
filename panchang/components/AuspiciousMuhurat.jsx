import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Col,
  InputGroup,
  Row,
  Form,
  Spinner,
  Tabs,
  Tab,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useFetchAuspiciousMuhuratData from "../hooks/useFetchAuspiciousMuhuratData";
import { Link, useSearchParams } from "react-router-dom";
import { THEME_COLOR } from "../../../constants/layout-constant";

const AuspiciousMuhurat = ({ showInputComponent = true }) => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const selectedDate = useMemo(
    () => new Date(selectedYear, 0, 1),
    [selectedYear]
  );

  const { data, loading, error } = useFetchAuspiciousMuhuratData(
    selectedDate,
    i18n.language
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultKey = searchParams.get("tab") || "0";
  const [activeKey, setActiveKey] = useState(defaultKey);

  useEffect(() => {
    setSearchParams({ tab: activeKey });
  }, [activeKey, setSearchParams]);

  const yearOptions = useMemo(() => {
    const years = [];
    const startYear = 1900;
    const endYear = currentYear + 10;
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const activeTabItem =
    data && data.length > 0 ? data[parseInt(activeKey, 10)] : null;

  const renderYearSelector = () => (
    <Card className="p-2 mb-2 border-0 shadow-sm">
      <Card.Body className="p-2">
        <Row className="align-items-center">
          <Col
            xs={12}
            md={2}
            className="mb-2 mb-md-0"
            style={{
              textAlign: "center",
            }}
          >
            <Form.Label
              htmlFor="yearSelect"
              style={{ fontSize: "1rem", fontWeight: "600", marginBottom: 0 }}
            >
              {t("panchang.auspiciousMuhurat.inputHeading1")}
            </Form.Label>
          </Col>
          <Col xs={12} md={10}>
            <InputGroup>
              <Form.Select
                id="yearSelect"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="shadow-sm text-center"
                style={{ fontSize: "0.9rem" }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const renderLoading = () => (
    <div className="text-center my-3">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  const renderError = () => (
    <div className="text-center my-3">
      <p className="mb-0" style={{ fontSize: "0.9rem" }}>
        {t("panchang.muhurat.errorLoadingData")}
      </p>
    </div>
  );

  const renderNoData = () => (
    <div className="text-center my-3">
      <p className="mb-0" style={{ fontSize: "0.9rem" }}>
        {t("panchang.muhurat.noDataAvailable")}
      </p>
    </div>
  );

  const renderTabContent = () => (
    <>
      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k)}
        className="mb-2"
        style={{ fontSize: "0.9rem" }}
      >
        {data.map((item, index) => (
          <Tab
            eventKey={`${index}`}
            key={index}
            title={
              <>
                <span
                  style={{
                    color: activeKey === `${index}` ? THEME_COLOR : "black",
                    fontWeight: activeKey === `${index}` ? "bold" : "normal",
                  }}
                >
                  {item.name}
                </span>
                &nbsp;
                <Badge bg="secondary" style={{ verticalAlign: "middle" }}>
                  {item.value.length}
                </Badge>
              </>
            }
          />
        ))}
      </Tabs>

      {activeTabItem && (
        <h5
          className="text-center"
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: THEME_COLOR,
            marginBottom: "0.5rem",
          }}
        >
          {activeTabItem.name}
        </h5>
      )}

      {activeTabItem && activeTabItem.value.length > 0 ? (
        <Card className="mb-2 text-center border-0">
          <Card.Body className="p-2">
            <Row>
              {activeTabItem.value.map((dateStr, idx) => (
                <Col key={idx} xs={12} md={4} className="mb-2">
                  <ListGroup.Item
                    className="shadow-sm rounded"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {dateStr}
                  </ListGroup.Item>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      ) : (
        renderNoData()
      )}
    </>
  );

  const renderCards = () => (
    <Row>
      {data.map((item, idx) => (
        <Col key={idx} xs={12} md={6} className="mb-2">
          <Link
            to={`/services/panchang/auspiciousMuhurat?tab=${idx}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              className="border rounded shadow-sm"
              style={{
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Card.Body className="text-center p-2">
                <Card.Title
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: THEME_COLOR,
                    marginBottom: "0.3rem",
                  }}
                >
                  {item.name}
                </Card.Title>
                <Card.Text
                  className="mb-0"
                  style={{
                    fontSize: "0.8rem",
                    color: "#555",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Badge bg="secondary">{item.value.length}</Badge>
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
  
  return (
    <div>
      {showInputComponent && renderYearSelector()}

      {loading
        ? renderLoading()
        : error
        ? renderError()
        : data && data.length > 0
        ? showInputComponent
          ? renderTabContent()
          : renderCards()
        : renderNoData()}
    </div>
  );
};

export default AuspiciousMuhurat;
