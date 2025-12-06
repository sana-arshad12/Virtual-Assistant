import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import { userDataContext } from '../context/UserContext'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"

function Customization() {
  const [uploadedImages, setUploadedImages] = useState([])
  const contextValue = useContext(userDataContext)
  const { selectedImage, setSelectedImage } = contextValue || {}
  const navigate = useNavigate()

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = e.target.result
        setUploadedImages(prev => [...prev, newImage])
        // Automatically select the newly uploaded image
        setSelectedImage(newImage)
      }
      reader.readAsDataURL(file)
    }
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  const handleNextClick = () => {
    if (selectedImage) {
      // Save selected image to localStorage as backup
      localStorage.setItem('selectedAssistantImage', selectedImage)
      
      // Navigate to Customization2 page with smooth transition
      navigate('/customization2', { 
        state: { selectedImage },
        replace: false 
      })
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex justify-center items-center flex-col relative overflow-hidden py-8 px-4'> 
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      {/* <Card image={userData?.assistantImage} /> */}

      <div className='w-full max-w-7xl flex justify-center items-center flex-wrap gap-4 sm:gap-6 p-4 sm:p-6 relative z-10'>
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />

        {/* Display all uploaded images */}
        {uploadedImages.map((uploadedImg, index) => (
          <Card key={index} image={uploadedImg} />
        ))}

        {/* Upload Card - Always visible */}
        <div className='relative w-[120px] h-[180px] sm:w-[150px] sm:h-[250px] bg-white/5 backdrop-blur-md border-2 border-dashed border-white/20 rounded-2xl overflow-hidden
          hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer hover:border-white/40 transition-all duration-300'>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
          />
          
          <div className='w-full h-full flex flex-col justify-center items-center'>
            <svg 
              className='w-12 h-12 text-blue-400 mb-2' 
              fill='none' 
              stroke='currentColor' 
              viewBox='0 0 24 24' 
              xmlns='http://www.w3.org/2000/svg'
            >
              <path 
                strokeLinecap='round' 
                strokeLinejoin='round' 
                strokeWidth={2} 
                d='M12 4v16m8-8H4' 
              />
            </svg>
            <span className='text-blue-300 text-xs sm:text-sm text-center px-2'>Upload Image</span>
          </div>
        </div>
      </div>

      {/* Next Button - Shows when image is selected */}
      {selectedImage && (
        <div className='fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 animate-fadeIn'>
          <button 
            onClick={handleNextClick}
            className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 
            text-white font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-xl shadow-xl hover:shadow-2xl text-sm sm:text-base
            transition-all duration-300 transform hover:scale-105 active:scale-95
            flex items-center gap-2 group backdrop-blur-sm'
          >
            <span>Next</span>
            <svg 
              className='w-5 h-5 transition-transform duration-300 group-hover:translate-x-1' 
              fill='none' 
              stroke='currentColor' 
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default Customization