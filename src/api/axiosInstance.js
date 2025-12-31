import axios from "axios";
import toast from "react-hot-toast";

// --- 1. Create Axios Instance ---
const axiosInstance = axios.create({
  // Vite uses import.meta.env. Ensure your .env has VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 2. Request Interceptor (Attach Token) ---
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 3. Response Interceptor (Global Error Handling) ---
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Token expired or invalid)
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Prevent infinite redirect if already on login
      if (currentPath !== "/login" && currentPath !== "/") {
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

/**
 * --- 4. Main API Wrapper Function ---
 * A clean wrapper to handle requests, toasts, and navigation.
 */
export const apiCall = async ({
  method = "GET",
  url,
  data = null,
  params = null,
  isToast = true,
  navigate = null,
  successPath = null,
}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      params,
    });

    const resData = response.data; // Expected: { success: true, message: "...", data: {...} }

    // --- HANDLE SUCCESS ---
    // Note: We check for resData.success OR fallback to standard 200 status
    if (resData.success) {
      if (isToast && resData.message) {
        toast.success(resData.message);
      }

      if (navigate && successPath) {
        navigate(successPath);
      }
      return resData;
    } 
    
    // --- HANDLE API-LEVEL LOGICAL ERRORS ---
    // (When status is 200 but backend returns success: false)
    else {
      if (isToast && resData.message) {
        toast.error(resData.message);
      }
      return resData; // Return the full data so the component can handle it
    }

  } catch (error) {
    // --- HANDLE NETWORK/SERVER ERRORS (Non-200 status codes) ---
    const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
    
    // We don't want to double-toast 401 errors since the interceptor might handle it
    if (isToast && error.response?.status !== 401) {
      toast.error(errorMsg);
    }
    
    console.error(`API Error [${method} ${url}]:`, error);
    // Rethrow so the calling component can use .catch() or try-catch
    throw error;
  }
};

export default axiosInstance;