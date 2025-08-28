import React, { useState } from 'react'
import bg from '../assets/authBg.png'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add signin logic here
    console.log('Sign in form submitted')
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}}>
      <form onSubmit={handleSubmit} className='w-[90%] h-[500px] max-w-[500px] bg-[#00000083] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' >
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Sign In to <span className='text-blue-400'>Virtual Assistant</span></h1>

        <input 
          type="email" 
          placeholder='Enter your email' 
          className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' 
        />

        <div className='relative w-full h-[60px]'>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder='Enter your password' 
            className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] pr-[60px]' 
          />
          <button 
            type="button"
            onClick={togglePasswordVisibility}
            className='absolute right-[20px] top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors'
          >
            {showPassword ? (
              // Eye slash icon (hide password)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            ) : (
              // Eye icon (show password)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            )}
          </button>
        </div>

        <button 
          type="submit"
         className='w-full h-[60px] bg-sky-400 hover:bg-sky-500 text-white font-semibold rounded-full text-[18px] transition-colors duration-300 mt-[10px]'
        >
          Sign In
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