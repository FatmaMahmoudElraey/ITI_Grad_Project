export const BASE_URL = "http://localhost:8000";
export const FRONTEND_URL = "http://localhost:5173";
export const GOOGLE_OAUTH2_CLIENT_ID =
  "849946536066-ooju2jjmk75vcoksb7hipif8bimog9kk.apps.googleusercontent.com";

export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/jwt/create/`,
  REGISTER: `${BASE_URL}/api/auth/users/`,
  // Add other endpoints here
  GOOGLE_AUTH_REDIRECT: `${BASE_URL}/api/auth/login/google/`,
  // ...existing endpoints
};
