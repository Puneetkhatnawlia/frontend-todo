import { initializeIcons } from "@fluentui/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./Home";
import Auth from "./Auth";
import Todos from "./Todos";
import "./App.css";
initializeIcons();

const App = () => {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/todos"
          element={
            <ProtectedRoute>
              <Todos />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return children;
};
export default App;
