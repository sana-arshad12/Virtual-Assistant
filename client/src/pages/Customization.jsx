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
  const { value } = useContext(userDataContext)
  const { selectedImage, setSelectedImage } = value
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
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col relative'> 
      {/* <Card image={userData?.assistantImage} /> */}

      <div className='w-[90%] max-w-[60%] flex justify-center items-center flex-wrap gap-6 p-6'>
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
        <div className='relative w-[150px] h-[250px] bg-[#030326] border-2 border-dashed border-[#0000ff66] rounded-2xl overflow-hidden
          hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-blue-950 transition-all duration-300'>
          
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
            <span className='text-blue-400 text-sm text-center px-2'>Upload Image</span>
          </div>
        </div>
      </div>

      {/* Next Button - Shows when image is selected */}
      {selectedImage && (
        <div className='absolute bottom-8 right-8 animate-fadeIn'>
          <button 
            onClick={handleNextClick}
            className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
            text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl 
            transition-all duration-300 transform hover:scale-105 active:scale-95
            flex items-center gap-2 group'
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