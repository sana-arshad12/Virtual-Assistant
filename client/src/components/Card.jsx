import React from 'react'

function Card({ image }) {
  return (
 <div className='w-[150px] h-[250px] bg-[#030326] border-2 border-[blue] rounded-2xl overflow-hidden'>
  <img src={image} className='w-full h-full object-cover rounded-2xl' alt='Card Image' />

 </div>
  )
}

export default Card