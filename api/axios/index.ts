import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "https://api.trestechsolutions.com/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("trestech_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        if (typeof window !== "undefined") {
          localStorage.removeItem("trestech_token");
          localStorage.removeItem("trestech_refresh_token");
          localStorage.removeItem("trestech_user");
          document.cookie = "user=; path=/; max-age=0";
        }
        break;

      case 403:
        console.error("Forbidden:", error.response?.data);
        break;

      case 404:
        // 404s are handled by the calling hook — no global log needed
        break;

      case 500:
        console.error("Internal Server Error:", error.response?.data);
        break;

      default:
        break;
    }

    return Promise.reject(error.response?.data ?? error);
  }
);

export default axiosInstance;