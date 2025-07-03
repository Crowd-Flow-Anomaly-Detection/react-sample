import "../stylesheet/all.css";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// 本地資源
import testVideo from "../test-video/output_fixed.mp4";
import testVideo2 from "../test-video/test2.mp4";
import testImg from "../img/img1.png";
import testImg2 from "../img/img2.png";
import testImg3 from "../img/img3.png";
import testVideo3 from "../test-video/test3.mp4";

function Homepage() {
  // UI Stage Enum
  const STAGE = {
    IDLE: "idle", //等待使用者上傳/選擇影片
    PROCESSING: "processing", //後端計算中
    READY: "ready", //已取得結果,可預覽影片
    ERROR: "error", //發生錯誤
  };

  const videoRef = useRef(null);
  const sampleVideos = [testVideo, testVideo2, testVideo3];
  const sampleImgs = [testImg, testImg2, testImg3];

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [stage, setStage] = useState(STAGE.IDLE);
  const [videoUrl, setVideo_url] = useState("");
  const [footfall, setFotfall] = useState(0);
  const [selected, setSelected] = useState(1);
  const [isLocal, setIsLocal] = useState(true);

  // Helpers
  const isIdle = stage === STAGE.IDLE;
  const isProcessing = stage === STAGE.PROCESSING;
  const isReady = stage === STAGE.READY;
  const hasError = stage === STAGE.ERROR;

  // 阻擋瀏覽器預設行為
  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      window.addEventListener(eventName, preventDefaults);
    });

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        window.removeEventListener(eventName, preventDefaults);
      });
    };
  }, []);

  const reset = () => {
    setStage(STAGE.IDLE);
    setVideo_url("");
    setFotfall(0);
    setIsLocal(true);
  };

  const uploadToAPI = async (file) => {
    if (isProcessing) return;
    setStage(STAGE.PROCESSING);
    const formData = new FormData();
    formData.append("video", file); // 將影片檔案加入 FormData 中
    try {
      const { data } = await axios.post(
        "http://127.0.0.1:5000/api/upload_video",
        // "https://flow-python.onrender.com/api/upload_video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // 必須使用 multipart/form-data
          },
        }
      );
      console.log("上傳成功:", data);
      setVideo_url(`http://127.0.0.1:5000${data.download_url}`);
      setFotfall(data.footfall);
      setStage(STAGE.READY);
    } catch (error) {
      console.error("上傳失敗:", error);
      setStage(STAGE.ERROR);
    }
  };

  // ─── Event handlers ────────────────────────────────────────────────────────
  const handleFileInput = async (e) => {
    const file = e.target.files[0]; // 選取的檔案
    if (!file) return;
    setIsLocal(false);
    uploadToAPI(file);
  };

  const hadleDrop = (e) => {
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setIsLocal(false);
    uploadToAPI(file);
  };

  const handleSampleSelect = async (idx) => {
    reset();
    setSelected(idx);
    try {
      const res = await fetch(sampleVideos[idx]);
      const blob = await res.blob();
      const file = new File([blob], `sample-${idx}.mp4`, {
        type: blob.type,
        lastModified: Date.now(),
      });
      uploadToAPI(file);
    } catch (error) {
      console.log(error);
      setStage(STAGE.ERROR);
    }
  };

  const nextSample = () => {
    handleSampleSelect((selected + 1) % sampleVideos.length);
  };
  const prevSample = () => {
    handleSampleSelect(
      (selected - 1 + sampleVideos.length) % sampleVideos.length
    );
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container">
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link " aria-current="page" href="#">
                  關於我們
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="main ">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="mt-3">
            <div>
              <h1>功能介紹：</h1>
              <p className="describe mt-5">
                這個網頁提供一個簡單直覺的功能，使用者只需上傳影片，系統便會自動分析畫面中的人流，計算出影片中的總人數，並提供一支已標註人數的處理後影片供預覽，適合用於人流監控與統計分析應用。
              </p>

              {/* Stage-controlled UI */}

              {isIdle && <UploadZone onDrop={hadleDrop} />}

              {isProcessing && <ProcessingSpinner />}

              {isReady && (
                <VideoPreview
                  ref={videoRef}
                  url={videoUrl}
                  footfall={footfall}
                  onReset={reset}
                />
              )}

              {hasError && <ErrorBox onReset={reset} />}

              {/* File input & sample carousel (顯示於 idle 階段) */}

              {isLocal && (
                <div className="text-center mt-5">
                  <input
                    className="upload-btn mt-4"
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                  />

                  <SampleCarousel
                    images={sampleImgs}
                    selected={selected}
                    disabled={isProcessing}
                    onPrev={prevSample}
                    onNext={nextSample}
                    onSelect={handleSampleSelect}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Components

const UploadZone = ({ onDrop }) => (
  <div className="upload-zone text-center p-5 text-white" onDrop={onDrop}>
    <i className="bi bi-cloud-upload" />
    <p className="mt-3">將你要上傳的影片檔案拖曳到這裡</p>
  </div>
);

const ProcessingSpinner = () => (
  <div className="hint text-center mt-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-4">計算中，請稍候…</p>
  </div>
);

const VideoPreview = React.forwardRef(({ url, footfall, onReset }, ref) => (
  <div className="text-center">
    <video ref={ref} className="return-video" src={url} controls />
    <h3 className="mt-4">
      總共經過 <span className="footfall">{footfall}</span> 人
    </h3>
    <button className="btn btn-primary mt-3" onClick={onReset}>
      重新計算
    </button>
  </div>
));

const ErrorBox = ({ onReset }) => (
  <div className="error bg-light text-center p-5">
    <i className="bi bi-x-lg fs-1" />
    <p className="mt-3">出現錯誤，請再試一次</p>
    <button className="btn btn-danger mt-3" onClick={onReset}>
      重新計算
    </button>
  </div>
);

const SampleCarousel = ({
  images,
  selected,
  disabled,
  onPrev,
  onNext,
  onSelect,
}) => (
  <div className="carousel mt-5 position-relative">
    <p className="text-start fs-4 fw-bold">或使用現有影片：</p>
    <i
      className={`bi bi-chevron-left position-absolute ${
        disabled ? "disabled" : ""
      }`}
      onClick={disabled ? undefined : onPrev}
    />
    <i
      className={`bi bi-chevron-right position-absolute ${
        disabled ? "disabled" : ""
      }`}
      onClick={disabled ? undefined : onNext}
    />
    <ul className="wrapper d-flex justify-content-between mt-5">
      {images.map((img, idx) => (
        <li key={idx}>
          <label
            className="video-option position-relative"
            onClick={disabled ? undefined : () => onSelect(idx)}
          >
            <img
              src={img}
              alt="sample"
              className={`${selected === idx ? "selected" : ""} testImg`}
            />
            <i className="bi bi-play-circle-fill position-absolute top-50 start-50 translate-middle" />
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export default Homepage;
