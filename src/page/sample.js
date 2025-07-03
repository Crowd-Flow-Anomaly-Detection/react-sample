import "../stylesheet/all.css";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// ─── Local Assets ───────────────────────────────────────────────────────────
import testVideo from "../test-video/output_fixed.mp4";
import testVideo2 from "../test-video/test2.mp4";
import testVideo3 from "../test-video/test3.mp4";
import testImg from "../img/截圖 2025-06-14 上午1.26.28.png";

// ─── UI Stage Enum ──────────────────────────────────────────────────────────
const STAGE = {
  IDLE: "idle", // 等待使用者上傳／選擇影片
  PROCESSING: "processing", // 後端計算中
  READY: "ready", // 已取得結果，可預覽影片
  ERROR: "error", // 發生錯誤
};

export default function Homepage() {
  const videoRef = useRef(null);
  const sampleVideos = [testVideo, testVideo2, testVideo3];

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [stage, setStage] = useState(STAGE.IDLE);
  const [videoUrl, setVideoUrl] = useState("");
  const [footfall, setFootfall] = useState(0);
  const [selected, setSelected] = useState(0); // index of sample video
  const [isLocal, setIsLocal] = useState(true); // true ⇢ 使用者自己上傳

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const isIdle = stage === STAGE.IDLE;
  const isProcessing = stage === STAGE.PROCESSING;
  const isReady = stage === STAGE.READY;
  const hasError = stage === STAGE.ERROR;

  // ─── Global drag‑and‑drop prevent default ────────────────────────────────
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) =>
      window.addEventListener(ev, prevent)
    );
    return () =>
      ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) =>
        window.removeEventListener(ev, prevent)
      );
  }, []);

  // ─── Core Actions ─────────────────────────────────────────────────────────
  const reset = () => {
    setStage(STAGE.IDLE);
    setVideoUrl("");
    setFootfall(0);
    setIsLocal(true);
  };

  const uploadToAPI = async (file) => {
    if (isProcessing) return; // 避免重複請求

    setStage(STAGE.PROCESSING);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:5000/api/upload_video",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setVideoUrl(`http://127.0.0.1:5000${data.download_url}`);
      setFootfall(data.footfall);
      setStage(STAGE.READY);
    } catch (err) {
      console.error("Upload failed:", err);
      setStage(STAGE.ERROR);
    }
  };

  // ─── Event Handlers ───────────────────────────────────────────────────────
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLocal(false);
    uploadToAPI(file);
  };

  const handleDrop = (e) => {
    const file = e.dataTransfer.files?.[0];
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
    } catch (err) {
      console.error(err);
      setStage(STAGE.ERROR);
    }
  };

  const nextSample = () =>
    handleSampleSelect((selected + 1) % sampleVideos.length);
  const prevSample = () =>
    handleSampleSelect((selected - 1 + sampleVideos.length) % sampleVideos.length);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="#">人流偵測</a>
        </div>
      </nav>

      <main className="main container d-flex flex-column align-items-center">
        {/* Intro */}
        <section className="mt-5 text-center w-100" style={{ maxWidth: 700 }}>
          <h1>功能介紹</h1>
          <p className="describe mt-4">
            只要上傳影片，系統會自動分析畫面中的人流，計算總人數並提供已標註人數的影片供預覽。
          </p>
        </section>

        {/* Stage‑controlled UI */}
        {isIdle && (
          <UploadZone onDrop={handleDrop} />
        )}

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
        {isIdle && (
          <>
            <input
              className="upload-btn mt-4"
              type="file"
              accept="video/*"
              onChange={handleFileInput}
            />

            <SampleCarousel
              images={sampleVideos.map(() => testImg)}
              selected={selected}
              disabled={isProcessing}
              onPrev={prevSample}
              onNext={nextSample}
              onSelect={handleSampleSelect}
            />
          </>
        )}
      </main>
    </div>
  );
}

// ─── Reusable Components ────────────────────────────────────────────────────
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

const SampleCarousel = ({ images, selected, disabled, onPrev, onNext, onSelect }) => (
  <div className="carousel mt-5 position-relative">
    <i
      className={`bi bi-chevron-left position-absolute ${disabled ? "stop" : ""}`}
      onClick={disabled ? undefined : onPrev}
    />
    <i
      className={`bi bi-chevron-right position-absolute ${disabled ? "stop" : ""}`}
      onClick={disabled ? undefined : onNext}
    />
    <ul className="wrapper d-flex justify-content-between mt-5">
      {images.map((img, idx) => (
        <li key={idx}>
          <label className="video-option position-relative" onClick={() => onSelect(idx)}>
            <img src={img} alt="sample" className={selected === idx ? "selected" : ""} />
            <i className="bi bi-play-circle-fill position-absolute top-50 start-50 translate-middle" />
          </label>
        </li>
      ))}
    </ul>
  </div>
);
