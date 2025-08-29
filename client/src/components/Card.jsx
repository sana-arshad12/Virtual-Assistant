import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Card({ image }) {
  const { value } = useContext(userDataContext)
  const { selectedImage, setSelectedImage } = value

  const handleCardClick = () => {
    setSelectedImage(image)
  }

  const isSelected = selectedImage === image

  return (
 <div 
   className={`w-[150px] h-[250px] bg-[#030326] border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
     isSelected 
       ? 'border-blue-500 border-4 shadow-2xl shadow-blue-950' 
       : 'border-[#0000ff66] hover:shadow-2xl hover:shadow-blue-950 hover:border-4 hover:border-blue-950'
   }`}
   onClick={handleCardClick}
 >
  <img src={image} className='w-full h-full object-cover rounded-2xl' alt='Card Image' />
 </div>
  )
}

export default Card