import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
    console.error('❌ Registration error:', error)
    res.status(500).json({ 
      message: 'Server error during registration' 
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