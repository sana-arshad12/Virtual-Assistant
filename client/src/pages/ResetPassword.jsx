import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../utils/api.js'
import bg from '../assets/authBg.png'

function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' })
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset token' })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset successful! Redirecting to sign in...' 
        })
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          navigate('/signin')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to reset password' })
      }
    } catch (error) {
      console.error('❌ Reset password error:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}}>
      <form onSubmit={handleSubmit} className='w-[90%] max-w-[500px] bg-[#00000083] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[30px] py-[40px]'>
        <h2 className='text-white text-3xl font-bold mb-4'>Reset Password</h2>

        {message.text && (
          <div className={`w-full p-3 rounded ${message.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className='w-full relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            name='newPassword'
            placeholder='New Password'
            value={formData.newPassword}
            onChange={handleChange}
            className='w-full p-3 bg-[#ffffff1a] border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
            disabled={loading}
          />
          <button
            type='button'
            onClick={togglePasswordVisibility}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <div className='w-full relative'>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name='confirmPassword'
            placeholder='Confirm New Password'
            value={formData.confirmPassword}
            onChange={handleChange}
            className='w-full p-3 bg-[#ffffff1a] border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
            disabled={loading}
          />
          <button
            type='button'
            onClick={toggleConfirmPasswordVisibility}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full p-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div className='text-center'>
          <Link to='/signin' className='text-blue-400 hover:text-blue-300 transition'>
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword
