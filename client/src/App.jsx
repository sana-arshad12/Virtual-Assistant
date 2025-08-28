import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { userDataContext } from './context/UserContext.jsx'

import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/signUp.jsx'
import Customization from './pages/Customization.jsx'
import Home from './pages/Home.jsx'

function App() {
  const { value } = React.useContext(userDataContext)
  const { userData } = value || {}

  return (
    <div>
      <Routes>
        <Route path="/" element={(userData?.assistantImage && userData.assistantName) ? <Home /> : <Customization />} />
        <Route path="/signin" element={!userData ? <SignIn /> : <Home />} />
        <Route path="/signup" element={!userData ? <SignUp /> : <Home />} />
        <Route path="/customization" element={userData ? <Customization /> : <SignIn />} />
      </Routes>
    </div>
  )
}

export default App