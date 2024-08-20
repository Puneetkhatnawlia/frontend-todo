import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { useRef } from "react";
import axios from "axios";
import "./login.css";
const Auth = () => {
  const [isSignInForm, setSignInForm] = useState(true);
  const navigate = useNavigate();

  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();

  const toogleSignInForm = () => {
    setSignInForm(!isSignInForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = nameRef.current ? nameRef.current.value : "";
    try {
      if (isSignInForm) {
        const response = await axios.post(
          "https://backend-todo-beryl.vercel.app/api/auth/login",
          {
            email,
            password,
          }
        );
        localStorage.setItem("token", response.data.token);
        navigate("/todos");
      } else {
        // Sign Up
        await axios.post(
          "https://backend-todo-beryl.vercel.app/api/auth/register",
          {
            email,
            username: name,
            password,
          }
        );
        Swal.fire({
          title: "Success",
          text: "You have been registered successfully",
          icon: "success",
        }).then(() => {
          setSignInForm(!isSignInForm);
        });
        setSignInForm(!isSignInForm);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          Swal.fire({
            title: "Error",
            text: "Invalid email or password",
            icon: "error",
          });
        } else if (error.response.status === 400) {
          Swal.fire({
            title: "Error",
            text: "error",
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "An unexpected error occurred. Please try again later.",
            icon: "error",
          });
        }
      } else if (error.request) {
        Swal.fire({
          title: "Error",
          text: "No response received from the server. Please check your connection.",
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "An error occurred while setting up the request.",
          icon: "error",
        });
      }
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
                />
              </div>
              <button type="submit" className="submit-button">
                {isSignInForm ? "Sign In" : "Sign Up"}
              </button>
              <p className="toggle-link" onClick={toogleSignInForm}>
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
