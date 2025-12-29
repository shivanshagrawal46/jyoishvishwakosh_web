import React from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/PageHeader";
import { PANCHANG_TYPES } from "../../constants/layout-constant";
import { useParams } from "react-router-dom";
import DainikPanchangCard from "./components/DainikPanchangCard";
import DainikMuhuratCard from "./components/DainikMuhuratCard";
import MoreDetailSideBarCard from "./components/MoreDetailSideBarCard";
import useDeviceType, { DEVICE_TYPES } from "../../hooks/useDeviceType";
import RashiFalCard from "./components/RashiFalCard";
import SadeSatiCard from "./components/SadeSatiCard";
import AuspiciousMuhurat from "./components/AuspiciousMuhurat";
import { WrapLastWords } from "../../components/SharedComponents/WrapLastWords";
const componentMap = {
  "dainik-panchang": DainikPanchangCard,
  "muhurat-panchang": DainikMuhuratCard,
  horoscope: RashiFalCard,
  sadeSati: SadeSatiCard,
  auspiciousMuhurat: AuspiciousMuhurat,
};
const PanchangPage = () => {
  const { t } = useTranslation();
  const { panchangType } = useParams();
  const isMobileView = useDeviceType([DEVICE_TYPES.MOBILE]);

  const type = panchangType.split("-")[0] ?? "";

  const isValidType = Object.keys(PANCHANG_TYPES).includes(panchangType);
  const Component = componentMap[panchangType] ?? null;
  if (!panchangType) {
    return null;
  }

  return (
    <>
      <PageHeader
        title={t("navPanchang")}
        breadcrumb={
          isValidType
            ? {
                "/": t("navHome"),
                "#": t("navPanchang"),
                [`/services/panchang/${panchangType}`]: t(
                  PANCHANG_TYPES[panchangType]
                ),
              }
            : {}
        }
      />

      <div className="ast_wedo_wrapper ast_toppadder10 ast_bottompadder30 siddhanta-text">
        <div className="container">
          <div className="row d-flex justify-content-center">
            {!panchangType || !isValidType ? (
              <>
                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="ast_heading">
                    <h4>
                      <WrapLastWords
                        content={t(PANCHANG_TYPES[panchangType])}
                      />
                    </h4>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="ast_heading m-1">
                    {/* <h4>
                      <WrapLastWords
                        content={t(PANCHANG_TYPES[panchangType])}
                      />
                    </h4> */}
                    <p style={{ fontWeight: "600" }}>
                      {t(`panchang.${type}.heading1`)}
                    </p>
                    <p>{t(`panchang.${type}.heading2`)}</p>
                  </div>
                </div>
                {isMobileView ? (
                  <>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-12">
                      <MoreDetailSideBarCard />
                    </div>
                    <div className="col-lg-9 col-md-9 col-sm-12 col-12 ">
                      <Component />
                      {/* {panchangType === "dainik-panchang" ? (
                        <DainikPanchangCard />
                      ) : (
                        <DainikMuhuratCard />
                      )} */}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-lg-9 col-md-9 col-sm-12 col-12 ast_toppadder10">
                      <Component />

                      {/* {panchangType === "dainik-panchang" ? (
                        <DainikPanchangCard />
                      ) : (
                        <DainikMuhuratCard />
                      )} */}
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-12">
                      <MoreDetailSideBarCard />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanchangPage;
