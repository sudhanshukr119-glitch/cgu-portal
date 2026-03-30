import "./index.css";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  return (
    <div>
      {page === "login" && <Login setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </div>
  );
}

export default App;
