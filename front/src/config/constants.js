export const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;
export const FRONTEND_URL = `${import.meta.env.VITE_APP_FRONTEND_URL}`;
export const GOOGLE_OAUTH2_CLIENT_ID =
  "849946536066-ooju2jjmk75vcoksb7hipif8bimog9kk.apps.googleusercontent.com";

export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/jwt/create/`,
  REGISTER: `${BASE_URL}/api/auth/users/`,
  // Add other endpoints here
  GOOGLE_AUTH_REDIRECT: `${BASE_URL}/api/auth/login/google/`,
  // ...existing endpoints
};
