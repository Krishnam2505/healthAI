import axios from 'axios';

// 1. Create a custom Axios instance
// We set the base URL to '/api'. Thanks to our Vite Proxy from Chunk 6.1, 
// any request to '/api' will automatically be forwarded to our backend!
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// 2. Request Interceptor (The outbound security guard)
api.interceptors.request.use(
  (config) => {
    // Before the request leaves the frontend, check if the user has a JWT token saved in their browser's Local Storage
    const token = localStorage.getItem('token');
    
    // If they have a token, secretly attach it to the "Authorization" header of the request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Let the modified request continue on its journey to the backend
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (The inbound security guard)
api.interceptors.response.use(
  (response) => {
    // If the backend says everything was successful (200 OK), just return the data normally
    return response;
  },
  (error) => {
    // If the backend throws an error, check if it's a 401 Unauthorized error.
    // This usually means their JWT token expired, or they tried to access a protected page without logging in.
    if (error.response && error.response.status === 401) {
      // Clear their invalid token and user data from the browser
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Kick them back to the login page immediately
      window.location.href = '/login';
    }
    
    // Even if we caught the 401, we still throw the error so the specific page that made the request knows it failed
    return Promise.reject(error);
  }
);

export default api;
