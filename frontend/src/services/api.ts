import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // A URL base do nosso backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;