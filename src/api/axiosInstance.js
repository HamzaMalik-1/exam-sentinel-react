import axios from "axios";
import toast from "react-hot-toast"; // Ensure you have installed: npm install react-hot-toast

// --- 1. Create Axios Instance ---
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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
      // Optional: Force reload or redirect to login
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * --- 4. Main API Wrapper Function ---
 * Handles: 
 * - API Calls
 * - Toast Notifications (Success/Fail) based on 'message'
 * - Navigation on Success
 * * @param {Object} params
 * @param {string} params.method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {string} params.url - Endpoint URL
 * @param {Object} [params.data] - Payload for POST/PUT
 * @param {Object} [params.params] - Query params for GET
 * @param {boolean} [params.isToast=true] - Show toast on success/error?
 * @param {Function} [params.navigate] - The navigate function from useNavigate()
 * @param {string} [params.successPath] - Path to redirect to on success
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
    // Make the request
    const response = await axiosInstance({
      method,
      url,
      data,
      params,
    });

    const resData = response.data; // Expected: { status, success, message, ...data }

    // --- HANDLE SUCCESS ---
    if (resData.success) {
      // 1. Show Success Toast
      if (isToast && resData.message) {
        toast.success(resData.message);
      }

      // 2. Navigate if provided
      if (navigate && successPath) {
        navigate(successPath);
      }

      return resData;
    } 
    
    // --- HANDLE LOGICAL FAILURE (success: false) ---
    else {
      if (isToast && resData.message) {
        toast.error(resData.message);
      }
      return null; // Or throw error depending on preference
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