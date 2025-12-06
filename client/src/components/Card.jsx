import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Card({ image }) {
  const contextValue = useContext(userDataContext)
  const { selectedImage, setSelectedImage } = contextValue || {}

  const handleCardClick = () => {
    setSelectedImage(image)
  }

  const isSelected = selectedImage === image

  return (
 <div 
   className={`w-[120px] h-[180px] sm:w-[140px] sm:h-[220px] md:w-[150px] md:h-[250px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
     isSelected 
       ? 'border-blue-400 border-4 shadow-2xl shadow-blue-500/50 scale-105 ring-2 ring-blue-400/50' 
       : 'border-white/20 hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/50 hover:scale-105'
   }`}
   onClick={handleCardClick}
 >
  <img src={image} className='w-full h-full object-cover rounded-2xl' alt='Card Image' />
 </div>
  )
}

export default Card