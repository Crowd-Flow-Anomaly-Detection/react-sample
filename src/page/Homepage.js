import '../stylesheet/all.css'
import data from '../store/footfall_data.json'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Chart } from 'chart.js/auto';
import { useRef } from 'react';
// import A from '../assets/offline-video_9ff1a430b8d1fb095a75666ce8bc22e0.mp4'
import axios from 'axios';

function Homepage() {

    const [startDate, setStartDate] = useState(new Date(2021, 10, 17));
    const [filterData, setFilterData] = useState([])
    const [date, setDate] = useState('2021-11-17')
    const chartRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState('');
    const [file, setFile] = useState(null);
    const [downloadURL, setDownloadURL] = useState(null);


    const handleDateChange = (e) => {
        setStartDate(moment(e).format('YYYY-MM-DD'));
        const momentTime = moment(e).format('YYYY-MM-DD');
        setDate(momentTime);

    }
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await axios.get(`http://127.0.0.1:5000/api/footfall/${date}`);
    //             setFilterData(response.data.footfall);

    //         } catch (error) {
    //             alert('目前有錯誤發生 可能是你所選取的日期沒有資料或是其他原因');
    //             console.log(error);
    //         }
    //     }
    //     const fetchData2 = async () => {
    //         try {
    //             const response = await axios.get(`http://127.0.0.1:5000/api/footfall`);
    //             console.log(response);
    //             setFilterData(response.data.footfall);
    //             console.log(response.data.data['/api/assets/offline-video_9ff1a430b8d1fb095a75666ce8bc22e0.mp4']);
    //             setVideoSrc('/api/assets/offline-video_9ff1a430b8d1fb095a75666ce8bc22e0.mp4')

    //         } catch (error) {
    //             alert('目前有錯誤發生 可能是你所選取的日期沒有資料或是其他原因');
    //             console.log(error);
    //         }
    //     }
    //     fetchData();
    //     fetchData2();
    // }, [date])

    // useEffect(() => {

    //     const chartInstance = new Chart(chartRef.current, {
    //         type: 'line',
    //         data: {
    //             labels: filterData?.map((row, i) => i),
    //             datasets: [
    //                 {
    //                     label: '每小時人數',
    //                     data: filterData?.map(row => row),
    //                 },
    //             ],
    //         },
    //     });

    //     return () => {
    //         chartInstance.destroy(); // 清理以避免內存洩漏
    //     };
    // }, [filterData]);

    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);


    // 當用戶選擇檔案時觸發

    // useEffect(() => {
    //     const flie = document.getElementById('fileInput');
    //     flie.addEventListener('change', (e) => {
    //         const file = e.target.files[0];// 選擇檔案後 存在瀏覽器記憶體
    //         setFile(file);
    //         const formData = new FormData();
    //         formData.append('video', file, file.name);
    //     });
    // }, [])

    // const downloadVideo = () => {
    //     const link = document.createElement('a');
    //     link.href = downloadURL;
    //     link.download = file.name;
    //     link.click();
    // }

    // const video = document.getElementById('videoElement');

    // if (file) {
    //     //  使用 URL.createObjectURL 來生成臨時 URL，並將其用於影片預覽 
    //     const uploadURL = URL.createObjectURL(file);  // 創建檔案的 URL
    //     video.src = uploadURL;  // 設定為 video 元素的來源

    //     setDownloadURL(uploadURL);

    // }
    const handleFileUpload = async (event) => {
        const file = event.target.files[0]; // 選取的檔案
        console.log(file);

        if (!file) return;

        const formData = new FormData();
        formData.append("video", file); // 將影片檔案加入 FormData 中

        try {
            const response = await axios.post("http://localhost/api/test.php", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // 必須使用 multipart/form-data
                },
            });
            console.log("上傳成功:", response.data);
        } catch (error) {
            console.error("上傳失敗:", error);
        }
    };




    return (
        <div >
            <nav className="navbar navbar-expand-lg bg-primary">
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link " aria-current="page" href="#">關於我們</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {/* <DatePicker selected={startDate} onChange={(e) => handleDateChange(e)} /> */}
                    <div style={{ width: "800px" }}>
                        <canvas
                            ref={chartRef}
                        >
                        </canvas>
                    </div>
                    <div className="mt-3">
                        <div>
                            <div>請選擇要上傳的影片</div>
                            <div className='mt-5'>
                                <input type="file" accept="video/*" onChange={handleFileUpload} />
                            </div>
                            {/* <button type='button'
                                onClick={downloadVideo}
                            >下載請按我</button> */}
                            <br />
                            <video
                                style={{
                                    marginTop: '200px'
                                }}
                                id='videoElement'
                                preload="none" ref={videoRef} width="600" controls>
                                <source src='' type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                    {/* <div style={{ textAlign: 'center' }}>
                        <div style={{
                            border: 'solid', height: '200px', backgroundColor: 'lightgray',
                            margin: '0 ',
                            width: '500px',
                            textAlign: 'center'
                        }} >
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia qui porro quos voluptates, modi, deserunt dignissimos itaque alias doloremque dicta ab? Consectetur incidunt modi ipsa magni, pariatur fugit rerum expedita?
                        </div>
                    </div> */}
                </div>
            </div>

        </div>

    )
}

export default Homepage