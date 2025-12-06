import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { userDataContext } from './context/UserContext.jsx'


import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import VerifyOTP from './pages/VerifyOTP.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Customization from './pages/Customization.jsx'
import Customization2 from './pages/Customization2.jsx'
import Home from './pages/Home.jsx'

function App() {
  const contextValue = React.useContext(userDataContext)
  const { userData } = contextValue || {}

  // Helper function to determine what to show on home route
  const getHomeElement = () => {
    // If no user data at all, show signin first
    if (!userData) {
      return <SignIn />
    }
    // If user is logged in (including demo mode), show home directly
    // The home page will handle any missing customization gracefully
    return <Home />
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={getHomeElement()} />
        <Route path="/signin" element={!userData ? <SignIn /> : getHomeElement()} />
        <Route path="/signup" element={!userData ? <SignUp /> : getHomeElement()} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : getHomeElement()} />
        <Route path="/verify-otp" element={!userData ? <VerifyOTP /> : getHomeElement()} />
        <Route path="/reset-password/:token" element={!userData ? <ResetPassword /> : getHomeElement()} />
        <Route path="/customization" element={userData ? <Customization /> : <SignIn />} />
        <Route path="/customization2" element={userData ? <Customization2 /> : <SignIn />} />
        <Route path="/home" element={userData ? <Home /> : <SignIn />} />
      </Routes>
    </div>
  )
}

export default App