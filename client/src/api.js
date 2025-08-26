import axios from 'axios';

// Define the base URL for your backend
const API_URL = 'http://localhost:5001';

// Create an instance of axios with a custom configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is the crucial line!
});

export default api;