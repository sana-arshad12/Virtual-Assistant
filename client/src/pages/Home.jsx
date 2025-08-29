import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'

function Home() {
  const { value } = useContext(userDataContext)
  const { 
    userData, 
    setUserData,
    handleLogout,
    chatHistory,
    sendMessageToAI,
    clearChatHistory,
    isListening,
    isProcessing,
    speechSupported,
    startVoiceRecognition,
    stopVoiceRecognition
  } = value
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return

    setIsTyping(true)
    try {
      await sendMessageToAI(message.trim(), 'text')
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopVoiceRecognition()
    } else {
      const started = startVoiceRecognition()
      if (!started) {
        alert('Voice recognition is not supported or failed to start')
      }
    }
  }

  const handleLogoutClick = () => {
    handleLogout()
    navigate('/signin')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!userData) {
    return (
      <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center'>
        <div className='text-white text-xl'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex flex-col'>
      {/* Header */}
      <header className='w-full bg-[#030326] border-b-2 border-[#0000ff66] px-4 py-3 md:px-8 md:py-4'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            {userData?.assistantImage && (
              <div className='w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-500'>
                <img 
                  src={userData.assistantImage} 
                  alt={userData.assistantName || 'Assistant'} 
                  className='w-full h-full object-cover'
                />
              </div>
            )}
            <div>
              <h1 className='text-white text-lg md:text-xl font-bold'>
                {userData?.assistantName || 'Your Assistant'}
              </h1>
              <p className='text-gray-400 text-sm'>Welcome back, {userData?.name}</p>
            </div>
          </div>
          
          <div className='flex items-center gap-2 md:gap-4'>
            <button
              onClick={() => clearChatHistory()}
              className='text-gray-300 hover:text-white transition-colors duration-300 p-2'
              title='Clear Chat History'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
              </svg>
            </button>
            
            <button
              onClick={() => navigate('/customization')}
              className='text-gray-300 hover:text-white transition-colors duration-300 p-2'
              title='Customize Assistant'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' />
              </svg>
            </button>
            
            <button
              onClick={handleLogoutClick}
              className='bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg 
              transition-all duration-300 text-sm md:text-base'
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className='flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4 md:px-6 md:py-6 overflow-hidden'>
        {/* Chat Messages */}
        <div className='flex-1 overflow-y-auto space-y-4 mb-4 pr-2'>
          {chatHistory.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center'>
              <div className='w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4'>
                <img 
                  src={userData?.assistantImage} 
                  alt={userData?.assistantName} 
                  className='w-full h-full object-cover'
                />
              </div>
              <h2 className='text-white text-xl md:text-2xl font-bold mb-2'>
                {userData?.assistantName}
              </h2>
              <p className='text-gray-400 text-sm md:text-base max-w-md mb-4'>
                Start a conversation with your personal assistant. Type your message or say "{userData?.assistantName || 'Assistant'}" followed by your command!
              </p>
              {speechSupported && (
                <p className='text-blue-400 text-xs md:text-sm'>
                  🎤 Voice recognition active - Just say "{userData?.assistantName || 'Assistant'}" and I'll listen!
                </p>
              )}
            </div>
          ) : (
            chatHistory.map((chat) => (
              <React.Fragment key={chat.id}>
                {/* User Message */}
                <div className='flex justify-end animate-fadeIn mb-4'>
                  <div className='max-w-[70%] md:max-w-[60%] px-4 py-3 rounded-2xl bg-blue-600 text-white'>
                    <div className='flex items-center gap-2 mb-1'>
                      {chat.messageType === 'voice' && (
                        <svg className='w-4 h-4 text-blue-200' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z'/>
                        </svg>
                      )}
                      <span className='text-xs text-blue-200'>{chat.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className='text-sm md:text-base leading-relaxed'>{chat.userMessage}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className='flex justify-start animate-fadeIn mb-6'>
                  <div className='max-w-[70%] md:max-w-[60%] px-4 py-3 rounded-2xl bg-[#030326] border border-[#0000ff66] text-white'>
                    <div className='flex items-start gap-3'>
                      <div className='w-8 h-8 rounded-full overflow-hidden border border-blue-500 flex-shrink-0'>
                        <img 
                          src={userData.assistantImage} 
                          alt={userData.assistantName} 
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm md:text-base leading-relaxed'>{chat.aiResponse}</p>
                        {chat.responseType && chat.responseType !== 'general' && (
                          <span className='inline-block mt-2 px-2 py-1 bg-blue-600 text-xs rounded-full'>
                            {chat.responseType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
          
          {(isTyping || isProcessing) && (
            <div className='flex justify-start animate-fadeIn'>
              <div className='bg-[#030326] border border-[#0000ff66] px-4 py-3 rounded-2xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full overflow-hidden border border-blue-500'>
                    <img 
                      src={userData?.assistantImage} 
                      alt={userData?.assistantName} 
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='flex space-x-2'>
                    <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'></div>
                    <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                    <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className='text-gray-400 text-sm'>
                    {isProcessing ? 'Processing voice...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className='bg-[#030326] border-2 border-[#0000ff66] rounded-2xl p-3 md:p-4'>
          <div className='flex gap-3 items-end'>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${userData?.assistantName || 'your assistant'}...`}
              disabled={isTyping || isProcessing}
              className='flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none 
              min-h-[40px] max-h-32 py-2 text-sm md:text-base disabled:opacity-50'
              rows={1}
            />
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping || isProcessing}
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed
              text-white p-2 md:p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home