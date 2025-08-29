import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import {
  getChatResponse,
  processVoiceMessage,
  getChatHistory,
  clearChatHistory,
  testAI
} from '../controllers/ai.controller.js'

const router = express.Router()

// AI Chat Routes - All require authentication

// Get AI response from text/voice message
router.post('/chat', isAuth, getChatResponse)

// Process voice message (speech-to-text)
router.post('/voice', isAuth, processVoiceMessage)

// Get user's AI chat history
router.get('/history', isAuth, getChatHistory)

// Clear user's AI chat history
router.delete('/history', isAuth, clearChatHistory)

// Test AI connection (for debugging)
router.get('/test', isAuth, testAI)

export default router
