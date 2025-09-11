import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // A URL base do nosso backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;