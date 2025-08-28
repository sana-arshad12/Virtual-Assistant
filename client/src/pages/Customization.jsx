import React from 'react'
import Card from '../components/Card.jsx'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"

function Customization() {
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] justify-center items-center flex-col'> 
      {/* <Card image={userData?.assistantImage} /> */}

      <div className='w-[90%] max-w-[60%] flex justify-center items-center flex-wrap'>
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
      </div>
    </div>
  )
}

export default Customization