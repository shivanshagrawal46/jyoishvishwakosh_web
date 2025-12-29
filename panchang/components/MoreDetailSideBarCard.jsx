import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ListGroup } from "react-bootstrap";
import { FaChevronRight } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { kundliTabs } from "../../kundli";
import useDeviceType, { DEVICE_TYPES } from "../../../hooks/useDeviceType";
import { Tabs, Tab } from "react-tabs-scrollable";
import { useAppDataState } from "../../../store/useAppDataState";

const items = [
  {
    label: "panchangDainikLbl",
    description: "Learn more about React.",
    link: "/services/panchang/dainik-panchang",
  },
  {
    label: ["panchangMuhuratLbl", "panchang.muhurat.yoga"],
    description: "Detailed documentation on JavaScript.",
    link: "/services/panchang/muhurat-panchang?tab=yoga",
  },
  {
    label: ["panchangMuhuratLbl", "panchang.muhurat.choghadiya"],
    description: "Detailed documentation on JavaScript.",
    link: "/services/panchang/muhurat-panchang?tab=choghadiya",
  },
  {
    label: ["panchangMuhuratLbl", "panchang.muhurat.dayMahurat"],
    description: "Detailed documentation on JavaScript.",
    link: "/services/panchang/muhurat-panchang?tab=dayMahurat",
  },
  {
    label: ["horoscopeLbl"],
    description: "Detailed documentation on JavaScript.",
    link: "/services/panchang/horoscope",
  },
  {
    label: ["sadeSatiLbl"],
    description: "Detailed documentation on JavaScript.",
    link: "/services/panchang/sadeSati",
  },
  {
    label: ["auspiciousMuhuratLbl"],
    description: "Detailed documentation on JavaScript.",
    link: "/services/panchang/auspiciousMuhurat",
  },
  ...Object.values(kundliTabs),
];

const MoreDetailSideBarCard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMobileView = useDeviceType([DEVICE_TYPES.MOBILE]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const appData = useAppDataState((state) => state.appData);

  const renderTranslatedName = (label) =>
    Array.isArray(label) ? label.map((l) => t(l)).join(" - ") : t(label);

  const getActiveItemIndex = () => {
    return items.findIndex((item) => {
      const itemUrl = new URL(item.link, window.location.origin);
      return (
        itemUrl.pathname === location.pathname &&
        itemUrl.search === location.search
      );
    });
  };

  useEffect(() => {
    const index = getActiveItemIndex();
    if (index !== -1) setActiveTab(index);
  }, [location]);

  const CardWrapper = ({ title, children }) => (
    <aside className="p-3 mb-4 shadow-sm rounded bg-white border">
      {title && (
        <div className="bg-warning text-dark text-center py-2 rounded mb-3">
          <h6 className="fw-bold mb-0">{title}</h6>
        </div>
      )}
      <div>{children}</div>
    </aside>
  );

  const renderMobileView = () => (
    <Tabs
      activeTab={activeTab}
      onTabClick={(e, index) => {
        setActiveTab(index);
        navigate(items[index].link);
      }}
    >
      {items.map((item, i) => (
        <Tab key={i}>{renderTranslatedName(item.label)}</Tab>
      ))}
    </Tabs>
  );

  const renderGallerySection = () => (
    <CardWrapper title={t("galleryHeading")}>
      <a
        href={appData?.galleryDetail?.hyperLink || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="d-block rounded overflow-hidden"
        style={{ transition: "transform 0.3s ease", position: "relative" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <div
          style={{
            width: "100%",
            height: "200px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={
              appData?.galleryDetail?.imageURL ||
              "https://via.placeholder.com/600x400"
            }
            alt={t("galleryImageAlt")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) =>
              (e.currentTarget.src = "https://via.placeholder.com/600x400")
            }
          />

          {/* YouTube-like red play button overlay */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <svg
              width="68"
              height="48"
              viewBox="0 0 68 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Red Rounded Rectangle (YouTube background) */}
              <path
                d="M66.52 7.14C65.75 4.24 63.45 1.9 60.55 1.14C56.45 0 34 0 34 0C34 0 11.45 0 7.33 1.28C4.43 2.05 2.13 4.38 1.36 7.28C0 11.45 0 24 0 24C0 24 0 36.55 1.36 40.72C2.13 43.62 4.43 45.95 7.33 46.72C11.45 48 34 48 34 48C34 48 56.55 48 60.67 46.72C63.57 45.95 65.87 43.62 66.64 40.72C68 36.55 68 24 68 24C68 24 68 11.45 66.52 7.14Z"
                fill="#FF0000"
              />
              {/* White Play Triangle */}
              <path d="M27 14V34L45 24L27 14Z" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </a>

      {appData?.galleryDetail?.description && (
        <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
          {appData.galleryDetail.description}
        </p>
      )}
    </CardWrapper>
  );

  const renderDesktopView = () => (
    <>
      <div className="input-group mb-3" style={{ width: "100%" }}>
        <input
          type="text"
          className="form-control"
          placeholder={t("searchBtn")}
          aria-label={t("searchBtn")}
          aria-describedby="button-search"
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          id="button-search"
        >
          <i className="fa fa-search" />
        </button>
      </div>

      <CardWrapper title={t("moreRelevantSectionsLbl")}>
        <ListGroup variant="flush">
          {items.map((item, index) => {
            const itemUrl = new URL(item.link, window.location.origin);
            const isActive =
              location.pathname === itemUrl.pathname &&
              location.search === itemUrl.search;

            return (
              <ListGroup.Item
                key={index}
                className={`d-flex justify-content-between align-items-center py-2 px-3 border-0 ${
                  isActive ? "active-item" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "#e0e0e0" : "#f9f9f9",
                  fontWeight: isActive ? "600" : "500",
                }}
              >
                <Link
                  to={item.link}
                  className="text-decoration-none d-flex align-items-center w-100"
                  title={item.description}
                >
                  <span>{renderTranslatedName(item.label)}</span>
                  <FaChevronRight
                    className={`ms-auto ${
                      isActive ? "text-dark" : "text-muted"
                    }`}
                  />
                </Link>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </CardWrapper>
      {appData?.galleryDetail && renderGallerySection()}

      {/* <CardWrapper title={t("rootSection.countSection.sectionHeading")} /> */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="g-ytsubscribe w-100"
          data-channelid="UCStLDm82VDFSh_T6IoTeZ1g"
          data-layout="full"
          data-count="default"
        ></div>
      </div>
    </>
  );

  return (
    <div className="ast_toppadder10 ast_bottompadder10">
      {isMobileView ? renderMobileView() : renderDesktopView()}
    </div>
  );
};

export default MoreDetailSideBarCard;
