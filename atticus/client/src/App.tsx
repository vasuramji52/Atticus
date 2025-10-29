import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Prompt from "./pages/Prompt";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
  );
}

export default App;
