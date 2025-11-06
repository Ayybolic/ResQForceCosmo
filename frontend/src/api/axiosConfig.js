// src/api/axiosConfig.js
import axios from 'axios';

// The base URL of your Flask API server
const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for sending cookies (sessions)
});

export default apiClient;