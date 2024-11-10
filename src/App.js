import { Route, Routes } from "react-router-dom";
import Homepage from "./page/Homepage";
import Test from "./page/Test";
// import { Router } from "react-router-dom";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}></Route>
        <Route path="test" element={<Test></Test>}></Route>
      </Routes>
    </>
  );
}

export default App;
