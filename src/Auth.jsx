import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

const Auth = () => {
  const [isSignInForm, setSignInForm] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/todos");
    }
  }, [navigate]);

  const toggleSignInForm = () => {
    setSignInForm(!isSignInForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = nameRef.current ? nameRef.current.value : "";

    try {
      if (isSignInForm) {
        // Sign In
        const response = await axios.post(
          "https://backend-todo-beryl.vercel.app/api/auth/login",
          { email, password }
        );
        localStorage.setItem("token", response.data.token);
        navigate("/todos");
      } else {
        // Sign Up
        await axios.post(
          "https://backend-todo-beryl.vercel.app/api/auth/register",
          { email, username: name, password }
        );
        setSignInForm(true);
        setError("You have been registered successfully");
      }
    } catch (error) {
      let errorMessage =
        "An unexpected error occurred. Please try again later.";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Bad request. Please check your input.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage =
          "No response received from the server. Please check your connection.";
      }

      setError(errorMessage);
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className="absolute-container">
          <div className="card">
            <h2 className="header-text">
              {isSignInForm ? "Sign In" : "Sign Up"}
            </h2>
            <form onSubmit={handleSubmit}>
              {!isSignInForm && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">
                    Full Name
                  </label>
                  <input
                    type="text"
                    ref={nameRef}
                    placeholder="Full Name"
                    className="input-field"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email address
                </label>
                <input
                  type="email"
                  ref={emailRef}
                  placeholder="Email or phone number"
                  required
                  name="email"
                  className="input-field"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  ref={passwordRef}
                  placeholder="Password"
                  className="input-field"
                  required
                />
                {error && <p className="error-text">{error}</p>}
              </div>
              <button type="submit" className="submit-button">
                {isSignInForm ? "Sign In" : "Sign Up"}
              </button>
              <p className="toggle-link" onClick={toggleSignInForm}>
                {isSignInForm
                  ? "New to todolist? Sign Up Now"
                  : "Already registered? Sign In Now"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
