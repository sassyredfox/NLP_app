import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AI_MODEL_BASE_URL = process.env.AI_MODEL_BASE_URL || 'http://localhost:8000';
const AI_MODEL_API_KEY = process.env.AI_MODEL_API_KEY;

class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: AI_MODEL_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(AI_MODEL_API_KEY && { 'Authorization': `Bearer ${AI_MODEL_API_KEY}` })
      }
    });
  }

  async translateText({ text, fromLang, toLang }) {
    try {
      const startTime = Date.now();
      
      const response = await this.client.post('/translate', {
        text,
        source_language: fromLang,
        target_language: toLang
      });

      const processingTime = Date.now() - startTime;

      return {
        translatedText: response.data.translated_text,
        confidence: response.data.confidence || 0.95,
        processingTime,
        modelVersion: response.data.model_version || 'v1.0'
      };
    } catch (error) {
      console.error('Translation error:', error.message);
      
      // Fallback to mock translation for development
      const mockTranslation = `[MOCK] Translated from ${fromLang} to ${toLang}: ${text}`;
      return {
        translatedText: mockTranslation,
        confidence: 0.85,
        processingTime: 1500,
        modelVersion: 'mock-v1.0'
      };
    }
  }

  async summarizeText({ text, length = 'medium', maxTokens = null }) {
    try {
      const startTime = Date.now();
      
      const lengthMap = {
        short: 50,
        medium: 150,
        long: 300
      };

      const response = await this.client.post('/summarize', {
        text,
        max_tokens: maxTokens || lengthMap[length] || 150,
        length_preference: length
      });

      const processingTime = Date.now() - startTime;

      return {
        summary: response.data.summary,
        originalLength: text.length,
        summaryLength: response.data.summary.length,
        compressionRatio: response.data.compression_ratio || 0.3,
        processingTime,
        modelVersion: response.data.model_version || 'v1.0'
      };
    } catch (error) {
      console.error('Summarization error:', error.message);
      
      // Fallback to mock summarization
      const lengthDescriptions = {
        short: 'brief',
        medium: 'moderate',
        long: 'detailed'
      };
      
      const mockSummary = `[MOCK] This is a ${lengthDescriptions[length]} summary of the provided text. The content has been processed and condensed while preserving key information and main ideas.`;
      
      return {
        summary: mockSummary,
        originalLength: text.length,
        summaryLength: mockSummary.length,
        compressionRatio: mockSummary.length / text.length,
        processingTime: 2000,
        modelVersion: 'mock-v1.0'
      };
    }
  }

  async processAudio({ audioData, language = 'en' }) {
    try {
      const startTime = Date.now();
      
      const formData = new FormData();
      formData.append('audio', audioData);
      formData.append('language', language);

      const response = await this.client.post('/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        transcript: response.data.transcript,
        confidence: response.data.confidence || 0.92,
        language: response.data.detected_language || language,
        processingTime,
        modelVersion: response.data.model_version || 'v1.0'
      };
    } catch (error) {
      console.error('Speech-to-text error:', error.message);
      
      // Fallback for development
      return {
        transcript: '[MOCK] This is a mock transcription of the audio input.',
        confidence: 0.88,
        language: language,
        processingTime: 3000,
        modelVersion: 'mock-v1.0'
      };
    }
  }

  async generateSpeech({ text, voice = 'default', speed = 1.0, pitch = 1.0 }) {
    try {
      const startTime = Date.now();
      
      const response = await this.client.post('/text-to-speech', {
        text,
        voice,
        speed,
        pitch,
        format: 'mp3'
      }, {
        responseType: 'arraybuffer'
      });

      const processingTime = Date.now() - startTime;

      return {
        audioBuffer: response.data,
        duration: response.headers['x-audio-duration'] || null,
        processingTime,
        modelVersion: response.headers['x-model-version'] || 'v1.0'
      };
    } catch (error) {
      console.error('Text-to-speech error:', error.message);
      
      // Return mock response for development
      return {
        audioBuffer: null,
        duration: null,
        processingTime: 2500,
        modelVersion: 'mock-v1.0'
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        version: response.data.version,
        uptime: response.data.uptime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

export default new AIService();