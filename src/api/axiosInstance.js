import axios from "axios";
import toast from "react-hot-toast";

// --- 1. Create Axios Instance ---
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 2. Request Interceptor (Attach Token) ---
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ FIX: Change "token" to "themedarktoken" to match your storage
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
      
      // Prevent infinite redirect if already on login page
      // ✅ Adjust "/" if your login route is "/login"
      if (currentPath !== "/" && currentPath !== "/login") {
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        window.location.href = "/"; 
      }
    }
    return Promise.reject(error);
  }
);

/**
 * --- 4. Main API Wrapper Function ---
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

    const resData = response.data;

    if (resData.success) {
      if (isToast && resData.message) {
        toast.success(resData.message);
      }

      if (navigate && successPath) {
        navigate(successPath);
      }
      return resData;
    } 
    else {
      if (isToast && resData.message) {
        toast.error(resData.message);
      }
      return resData; 
    }

  } catch (error) {
    const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
    
    if (isToast && error.response?.status !== 401) {
      toast.error(errorMsg);
    }
    
    throw error;
  }
};

export default axiosInstance;