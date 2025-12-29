import React from "react";
import { Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CitySelector from "./CitySelector";

const InputSelectionCard = ({
  selectedDay,
  setSelectedDay,
  selectedCity,
  setSelectedCity,
  dateInputType = "date",
}) => {
  const { t } = useTranslation();

  const headingText =
    !!setSelectedDay && !!setSelectedCity
      ? t("panchang.dainik.inputHeading")
      : !!setSelectedDay
      ? t("panchang.dainik.inputHeading1")
      : !!setSelectedCity
      ? t("panchang.dainik.inputHeading2")
      : "";

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDay);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDay(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDay);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDay(nextDay);
  };

  return (
    <Card className="shadow-sm p-1 mb-2 border-0 rounded">
      <Card.Body>
        {headingText && (
          <Card.Title
            className="text-center mb-2"
            style={{ fontSize: "1.2rem" }}
          >
            {headingText}
          </Card.Title>
        )}
        <Row className="g-3">
          {!!setSelectedDay && (
            <Col xs={12} md={selectedCity ? 6 : 12}>
              <Form.Group controlId="datePicker" className="mb-0">
                <InputGroup>
                  <Button variant="outline-secondary" onClick={handlePrevDay}>
                    <FaChevronLeft />
                  </Button>
                  <Form.Control
                    id="dob-input"
                    type={dateInputType}
                    value={
                      selectedDay
                        ? selectedDay?.toISOString()?.split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const selectedDate = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setSelectedDay(selectedDate);
                    }}
                    className="shadow-sm text-center"
                  />
                  <Button variant="outline-secondary" onClick={handleNextDay}>
                    <FaChevronRight />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          )}

          {!!setSelectedCity && (
            <Col xs={12} md={selectedDay ? 6 : 12}>
              <Form.Group controlId="cityPicker" className="mb-0">
                <CitySelector
                  selectedCity={selectedCity}
                  onCitySelect={setSelectedCity}
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default InputSelectionCard;
