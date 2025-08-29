import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'

function Customization2() {
  const { value } = useContext(userDataContext)
  const { selectedImage, setSelectedImage, userData, setUserData, serverUrl } = value
  const location = useLocation()
  const navigate = useNavigate()
  const [displayImage, setDisplayImage] = useState(null)
  const [assistantName, setAssistantName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [nameError, setNameError] = useState('')

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
      const token = localStorage.getItem('token')

      if (!token) {
        setNameError('Authentication required. Please login again.')
        setIsCreating(false)
        return
      }

      // Determine if the selected image is a pre-uploaded image or a new upload
      const isPreUploaded = displayImage && (
        displayImage.includes('/assets/') || 
        displayImage.startsWith('http') && !displayImage.includes('data:')
      )

      // Create FormData for the API request
      const formData = new FormData()
      formData.append('assistantName', assistantName.trim())
      
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
      const response = await fetch(`${serverUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col relative overflow-hidden'>
      {/* Back Button */}
      <button 
        onClick={handleBackClick}
        disabled={isCreating}
        className='absolute top-6 left-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed 
        text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2'
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
        Back
      </button>

      <div className='text-white text-2xl md:text-3xl font-bold mb-6 animate-fadeIn text-center'>
        Name Your Assistant
      </div>
      
      {/* Selected Image Display */}
      <div className='mb-6 animate-slideUp'>
        <div className='text-white text-md mb-4 text-center'>Selected Assistant Image</div>
        <div className='w-[140px] h-[210px] bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden shadow-2xl mx-auto'>
          <img src={displayImage} className='w-full h-full object-cover rounded-2xl' alt='Selected Assistant' />
        </div>
      </div>

      {/* Name Input Section */}
      <div className='w-full max-w-md px-6 animate-fadeIn'>
        <div className='mb-6'>
          <label htmlFor='assistantName' className='block text-white text-md font-medium mb-3 text-center'>
            What would you like to call your assistant?
          </label>
          
          <input
            id='assistantName'
            type='text'
            value={assistantName}
            onChange={handleNameChange}
            placeholder='Enter assistant name...'
            disabled={isCreating}
            className='w-full px-4 py-3 bg-[#030326] border-2 border-[#0000ff66] rounded-xl text-white
            placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300
            disabled:bg-gray-800 disabled:cursor-not-allowed'
            maxLength={30}
          />
          
          {nameError && (
            <p className='text-red-400 text-sm mt-2 text-center animate-fadeIn'>{nameError}</p>
          )}
          
          <p className='text-gray-400 text-xs mt-2 text-center'>
            {assistantName.length}/30 characters
          </p>
        </div>

        {/* Create Assistant Button */}
        <button
          onClick={handleCreateAssistant}
          disabled={isCreating || !assistantName.trim() || nameError}
          className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
          disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
          text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl 
          transition-all duration-300 transform hover:scale-[1.02] active:scale-98
          flex items-center justify-center gap-3 text-md'
        >
          {isCreating ? (
            <>
              <svg className='animate-spin w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <circle cx='12' cy='12' r='10' strokeWidth='2' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 12a8 8 0 0115.735-2.83' />
              </svg>
              Creating Assistant...
            </>
          ) : (
            'Create Assistant'
          )}
        </button>

        {/* Helper Text */}
        <p className='text-gray-400 text-xs mt-4 text-center leading-relaxed'>
          Your assistant will be ready to help you with the selected appearance and name
        </p>
      </div>
    </div>
  )
}

export default Customization2
