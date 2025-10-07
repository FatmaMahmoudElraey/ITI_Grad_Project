import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ENDPOINTS } from "../config/constants";
import { loadUser } from "../store/slices/authSlice"; // Import the loadUser action

const GoogleCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Only proceed if hadn't handled this code yet
        const processedCode = sessionStorage.getItem("processedGoogleCode");
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get("code");

        if (!code) {
          setError("No authorization code received from Google");
          setLoading(false);
          return;
        }

        // Prevent duplicate processing
        if (code === processedCode) {
          console.log("Already processed this code, skipping");
          navigate("/");
          return;
        }

        console.log("Exchanging new Google auth code for tokens...");
        sessionStorage.setItem("processedGoogleCode", code);

        // Clear any existing tokens to prevent confusion for my browser
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");

        const response = await axios.post(ENDPOINTS.GOOGLE_AUTH_REDIRECT, {
          code,
        });

        // Server should set HttpOnly cookies during the token exchange. Now load user info.
        try {
          await dispatch(loadUser()).unwrap();
          console.log("Redux auth state updated successfully");
          navigate('/', { replace: true });
        } catch (reduxError) {
          console.error("Failed to update Redux auth state:", reduxError);
          setError('Failed to complete login via Google');
        }
      } catch (error) {
        console.error("Google authentication error:", error);
        setError(`Failed to authenticate with Google: ${error.message}`);
        sessionStorage.removeItem("processedGoogleCode");
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [location.search, dispatch, navigate]); // Only depend on the search params

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="alert alert-danger">
            <p>{error}</p>
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => navigate("/login")}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Processing Google login...</span>
        </div>
        <p className="mt-3">Completing your sign-in, please wait...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
