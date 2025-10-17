import axios from "axios";

const apiBaseUrl = (() => {
  // Em desenvolvimento, usar localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3001/api";
  }
  
  // Em produção, usar a variável de ambiente ou fallback para Railway
  return `${import.meta.env.VITE_API_URL || "https://synctask-production.up.railway.app"}/api`;
})();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
