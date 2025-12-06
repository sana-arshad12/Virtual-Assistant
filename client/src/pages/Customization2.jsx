import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'
import { authenticatedFetch } from '../utils/api.js'

function Customization2() {
  const contextValue = useContext(userDataContext)
  const { 
    selectedImage, 
    setSelectedImage, 
    userData, 
    setUserData, 
    serverUrl,
    selectedPersonality,
    setSelectedPersonality,
    selectedVoice,
    setSelectedVoice,
    availablePersonalities,
    availableVoices,
    fetchPersonalities
  } = contextValue || {}
  const location = useLocation()
  const navigate = useNavigate()
  const [displayImage, setDisplayImage] = useState(null)
  const [assistantName, setAssistantName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    // Load personalities when component mounts
    if (fetchPersonalities) {
      fetchPersonalities()
    }
  }, [fetchPersonalities])

  useEffect(() => {
    // Get image from multiple sources for reliability
    const imageFromState = location.state?.selectedImage
    const imageFromContext = selectedImage
    const imageFromStorage = localStorage.getItem('selectedAssistantImage')

    const finalImage = imageFromState || imageFromContext || imageFromStorage

    if (finalImage) {
      setDisplayImage(finalImage)
      // Update context if it's missing
      if (!selectedImage && finalImage) {
        setSelectedImage(finalImage)
      }
    } else {
      // If no image is selected, redirect back to customization
      navigate('/customization', { replace: true })
    }
  }, [location.state, selectedImage, setSelectedImage, navigate])

  const handleBackClick = () => {
    navigate('/customization')
  }

  const validateName = (name) => {
    if (!name.trim()) {
      return 'Assistant name is required'
    }
    if (name.trim().length < 2) {
      return 'Assistant name must be at least 2 characters'
    }
    if (name.trim().length > 30) {
      return 'Assistant name must be less than 30 characters'
    }
    return ''
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setAssistantName(name)
    setNameError(validateName(name))
  }

  const handleCreateAssistant = async () => {
    const nameValidation = validateName(assistantName)
    if (nameValidation) {
      setNameError(nameValidation)
      return
    }

    setIsCreating(true)

    try {
      // Determine if the selected image is a pre-uploaded image or a new upload
      const isPreUploaded = displayImage && (
        displayImage.includes('/assets/') || 
        displayImage.startsWith('http') && !displayImage.includes('data:')
      )

      // Create FormData for the API request
      const formData = new FormData()
      formData.append('assistantName', assistantName.trim())
      formData.append('personality', selectedPersonality)
      formData.append('voicePreference', selectedVoice)
      
      if (isPreUploaded) {
        // Pre-uploaded image - send as path
        formData.append('assistantImage', displayImage)
        formData.append('isPreUploadedImage', 'true')
      } else {
        // New uploaded image - convert base64 to blob and upload
        if (displayImage.startsWith('data:')) {
          const response = await fetch(displayImage)
          const blob = await response.blob()
          formData.append('assistantImage', blob, 'uploaded-image.jpg')
          formData.append('isPreUploadedImage', 'false')
        }
      }

      // Make API call to update profile
      const response = await authenticatedFetch(`/api/user/profile`, {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update user context with new data
        if (userData) {
          const updatedUserData = {
            ...userData,
            assistantName: assistantName.trim(),
            assistantImage: data.user.assistantImage
          }
          setUserData(updatedUserData)
        }

        // Save to localStorage as backup
        localStorage.setItem('assistantData', JSON.stringify({
          name: assistantName.trim(),
          image: data.user.assistantImage,
          personality: selectedPersonality,
          voicePreference: selectedVoice,
          createdAt: new Date().toISOString()
        }))

        console.log('✅ Assistant created successfully:', data.user)
        
        // Navigate to home
        navigate('/')
        
      } else {
        throw new Error(data.message || 'Failed to create assistant')
      }
      
    } catch (error) {
      console.error('Error creating assistant:', error)
      setNameError(error.message || 'Failed to create assistant. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (!displayImage) {
    return (
      <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center'>
        <div className='text-white text-xl'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-y-auto'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      {/* Back Button */}
      <button 
        onClick={handleBackClick}
        disabled={isCreating}
        className='absolute top-4 left-4 z-20 bg-white/10 hover:bg-white/20 disabled:bg-gray-700/50 
        backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl 
        transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group shadow-xl'
      >
        <svg className='w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
        <span className='font-medium'>Back</span>
      </button>

      {/* Main Content Container */}
      <div className='w-full max-w-6xl mx-auto relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full items-center py-8 lg:py-0'>
          
          {/* Left Column - Image and Title */}
          <div className='text-center lg:text-left space-y-4 lg:space-y-6'>
            <div className='space-y-2 lg:space-y-4'>
              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight px-4 lg:px-0'>
                Customize Your AI
              </h1>
              <p className='text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 px-4 lg:px-0'>
                Create a unique identity for your AI assistant
              </p>
            </div>
            
            {/* Assistant Image Preview - Enhanced Design */}
            <div className='flex justify-center lg:justify-start'>
              <div className='relative group'>
                <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-500'></div>
                <div className='relative bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl border border-white/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl'>
                  <div className='text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-center tracking-wide'>Your Assistant</div>
                  <div className='w-40 h-56 sm:w-48 sm:h-72 lg:w-56 lg:h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/40 relative mx-auto'>
                    <img src={displayImage} className='w-full h-full object-cover' alt='Selected Assistant' />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Compact Form */}
          <div className='bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl max-w-lg mx-auto lg:mx-0 w-full'>
            <div className='space-y-4'>
              
              {/* Name Input */}
              <div className='space-y-2'>
                <label htmlFor='assistantName' className='block text-white text-sm sm:text-base font-semibold'>
                  Assistant Name
                </label>
                <div className='relative'>
                  <input
                    id='assistantName'
                    type='text'
                    value={assistantName}
                    onChange={handleNameChange}
                    placeholder='Give your AI a name...'
                    disabled={isCreating}
                    className='w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white
                    placeholder-gray-400 focus:border-blue-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400/20
                    transition-all duration-300 disabled:bg-gray-800/50 disabled:cursor-not-allowed'
                    maxLength={30}
                  />
                  <div className='absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs'>
                    {assistantName.length}/30
                  </div>
                </div>
                {nameError && (
                  <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-2'>
                    <p className='text-red-300 text-xs'>{nameError}</p>
                  </div>
                )}
              </div>

              {/* Personality Selection - Button Grid */}
              <div className='space-y-2'>
                <label className='block text-white text-sm sm:text-base font-semibold'>
                  Personality
                </label>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  {(availablePersonalities && availablePersonalities.length > 0 ? availablePersonalities : [
                    { id: 'friendly', name: 'Buddy', description: 'Warm & caring' },
                    { id: 'professional', name: 'Alex', description: 'Professional' },
                    { id: 'funny', name: 'Jester', description: 'Humorous' },
                    { id: 'wise', name: 'Sage', description: 'Wise' },
                    { id: 'serious', name: 'Formal', description: 'Serious' },
                    { id: 'energetic', name: 'Spark', description: 'Energetic' }
                  ]).slice(0, 6).map((personality) => (
                    <button
                      key={personality.id}
                      type='button'
                      onClick={() => setSelectedPersonality(personality.id)}
                      disabled={isCreating}
                      className={`p-2 sm:p-2 rounded-lg border-2 transition-all duration-300 text-xs ${
                        selectedPersonality === personality.id
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg scale-105'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-purple-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className='text-center space-y-0.5 sm:space-y-1'>
                        <div className='font-medium text-xs sm:text-sm'>{personality.name}</div>
                        <div className='text-[10px] sm:text-xs opacity-75 hidden sm:block'>{personality.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div className='space-y-2'>
                <label className='block text-white text-sm sm:text-base font-semibold'>
                  Voice Gender
                </label>
                <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                  <button
                    type='button'
                    onClick={() => setSelectedVoice('female')}
                    disabled={isCreating}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${
                      selectedVoice === 'female'
                        ? 'bg-pink-500/20 border-pink-400 text-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-pink-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className='text-center space-y-0.5 sm:space-y-1'>
                      <div className='text-xl sm:text-2xl'>👩</div>
                      <div className='font-medium text-xs sm:text-sm'>Female</div>
                    </div>
                  </button>
                  
                  <button
                    type='button'
                    onClick={() => setSelectedVoice('male')}
                    disabled={isCreating}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${
                      selectedVoice === 'male'
                        ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-blue-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className='text-center space-y-0.5 sm:space-y-1'>
                      <div className='text-xl sm:text-2xl'>👨</div>
                      <div className='font-medium text-xs sm:text-sm'>Male</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateAssistant}
                disabled={isCreating || !assistantName.trim() || nameError}
                className='w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
                hover:from-blue-700 hover:via-purple-700 hover:to-pink-700
                disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50
                text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-xl text-sm sm:text-base
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                
                {isCreating ? (
                  <>
                    <svg className='animate-spin w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='10' strokeWidth='2' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 12a8 8 0 0115.735-2.83' />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                    </svg>
                    <span>Create Assistant</span>
                  </>
                )}
              </button>

              {/* Compact Info */}
              <div className='text-center pt-1'>
                <p className='text-gray-400 text-[10px] sm:text-xs'>
                  🎭 Personality • 🎤 Voice • 🤖 AI Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Customization2