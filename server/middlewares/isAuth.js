import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

// Middleware to verify JWT token and get user information
export const isAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.header('Authorization')
    
    // Check if token exists in Authorization header (Bearer token)
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7) // Remove 'Bearer ' prefix
    } else if (req.cookies && req.cookies.token) {
      // Fallback to cookie if Authorization header is not present
      token = req.cookies.token
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...')

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    console.log('🔓 Token decoded:', decoded)

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      })
    }

    console.log('👤 User found:', {
      id: user._id,
      name: user.name,
      email: user.email
    })

    // Attach user information to request object
    req.user = user
    req.userId = user._id

    // Continue to next middleware/route handler
    next()

  } catch (error) {
    console.error('❌ Authentication error:', error.message)

    // Handle different JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      })
    } else {
      return res.status(500).json({
        success: false,
        message: 'Server error during authentication.'
      })
    }
  }
}

// Optional middleware to get user info without strict authentication
// This can be used for routes that work for both authenticated and non-authenticated users
export const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.header('Authorization')
    
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7)
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    // If no token, continue without user info
    if (!token) {
      req.user = null
      req.userId = null
      return next()
    }

    // Try to verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId).select('-password')
    
    if (user) {
      req.user = user
      req.userId = user._id
      console.log('👤 Optional auth - User found:', user.name)
    } else {
      req.user = null
      req.userId = null
    }

    next()

  } catch (error) {
    // Don't throw error for optional auth, just continue without user info
    console.log('⚠️  Optional auth failed, continuing without user:', error.message)
    req.user = null
    req.userId = null
    next()
  }
}

// Middleware to check if user has specific permissions (for future use)
export const hasPermission = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    // Add role-based authorization logic here if needed
    // For now, just check if user exists
    if (req.user.role && req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      })
    }

    next()
  }
}

export default isAuth
