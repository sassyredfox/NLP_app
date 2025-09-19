import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface NLPOperation {
  id: string;
  user_id: string;
  type: 'translation' | 'summarization' | 'speech-to-text' | 'text-to-speech';
  input_text: string;
  output_text: string;
  metadata: Record<string, any>;
  processing_time: number;
  model_version: string;
  created_at: string;
}

export interface HistoryResponse {
  operations: NLPOperation[];
  stats: {
    total: number;
    translation: number;
    summarization: number;
    'speech-to-text': number;
    'text-to-speech': number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password, fullName });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// NLP API
export const nlpAPI = {
  translate: async (text: string, fromLang: string, toLang: string) => {
    const response = await api.post('/nlp/translate', { text, fromLang, toLang });
    return response.data;
  },

  summarize: async (text: string, length: string = 'medium', maxTokens?: number) => {
    const response = await api.post('/nlp/summarize', { text, length, maxTokens });
    return response.data;
  },

  speechToText: async (audioFile: File, language: string = 'en') => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    const response = await api.post('/nlp/speech-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  textToSpeech: async (text: string, voice: string = 'default', speed: number = 1.0, pitch: number = 1.0) => {
    const response = await api.post('/nlp/text-to-speech', { text, voice, speed, pitch }, {
      responseType: 'blob',
    });
    return response.data;
  },

  getHistory: async (limit: number = 50, offset: number = 0, type?: string): Promise<HistoryResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(type && { type }),
    });
    
    const response = await api.get(`/nlp/history?${params}`);
    return response.data;
  },

  clearHistory: async (): Promise<void> => {
    await api.delete('/nlp/history');
  },

  healthCheck: async () => {
    const response = await api.get('/nlp/health');
    return response.data;
  },
};

export default api;