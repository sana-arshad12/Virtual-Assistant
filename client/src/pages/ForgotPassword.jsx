import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api.js'
import bg from '../assets/authBg.png'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/auth/forgot-password', { email })
      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset link has been generated. Check the console for the token (in production, this would be sent via email).' 
        })
        // Store token for development purposes
        setResetToken(data.resetToken)
        console.log('🔑 Reset Token:', data.resetToken)
        console.log('🔗 Reset URL:', data.resetUrl)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to process request' })
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}}>
      <div className='w-[90%] max-w-[500px] bg-[#00000083] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[30px] py-[40px]'>
        <h2 className='text-white text-3xl font-bold mb-4'>Forgot Password</h2>
        
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-[20px]'>
          <p className='text-gray-300 text-sm text-center'>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message.text && (
            <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
              {message.text}
            </div>
          )}

          <input
            type='email'
            name='email'
            placeholder='Email Address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-3 bg-[#ffffff1a] border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
            disabled={loading}
          />

          {resetToken && (
            <div className='bg-blue-500/20 p-3 rounded'>
              <p className='text-blue-200 text-sm mb-2'>
                <strong>Development Mode:</strong> Copy this token and use it on the reset password page:
              </p>
              <code className='text-xs text-white bg-black/30 p-2 rounded block break-all'>
                {resetToken}
              </code>
              <button
                type='button'
                onClick={() => navigate(`/reset-password/${resetToken}`)}
                className='mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
              >
                Go to Reset Password Page
              </button>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full p-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className='text-center'>
            <Link to='/signin' className='text-blue-400 hover:text-blue-300 transition'>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
