import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext.jsx'
import bg from '../assets/authBg.png'

function SignIn() {
  const navigate = useNavigate()
  const { value } = useContext(userDataContext)
  const { setUserData, serverUrl } = value || {}
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors)
      return
    }

    setLoading(true)
    console.log('=== SIGNIN FORM DATA ===')
    console.log('Email:', formData.email)
    console.log('Password:', formData.password)
    console.log('✅ Form validation passed!')

    try {
      // Use serverUrl from context instead of hardcoded URL
      const response = await fetch(`${serverUrl}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Login successful:', data)
        
        // Save token to localStorage
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        
        // Update user data in context
        if (setUserData && data.user) {
          setUserData(data.user)
        }
        
        // Navigate to home/customization based on user data
        if (data.user?.assistantImage && data.user?.assistantName) {
          navigate('/')
        } else {
          navigate('/customization')
        }
      } else {
        console.log('❌ Login failed:', data.message)
        setErrors({ general: data.message || 'Login failed' })
      }
    } catch (error) {
      console.error('❌ Network error:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}}>
      <form onSubmit={handleSubmit} className='w-[90%] h-[500px] max-w-[500px] bg-[#00000083] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]'>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Sign In to <span className='text-blue-400'>Virtual Assistant</span></h1>

        {/* General Error Message */}
        {errors.general && (
          <div className='w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm'>
            {errors.general}
          </div>
        )}

        <div className='w-full'>
          <input 
            type="email" 
            name="email"
            placeholder='Enter your email' 
            value={formData.email}
            onChange={handleChange}
            className={`w-full h-[60px] outline-none border-2 ${errors.email ? 'border-red-500' : 'border-white'} bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]`}
          />
          {errors.email && (
            <p className='text-red-400 text-sm mt-2 ml-4'>{errors.email}</p>
          )}
        </div>

        <div className='w-full'>
          <div className='relative h-[60px]'>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              placeholder='Enter your password' 
              value={formData.password}
              onChange={handleChange}
              className={`w-full h-[60px] outline-none border-2 ${errors.password ? 'border-red-500' : 'border-white'} bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] pr-[60px]`}
            />
            <button 
              type="button"
              onClick={togglePasswordVisibility}
              className='absolute right-[20px] top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors'
            >
              {showPassword ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className='text-red-400 text-sm mt-2 ml-4'>{errors.password}</p>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className='w-full h-[60px] bg-sky-400 hover:bg-sky-500 disabled:bg-gray-400 text-white font-semibold rounded-full text-[18px] transition-colors duration-300 mt-[10px]'
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className='text-gray-300 text-[16px] mt-[10px]'>
          Don't have an account? 
          <a href="/signup" className='text-blue-400 hover:text-blue-300 ml-1 underline'>
            Sign Up
          </a>
        </p>
      </form>
    </div>
  )
}

export default SignIn