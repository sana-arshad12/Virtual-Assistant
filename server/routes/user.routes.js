import express from 'express'
import { isAuth, optionalAuth } from '../middlewares/isAuth.js'
import upload from '../middlewares/multer.js'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getChatHistory,
  addChatToHistory,
  clearChatHistory,
  deleteUserAccount,
  getDashboardStats,
  verifyToken
} from '../controllers/user.controller.js'

const router = express.Router()

// Get current user profile (protected route)
router.get('/profile', isAuth, getUserProfile)

// Update user profile with optional file upload (protected route)
router.put('/profile', isAuth, upload.single('assistantImage'), updateUserProfile)

// Change password (protected route)
router.put('/change-password', isAuth, changePassword)

// Get user's chat history with pagination (protected route)
router.get('/history', isAuth, getChatHistory)

// Add new chat to history (protected route)
router.post('/history', isAuth, addChatToHistory)

// Clear chat history (protected route)
router.delete('/history', isAuth, clearChatHistory)

// Get dashboard statistics (protected route)
router.get('/dashboard', isAuth, getDashboardStats)

// Verify token validity (protected route)
router.get('/verify-token', isAuth, verifyToken)

// Delete user account (protected route)
router.delete('/account', isAuth, deleteUserAccount)

// Check authentication status (uses optional auth)
router.get('/check-auth', optionalAuth, (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        assistantName: req.user.assistantName
      }
    })
  } else {
    res.status(200).json({
      success: true,
      authenticated: false,
      user: null
    })
  }
})

export default router
