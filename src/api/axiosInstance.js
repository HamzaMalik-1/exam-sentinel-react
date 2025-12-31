import axios from "axios";
import toast from "react-hot-toast";

// --- 1. Create Axios Instance ---
const axiosInstance = axios.create({
  // FIX: Use import.meta.env for Vite. 
  // Make sure your .env variable is named VITE_API_URL
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
  (error) => {
    return Promise.reject(error);
  }
);

// --- 3. Response Interceptor (Global Error Handling) ---
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Auto Logout)
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      // Optional: Force reload to clear state
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * --- 4. Main API Wrapper Function ---
 * Handles API Calls, Toast Notifications, and Navigation
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

    const resData = response.data; // Expected: { success, message, data }

    // --- HANDLE SUCCESS ---
    if (resData.success) {
      if (isToast && resData.message) {
        toast.success(resData.message);
      }

      if (navigate && successPath) {
        navigate(successPath);
      }

      return resData;
    } 
    
    // --- HANDLE LOGICAL FAILURE ---
    else {
      if (isToast && resData.message) {
        toast.error(resData.message);
      }
      return null; 
    }

  } catch (error) {
    // --- HANDLE NETWORK/SERVER ERRORS ---
    const errorMsg = error.response?.data?.message || "Something went wrong";
    
    if (isToast) {
      toast.error(errorMsg);
    }
    
    console.error("API Error:", error);
    throw error;
  }
};

export default axiosInstance;