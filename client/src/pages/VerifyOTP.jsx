import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { api } from '../utils/api.js'
import bg from '../assets/authBg.png'

function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const fromSignup = location.state?.fromSignup || false // Check if coming from signup
  const devOtp = location.state?.otp || '' // OTP from signup for development
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  // Show OTP hint in development
  React.useEffect(() => {
    if (devOtp) {
      console.log('🔑 Development OTP:', devOtp)
      setMessage({ type: 'info', text: `Development Mode - OTP: ${devOtp}` })
    }
  }, [devOtp])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setMessage({ type: '', text: '' })

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5)
    const lastInput = document.getElementById(`otp-${lastIndex}`)
    if (lastInput) lastInput.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    const otpString = otp.join('')

    // Validation
    if (otpString.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the complete 6-digit OTP' })
      return
    }

    if (!email) {
      setMessage({ type: 'error', text: 'Email not found. Please restart the process.' })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/auth/verify-otp', { 
        email, 
        otp: otpString 
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'OTP verified successfully! Redirecting...' 
        })
        
        // Check if this is from signup or password reset
        setTimeout(() => {
          if (fromSignup) {
            // From signup: redirect to signin page
            navigate('/signin', {
              state: { 
                message: 'Email verified successfully! Please sign in.',
                email: email
              }
            })
          } else {
            // From forgot password: redirect to reset password page
            navigate(`/reset-password/${data.resetToken}`, {
              state: { email }
            })
          }
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid OTP. Please try again.' })
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    setOtp(['', '', '', '', '', ''])

    try {
      // Use different endpoint based on flow
      const endpoint = fromSignup ? '/api/auth/resend-otp' : '/api/auth/forgot-password'
      const response = await api.post(endpoint, { email })
      const data = await response.json()

      if (response.ok) {
        const otpHint = data.otp ? ` (OTP: ${data.otp})` : '';
        setMessage({ 
          type: 'success', 
          text: `New OTP has been sent to your email!${otpHint}` 
        })
        setTimeLeft(600) // Reset timer
        console.log('🔑 New OTP:', data.otp) // Development only
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to resend OTP' })
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}}>
      <div className='w-[90%] max-w-[500px] bg-[#00000083] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[30px] py-[40px]'>
        <h2 className='text-white text-3xl font-bold mb-2'>Verify OTP</h2>
        
        <p className='text-gray-300 text-sm text-center mb-4'>
          We've sent a 6-digit OTP to<br/>
          <strong className='text-blue-400'>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-[20px]'>
          {message.text && (
            <div className={`p-3 rounded ${
              message.type === 'error' 
                ? 'bg-red-500/20 text-red-200 border border-red-500' 
                : message.type === 'info'
                ? 'bg-blue-500/20 text-blue-200 border border-blue-500'
                : 'bg-green-500/20 text-green-200 border border-green-500'
            }`}>
              {message.text}
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className='flex justify-center gap-2'>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type='text'
                maxLength='1'
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className='w-12 h-14 text-center text-2xl font-bold bg-[#ffffff1a] border-2 border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 transition'
                disabled={loading}
              />
            ))}
          </div>

          {/* Timer */}
          <div className='text-center'>
            {timeLeft > 0 ? (
              <p className='text-gray-400 text-sm'>
                Time remaining: <span className='text-blue-400 font-semibold'>{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className='text-red-400 text-sm'>OTP expired. Please request a new one.</p>
            )}
          </div>

          <button
            type='submit'
            disabled={loading || timeLeft <= 0}
            className='w-full p-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className='text-center'>
            <button
              type='button'
              onClick={handleResendOTP}
              disabled={loading || timeLeft > 540} // Can resend after 1 minute
              className='text-blue-400 hover:text-blue-300 text-sm transition disabled:text-gray-500 disabled:cursor-not-allowed'
            >
              {timeLeft > 540 ? 'Resend OTP (wait 1 min)' : 'Resend OTP'}
            </button>
          </div>

          <div className='text-center'>
            <Link to='/signin' className='text-gray-400 hover:text-gray-300 text-sm transition'>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyOTP
