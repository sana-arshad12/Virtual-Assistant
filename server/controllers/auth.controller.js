import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/user.model.js'

// Register User (signUp)
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    console.log('=== REGISTRATION DATA ===')
    console.log('Original Password:', password)
    console.log('Hashed Password:', hashedPassword)
    console.log('Salt Rounds:', saltRounds)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    })

    await user.save()

    // Generate JWT token directly (no separate utility file needed)
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    )

    console.log('✅ User registered successfully:', {
      id: user._id,
      name: user.name,
      email: user.email
    })

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ 
      message: 'Server error during login' 
    })
  }
}

// Forgot Password - Generate reset token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ 
        message: 'No user found with this email address' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Hash token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Save hashed token and expiration to user
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now
    await user.save()

    console.log('✅ Password reset token generated for:', email)

    // In a real application, you would send this token via email
    // For now, we'll return it in the response (NOT recommended for production)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`

    res.status(200).json({
      message: 'Password reset token generated',
      resetToken, // In production, send this via email instead
      resetUrl,
      expiresIn: '1 hour'
    })

  } catch (error) {
    console.error('❌ Forgot password error:', error)
    res.status(500).json({ 
      message: 'Server error during password reset request' 
    })
  }
}

// Reset Password - Update password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      })
    }

    // Hash the token from request to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      })
    }

    // Hash new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password and clear reset token fields
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    console.log('✅ Password reset successful for:', user.email)

    res.status(200).json({
      message: 'Password reset successful. You can now login with your new password.'
    })

  } catch (error) {
    console.error('❌ Reset password error:', error)
    res.status(500).json({ 
      message: 'Server error during password reset' 
    })
  }
}

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('Password provided:', password)
    console.log('Stored hash:', user.password)
    console.log('Password match:', isPasswordValid)

    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Generate JWT token directly
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    )

    console.log('✅ User logged in successfully:', {
      id: user._id,
      name: user.name,
      email: user.email
    })

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ 
      message: 'Server error during login' 
    })
  }
}