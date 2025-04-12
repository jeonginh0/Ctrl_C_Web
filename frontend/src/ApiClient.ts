import axios from 'axios';

const baseURL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: baseURL,  // 백엔드 URL을 명시적으로 지정
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
