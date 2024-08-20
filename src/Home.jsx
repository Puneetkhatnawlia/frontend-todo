import { useNavigate } from "react-router-dom";
import "./home.css"
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1>Welcome to Todo App</h1>
      <div>
        <button onClick={() => navigate("/auth")}>Login/Signup</button>
      </div>
    </div>
  );
};
export default Home
