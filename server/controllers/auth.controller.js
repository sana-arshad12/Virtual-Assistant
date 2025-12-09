import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/user.model.js'
import { sendOTPEmail, sendPasswordResetConfirmation } from '../config/email.js'

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

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create unverified user with OTP
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false, // Mark as unverified
      otp,
      otpExpiry
    })

    await user.save()

    // Send OTP email
    await sendOTPEmail(email, otp)

    console.log('✅ User created (unverified), OTP sent:', {
      id: user._id,
      name: user.name,
      email: user.email,
      otp: otp // Development only
    })

    res.status(201).json({
      message: 'Registration successful! Please verify your email with the OTP sent.',
      email: email,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Show OTP in development
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    res.status(500).json({ 
      message: 'Server error during registration' 
    })
  }
}

// Resend OTP for signup verification
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      })
    }

    // Find unverified user
    const user = await User.findOne({ email, isVerified: false })

    if (!user) {
      return res.status(400).json({ 
        message: 'No unverified account found with this email' 
      })
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send OTP email
    await sendOTPEmail(email, otp)

    console.log('✅ OTP resent to:', email, 'OTP:', otp)

    res.status(200).json({
      message: 'New OTP has been sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Show OTP in development
    })

  } catch (error) {
    console.error('❌ Resend OTP error:', error)
    res.status(500).json({ 
      message: 'Server error during OTP resend' 
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Hash OTP before saving to database
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex')

    // Save hashed OTP and expiration to user
    user.resetPasswordOTP = hashedOTP
    user.resetPasswordOTPExpires = Date.now() + 600000 // 10 minutes from now
    await user.save()

    console.log('✅ Password reset OTP generated for:', email)
    console.log('🔑 OTP (development mode):', otp)

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, user.name)
    
    if (emailResult.success) {
      res.status(200).json({
        message: 'OTP has been sent to your email address',
        email: email,
        expiresIn: '10 minutes',
        ...(process.env.NODE_ENV === 'development' && { otp }) // Only in development
      })
    } else {
      // If email fails, still return success but with OTP in response for development
      console.error('⚠️ Email sending failed, returning OTP in response')
      res.status(200).json({
        message: 'OTP generated but email service unavailable. OTP shown below (development mode):',
        otp, // Fallback for development
        email: email,
        expiresIn: '10 minutes',
        emailError: emailResult.error
      })
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error)
    res.status(500).json({ 
      message: 'Server error during password reset request' 
    })
  }
}

// Verify OTP for signup or password reset
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Email and OTP are required' 
      })
    }

    // Find user with valid OTP (check both signup OTP and reset OTP)
    const user = await User.findOne({
      email: email,
      $or: [
        { // Signup OTP (plain text)
          otp: otp,
          otpExpiry: { $gt: Date.now() }
        },
        { // Password reset OTP (hashed)
          resetPasswordOTP: crypto.createHash('sha256').update(otp).digest('hex'),
          resetPasswordOTPExpires: { $gt: Date.now() }
        }
      ]
    })

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      })
    }

    // Check if this is signup verification
    if (user.otp && user.otp === otp && !user.isVerified) {
      // Signup verification
      user.isVerified = true
      user.otp = undefined
      user.otpExpiry = undefined
      await user.save()

      console.log('✅ Signup OTP verified for:', email)

      return res.status(200).json({
        message: 'Email verified successfully! You can now sign in.',
        verified: true,
        isSignupVerification: true
      })
    }

    // Otherwise, it's password reset verification
    // Generate a temporary reset token for password change
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Save reset token and clear OTP
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    user.resetPasswordOTP = undefined
    user.resetPasswordOTPExpires = undefined
    await user.save()

    console.log('✅ Password reset OTP verified for:', email)

    res.status(200).json({
      message: 'OTP verified successfully',
      resetToken, // Token to use for password reset
      verified: true,
      isPasswordReset: true
    })

  } catch (error) {
    console.error('❌ OTP verification error:', error)
    res.status(500).json({ 
      message: 'Server error during OTP verification' 
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

    // Send confirmation email
    await sendPasswordResetConfirmation(user.email, user.name)

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

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before signing in',
        requiresVerification: true
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