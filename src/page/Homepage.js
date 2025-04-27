import "../stylesheet/all.css";
import "react-datepicker/dist/react-datepicker.css";
import { useRef } from "react";
import axios from "axios";

function Homepage() {
  const chartRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // 選取的檔案
    if (!file) return;
    const formData = new FormData();
    formData.append("video", file); // 將影片檔案加入 FormData 中

    try {
      const response = await axios.post(
        "https://web-and-yolo.onrender.com/api/upload_video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // 必須使用 multipart/form-data
          },
        }
      );
      console.log("上傳成功:", response.data);
    } catch (error) {
      console.error("上傳失敗:", error);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container-fluid">
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
      <div className="container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ width: "800px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="mt-3">
            <div>
              <div>請選擇要上傳的影片</div>
              <div className="mt-5">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                />
              </div>
              <br />
              <video
                style={{
                  marginTop: "200px",
                }}
                id="videoElement"
                preload="none"
                ref={videoRef}
                width="600"
                controls
              >
                <source src="" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
