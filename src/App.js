import { Route, Routes } from "react-router-dom";
import Homepage from "./page/Homepage";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}></Route>
      </Routes>
    </>
  );
}

export default App;
