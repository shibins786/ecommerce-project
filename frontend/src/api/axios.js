import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // No response or config → reject safely
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response.status === 401;
    const alreadyRetried = originalRequest._retry;

    // ==============================
    // TOKEN REFRESH LOGIC
    // ==============================
    if (isUnauthorized && !alreadyRetried) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post(
          "http://127.0.0.1:8000/api/users/refresh/",
          { refresh }
        );

        const newAccess = res.data?.access;

        if (!newAccess) {
          throw new Error("Invalid refresh response");
        }

        // update storage
        localStorage.setItem("access", newAccess);

        // update axios default header
        API.defaults.headers.common["Authorization"] =
          `Bearer ${newAccess}`;

        // update retry request
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccess}`,
        };

        return API(originalRequest);
      } catch (err) {
        // ==============================
        // CLEAN LOGOUT
        // ==============================
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;