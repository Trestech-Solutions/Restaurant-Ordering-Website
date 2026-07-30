import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { store } from "../../redux/store";
import { logout } from "../../redux/slices/auth";

const BASE_URL = "https://api.trestechsolutions.com/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("trestech_token"); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        store.dispatch(logout());
        break;

      case 403:
        console.error("Forbidden:", error.response?.data);
        break;

      case 404:
        console.error("Not Found:", error.response?.data);
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