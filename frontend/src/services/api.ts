import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username: string, password: string) => {
    const response = await api.post('/api/auth/register', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  login: async (username: string, password: string) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  validateToken: async () => {
    return await api.get('/api/auth/validate');
  },
};

// PDF API
export const pdfAPI = {
  merge: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return await api.post('/api/pdf/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  split: async (file: File, pageCount: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageCount', pageCount.toString());
    return await api.post('/api/pdf/split', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  compress: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/pdf/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  protect: async (file: File, password: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return await api.post('/api/pdf/protect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addPageNumbers: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/pdf/add-page-numbers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  toJpg: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/pdf/to-jpg', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  toPng: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/pdf/to-png', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  fromImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return await api.post('/api/pdf/from-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  fromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/pdf/from-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Image API
export const imageAPI = {
  resize: async (file: File, width: number, height: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    return await api.post('/api/image/resize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  crop: async (file: File, x: number, y: number, width: number, height: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('x', x.toString());
    formData.append('y', y.toString());
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    return await api.post('/api/image/crop', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  rotate: async (file: File, angle: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle.toString());
    return await api.post('/api/image/rotate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  convert: async (file: File, format: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    return await api.post('/api/image/convert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  compress: async (file: File, quality: number = 0.8) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality.toString());
    return await api.post('/api/image/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Video API
export const videoAPI = {
  addText: async (video: File, text: string, position: string = 'bottom-left', fontSize: number = 24, color: string = 'white') => {
    const formData = new FormData();
    formData.append('video', video);
    formData.append('text', text);
    formData.append('position', position);
    formData.append('fontSize', fontSize.toString());
    formData.append('color', color);
    return await api.post('/api/video/add-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addImage: async (video: File, image: File, position: string = 'top-left') => {
    const formData = new FormData();
    formData.append('video', video);
    formData.append('image', image);
    formData.append('position', position);
    return await api.post('/api/video/add-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changeSpeed: async (video: File, speed: number) => {
    const formData = new FormData();
    formData.append('video', video);
    formData.append('speed', speed.toString());
    return await api.post('/api/video/change-speed', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  merge: async (videos: File[]) => {
    const formData = new FormData();
    videos.forEach((video) => formData.append('videos', video));
    return await api.post('/api/video/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Download helper
export const downloadFile = async (url: string, filename: string) => {
  const response = await api.get(url, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export default api;
