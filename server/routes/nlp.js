import express from 'express';
import multer from 'multer';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { NLPOperation } from '../models/NLPOperation.js';
import aiService from '../services/aiService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Translation endpoint
router.post('/translate', optionalAuth, async (req, res) => {
  try {
    const { text, fromLang, toLang } = req.body;

    if (!text || !fromLang || !toLang) {
      return res.status(400).json({ 
        error: 'Text, fromLang, and toLang are required' 
      });
    }

    const result = await aiService.translateText({ text, fromLang, toLang });

    // Save to database if user is authenticated
    if (req.user) {
      await NLPOperation.create({
        userId: req.user.id,
        type: 'translation',
        inputText: text,
        outputText: result.translatedText,
        metadata: {
          fromLang,
          toLang,
          confidence: result.confidence
        },
        processingTime: result.processingTime,
        modelVersion: result.modelVersion
      });
    }

    res.json({
      translatedText: result.translatedText,
      confidence: result.confidence,
      processingTime: result.processingTime,
      fromLang,
      toLang
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Summarization endpoint
router.post('/summarize', optionalAuth, async (req, res) => {
  try {
    const { text, length = 'medium', maxTokens } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.split(' ').length < 10) {
      return res.status(400).json({ 
        error: 'Text must be at least 10 words long for summarization' 
      });
    }

    const result = await aiService.summarizeText({ text, length, maxTokens });

    // Save to database if user is authenticated
    if (req.user) {
      await NLPOperation.create({
        userId: req.user.id,
        type: 'summarization',
        inputText: text,
        outputText: result.summary,
        metadata: {
          length,
          originalLength: result.originalLength,
          summaryLength: result.summaryLength,
          compressionRatio: result.compressionRatio
        },
        processingTime: result.processingTime,
        modelVersion: result.modelVersion
      });
    }

    res.json({
      summary: result.summary,
      originalLength: result.originalLength,
      summaryLength: result.summaryLength,
      compressionRatio: result.compressionRatio,
      processingTime: result.processingTime
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// Speech-to-text endpoint
router.post('/speech-to-text', optionalAuth, upload.single('audio'), async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const audioData = req.file;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const result = await aiService.processAudio({ audioData, language });

    // Save to database if user is authenticated
    if (req.user) {
      await NLPOperation.create({
        userId: req.user.id,
        type: 'speech-to-text',
        inputText: 'Audio file',
        outputText: result.transcript,
        metadata: {
          confidence: result.confidence,
          language: result.language,
          audioSize: audioData.size
        },
        processingTime: result.processingTime,
        modelVersion: result.modelVersion
      });
    }

    res.json({
      transcript: result.transcript,
      confidence: result.confidence,
      language: result.language,
      processingTime: result.processingTime
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Speech-to-text processing failed' });
  }
});

// Text-to-speech endpoint
router.post('/text-to-speech', optionalAuth, async (req, res) => {
  try {
    const { text, voice = 'default', speed = 1.0, pitch = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await aiService.generateSpeech({ text, voice, speed, pitch });

    // Save to database if user is authenticated
    if (req.user) {
      await NLPOperation.create({
        userId: req.user.id,
        type: 'text-to-speech',
        inputText: text,
        outputText: 'Audio generated',
        metadata: {
          voice,
          speed,
          pitch,
          duration: result.duration
        },
        processingTime: result.processingTime,
        modelVersion: result.modelVersion
      });
    }

    if (result.audioBuffer) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.audioBuffer.length
      });
      res.send(result.audioBuffer);
    } else {
      res.json({
        message: 'Audio generation completed',
        processingTime: result.processingTime
      });
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Text-to-speech generation failed' });
  }
});

// Get user's NLP operation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, type } = req.query;
    
    const operations = await NLPOperation.findByUserId(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type
    });

    const stats = await NLPOperation.getStats(req.user.id);

    res.json({
      operations,
      stats,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: stats.total
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Clear user's history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    await NLPOperation.deleteByUserId(req.user.id);
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('History clear error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

export default router;