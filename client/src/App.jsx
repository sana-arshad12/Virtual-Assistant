import React from 'react'
import { Routes, Route } from 'react-router-dom'

import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/signUp.jsx'

function App() {
  return (
    <div>
      {/* <h1>App hello </h1>
      <nav>
        <a href="/signin">Sign In</a> | <a href="/signup">Sign Up</a>
      </nav> */}
      <Routes>
        <Route path="/" element={<div><h2>Home Page</h2></div>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  )
}

export default App