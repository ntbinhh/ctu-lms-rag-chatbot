// Global Error Handler & API Client
import axios from 'axios';
import { toast } from 'react-toastify';

class APIClient {
  constructor(baseURL = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Handle successful responses
        if (response.data?.success && response.data?.message) {
          // Only show success toast for mutations, not queries
          if (['POST', 'PUT', 'DELETE'].includes(response.config.method?.toUpperCase())) {
            toast.success(response.data.message);
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token refresh)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('token', response.data.access_token);
              localStorage.setItem('refreshToken', response.data.refresh_token);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.handleAuthFailure();
          }
        }

        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  async refreshToken(refreshToken) {
    return this.client.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
  }

  handleAuthFailure() {
    localStorage.clear();
    window.location.href = '/login';
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  handleError(error) {
    const response = error.response;
    
    if (!response) {
      toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
      return;
    }

    const { status, data } = response;
    
    // Handle different error types
    switch (status) {
      case 400:
        toast.error(data.message || 'Dữ liệu không hợp lệ');
        break;
      case 401:
        toast.error('Không có quyền truy cập');
        break;
      case 403:
        toast.error('Bạn không có quyền thực hiện thao tác này');
        break;
      case 404:
        toast.error('Không tìm thấy tài nguyên');
        break;
      case 422:
        // Handle validation errors
        if (data.errors) {
          Object.values(data.errors).forEach(error => {
            toast.error(Array.isArray(error) ? error[0] : error);
          });
        } else {
          toast.error(data.message || 'Dữ liệu không hợp lệ');
        }
        break;
      case 500:
        toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
        break;
      default:
        toast.error(data.message || 'Đã xảy ra lỗi không xác định');
    }

    // Log error for debugging
    console.error('API Error:', {
      status,
      message: data.message,
      errors: data.errors,
      url: error.config?.url,
      method: error.config?.method,
    });
  }

  // API methods
  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data = {}, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url, data = {}, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  async upload(url, formData, onProgress = null) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      };
    }

    const response = await this.client.post(url, formData, config);
    return response.data;
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;
