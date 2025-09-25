import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import uploadOnCloudinary from '../config/cloudinary.js'
import fs from 'fs'

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    // req.userId is set by the isAuth middleware after JWT verification
    const userId = req.userId
    
    console.log('📋 Getting profile for user ID:', userId)
    
    // Find user by ID (password excluded by default in middleware)
    const user = await User.findById(userId).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log('✅ User profile retrieved:', user.name)

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        assistantName: user.assistantName,
        assistantImage: user.assistantImage,
        history: user.history,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error getting user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile'
    })
  }
}

// Update user profile with assistant data
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware
    const { name, assistantName, assistantImage, isPreUploadedImage } = req.body

    console.log('📝 Updating profile for user ID:', userId)
    console.log('Update data:', { name, assistantName, assistantImage: assistantImage ? 'provided' : 'none', isPreUploadedImage })

    // Validation
    if (!name && !assistantName && !assistantImage && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update'
      })
    }

    // Prepare update object
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (assistantName) updateData.assistantName = assistantName.trim()

    // Handle assistant image
    let finalImageUrl = null

    if (req.file) {
      // New image uploaded from device - upload to Cloudinary
      console.log('🌐 Uploading new image to Cloudinary:', req.file.filename)
      try {
        finalImageUrl = await uploadOnCloudinary(req.file.path)
        console.log('✅ Image uploaded to Cloudinary:', finalImageUrl)
      } catch (error) {
        console.error('❌ Cloudinary upload failed:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to cloud storage'
        })
      }
    } else if (assistantImage && isPreUploadedImage === 'true') {
      // Pre-uploaded image selected - use the path directly
      console.log('📁 Using pre-uploaded image path:', assistantImage)
      finalImageUrl = assistantImage
    } else if (assistantImage && isPreUploadedImage === 'false') {
      // Base64 image data - this shouldn't happen with file upload, but handle it
      console.log('🔍 Received base64 image data')
      finalImageUrl = assistantImage
    }

    if (finalImageUrl) {
      updateData.assistantImage = finalImageUrl
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).select('-password')

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log('✅ User profile updated successfully:', updatedUser.name)

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        assistantName: updatedUser.assistantName,
        assistantImage: updatedUser.assistantImage,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    
    // Clean up uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    })
  }
}

// Change user password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware
    const { currentPassword, newPassword } = req.body

    console.log('🔐 Password change request for user ID:', userId)

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      })
    }

    // Find user with password
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

    console.log('✅ Password changed successfully for user:', user.name)

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('❌ Error changing password:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    })
  }
}

// Get user's chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware
    const { page = 1, limit = 10 } = req.query

    console.log('💬 Getting chat history for user ID:', userId)

    const user = await User.findById(userId).select('history')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const history = user.history || []
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedHistory = history.slice(startIndex, endIndex)

    console.log(`✅ Retrieved ${paginatedHistory.length} chat entries`)

    res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      history: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalItems: history.length,
        totalPages: Math.ceil(history.length / limit),
        hasNext: endIndex < history.length,
        hasPrev: startIndex > 0
      }
    })

  } catch (error) {
    console.error('❌ Error getting chat history:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving chat history'
    })
  }
}

// Add new chat to history
export const addChatToHistory = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware
    const { message, response, timestamp } = req.body

    console.log('💭 Adding chat to history for user ID:', userId)

    // Validation
    if (!message || !response) {
      return res.status(400).json({
        success: false,
        message: 'Message and response are required'
      })
    }

    // Create chat entry
    const chatEntry = {
      message: message.trim(),
      response: response.trim(),
      timestamp: timestamp || new Date(),
      id: Date.now() // Simple ID for the chat entry
    }

    // Add to user's history
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          history: chatEntry 
        }
      },
      { new: true }
    ).select('history')

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log('✅ Chat added to history successfully')

    res.status(201).json({
      success: true,
      message: 'Chat added to history successfully',
      chatEntry,
      totalChats: updatedUser.history.length
    })

  } catch (error) {
    console.error('❌ Error adding chat to history:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding chat to history'
    })
  }
}

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware

    console.log('🗑️  Clearing chat history for user ID:', userId)

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { history: [] },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log('✅ Chat history cleared successfully')

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    })

  } catch (error) {
    console.error('❌ Error clearing chat history:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while clearing chat history'
    })
  }
}

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware
    const { password } = req.body

    console.log('🗑️  Account deletion request for user ID:', userId)

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      })
    }

    // Find user
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      })
    }

    // Delete user
    await User.findByIdAndDelete(userId)

    console.log('✅ User account deleted successfully:', user.email)

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting user account:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    })
  }
}

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware

    console.log('📊 Getting dashboard stats for user ID:', userId)

    const user = await User.findById(userId).select('history createdAt')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const history = user.history || []
    
    // Calculate stats
    const stats = {
      totalChats: history.length,
      accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      recentChats: history.slice(-5).reverse(), // Last 5 chats
      chatsByMonth: getChatsByMonth(history),
      lastActivity: history.length > 0 ? history[history.length - 1].timestamp : user.createdAt
    }

    console.log('✅ Dashboard stats calculated')

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      stats
    })

  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving dashboard statistics'
    })
  }
}

// Helper function to group chats by month
const getChatsByMonth = (history) => {
  const chatsByMonth = {}
  
  history.forEach(chat => {
    const date = new Date(chat.timestamp)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!chatsByMonth[monthKey]) {
      chatsByMonth[monthKey] = 0
    }
    chatsByMonth[monthKey]++
  })
  
  return chatsByMonth
}

// Verify user token (for checking if token is still valid)
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, the middleware has already verified the token
    const userId = req.userId
    
    console.log('🔍 Token verification for user ID:', userId)

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        assistantName: req.user.assistantName
      }
    })

  } catch (error) {
    console.error('❌ Error verifying token:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    })
  }
}
