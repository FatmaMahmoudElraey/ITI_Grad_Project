import React from "react";
import GoogleButton from "react-google-button";
import {
  GOOGLE_OAUTH2_CLIENT_ID,
  ENDPOINTS,
  FRONTEND_URL,
} from "../config/constants";

const GoogleLoginButton = () => {
  const onGoogleLoginSuccess = () => {
    const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    const REDIRECT_URI = "api/auth/login/google/";

    const scope = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const params = {
      response_type: "code",
      client_id: GOOGLE_OAUTH2_CLIENT_ID,
      redirect_uri: `${FRONTEND_URL}/google-callback`,
      prompt: "select_account",
      access_type: "offline",
      scope,
    };

    const urlParams = new URLSearchParams(params).toString();
    window.location = `${GOOGLE_AUTH_URL}?${urlParams}`;
  };

  return (
    <GoogleButton onClick={onGoogleLoginSuccess} label="Sign in with Google" />
  );
};

export default GoogleLoginButton;
