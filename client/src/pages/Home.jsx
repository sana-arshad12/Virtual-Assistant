import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Home() {
  const { value } = useContext(userDataContext)
  const { userData } = value || {}

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center'>
      <div className='w-[300px] h-[400px] bg-[#030326] border-2 border-blue-500 rounded-4xl overflow-hidden shadow-2xl'>
       
            <h2 className='text-white text-xl font-bold p-4'>Your Assistant</h2>
            <img src={userData?.assistantImage} alt="Assistant" className='w-full h-full object-cover' />
        

       

    </div>
    <h1  className='text-white text-xl font-bold p-4'>I'm {userData?.assistantName}</h1>
    </div>
  )
}

export default Home