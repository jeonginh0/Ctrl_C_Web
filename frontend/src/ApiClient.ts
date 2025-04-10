import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',  // 백엔드 서버 URL
  headers: {
    'Content-Type': 'application/json',
  }
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 403) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
