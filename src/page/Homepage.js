import "../stylesheet/all.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

// 本地資源
import testVideo from "../test-video/output_fixed.mp4";
import testVideo2 from "../test-video/offline-video_9ff1a430b8d1fb095a75666ce8bc22e0_20250504_221149.mp4";
import testImg from "../img/截圖 2025-06-14 上午1.26.28.png";
import catVideo from "../test-video/貓貓搖搖.mp4";

function Homepage() {
  


  const videoRef = useRef(null);
  const [video_url, setVideo_url] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [getVideo, setGetVideo] = useState(false);
  const [footfall, setFotfall] = useState(0);
  const videoArr = [testVideo, testVideo2, catVideo];
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setGetVideo(false);
    console.log(file);
    const formData = new FormData();
    formData.append("video", file); // 將影片檔案加入 FormData 中
    setUploaded(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/upload_video",
        // "https://flow-python.onrender.com/api/upload_video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // 必須使用 multipart/form-data
          },
        }
      );
      console.log("上傳成功:", response);
      setVideo_url(`http://127.0.0.1:5000${response.data.download_url}`);
      setFotfall(response.data.footfall);
      console.log(
        `https://flow-python.onrender.com${response.data.download_url}`
      );
      setGetVideo(true);
    } catch (error) {
      setGetVideo(true);
      setError(true);
      console.error("上傳失敗:", error);
      // reset();
    }
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // 選取的檔案
    if (!file) return;
    upload(file);
  };

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
  const hadleDrag = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    upload(file);
  };

  const handleClick = (i) => {
    setGetVideo(true);
    setSelected(i);
    setVideo_url(videoArr[i]);
  };

  const nextVideo = () => {
    if (selected < 2) {
      setSelected((prev) => {
        handleClick(prev + 1);
        return prev + 1;
      });
    } else {
      setSelected(0);
      handleClick(0);
    }
  };
  const lastVideo = () => {
    if (selected > 0) {
      setSelected((prev) => {
        handleClick(prev - 1);
        return prev - 1;
      });
    } else {
      setSelected(2);
      handleClick(2);
    }
  };
  const reset = () => {
    setGetVideo(false);
    setUploaded(false);
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
              <div className="mt-5 text-center">
                {!getVideo ? (
                  <div
                    className="upload-zone  text-center p-5 text-white"
                    onDrop={hadleDrag}
                  >
                    {!uploaded ? (
                      <div className="hint">
                        <i className="bi bi-cloud-upload "></i>
                        <p>將你要上傳的影片檔案拖曳到這裡</p>
                      </div>
                    ) : (
                      <div className="hint">
                        <div className="spinner-border mt-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-5">計算中 請稍候</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!error ? (
                      <video
                        ref={videoRef}
                        className="return-video"
                        src={video_url}
                        controls
                      ></video>
                    ) : (
                      <div className="error bg-light">
                        <i className="bi bi-x-lg"></i>
                        <p>出現錯誤 請再試一次</p>
                        <button
                          className="reset mt-3 btn btn-danger"
                          onClick={reset}
                        >
                          重新計算
                        </button>
                      </div>
                    )}

                    {uploaded && !error ? (
                      <div>
                        <h3 className="mt-5 ">
                          總共經過<span className="footfall">{footfall}</span>人
                        </h3>
                        <button
                          className="reset mt-3 btn btn-primary"
                          onClick={reset}
                        >
                          重新計算
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>

              {!uploaded ? (
                <>
                  <div className="text-center">
                    <input
                      className="upload-btn mt-5 "
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div className="carousel ">
                    <h3 className="mt-5">或使用現有影片：</h3>
                    <ul className="wrapper d-flex justify-content-between mt-5 position-relative">
                      <i
                        className="bi bi-chevron-left position-absolute"
                        onClick={lastVideo}
                      ></i>
                      <i
                        className="bi bi-chevron-right position-absolute"
                        onClick={nextVideo}
                      ></i>
                      {videoArr.map((_, i) => {
                        return (
                          <li key={i}>
                            <label
                              htmlFor={`video-${i}`}
                              className="video-option position-relative"
                              onClick={() => handleClick(i)}
                            >
                              <img
                                src={testImg}
                                alt=""
                                className={selected === i ? "selected" : ""}
                              />
                              <i className="position-absolute bi bi-play-circle-fill top-50 start-50 translate-middle"></i>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Homepage;
