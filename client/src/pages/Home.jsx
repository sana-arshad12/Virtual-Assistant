import React, { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'
import MessageFormatter from '../components/MessageFormatter'

function Home() {
  const contextValue = useContext(userDataContext);
  const { 
    userData, 
    setUserData,
    chatHistory,
    sendMessage,
    clearChatHistory,
    isListening,
    isProcessing,
    speechSupported,
    toggleListening,
    serverConnected,
    retryServerConnection
  } = contextValue || {}
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleLogout = () => {
    // Clear user data and navigate to signin
    setUserData(null)
    localStorage.removeItem('token')
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return

    setIsTyping(true)
    try {
      await sendMessage(message.trim())
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleVoiceToggle = () => {
    if (toggleListening) {
      toggleListening()
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
    <div className='min-h-screen bg-gradient-to-t from-[black] to-[#030353] flex flex-col'>
      {/* Modern Header with Glassmorphism Effect - Responsive */}
      <header className='backdrop-blur-xl bg-white/10 border-b border-white/20 px-3 sm:px-6 py-3 sm:py-4 shadow-2xl'>
        <div className='max-w-7xl mx-auto flex justify-between items-center gap-2'>
          <div className='flex items-center gap-2 sm:gap-4 min-w-0 flex-1'>
            <div className='relative flex-shrink-0'>
              {userData?.assistantImage && (
                <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gradient-to-r from-blue-400 to-purple-500 shadow-lg'>
                  <img 
                    src={userData.assistantImage} 
                    alt={userData.assistantName || 'Assistant'} 
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                serverConnected ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}></div>
            </div>
            <div className='min-w-0 flex-1'>
              <h1 className='text-white text-sm sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate'>
                {userData?.assistantName || 'Your Assistant'}
              </h1>
              <p className='text-slate-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-wrap'>
                <span className='hidden sm:inline'>Welcome back,</span> 
                <span className='truncate max-w-[100px] sm:max-w-none'>{userData?.name}</span>
                {isListening && (
                  <span className='flex items-center gap-1 text-green-400 animate-pulse'>
                    <span className='w-2 h-2 bg-green-400 rounded-full animate-ping inline-block'></span>
                    <span className='hidden sm:inline'>Listening...</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className='flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0'>
            {!serverConnected && (
              <button
                onClick={() => retryServerConnection && retryServerConnection()}
                className='bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-yellow-500/30 transition-all duration-300 hover:scale-110'
                title='Retry Server Connection'
              >
                <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => clearChatHistory()}
              className='bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-slate-500/30 transition-all duration-300 hover:scale-110'
              title='Clear Chat History'
            >
              <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
              </svg>
            </button>
            
            <button
              onClick={() => navigate('/customization')}
              className='hidden sm:block bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-purple-500/30 transition-all duration-300 hover:scale-110'
              title='Customize Assistant'
            >
              <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' />
              </svg>
            </button>
            
            <button
              onClick={handleLogoutClick}
              className='bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg backdrop-blur-sm border border-red-500/30 transition-all duration-300 hover:scale-105 font-medium text-xs sm:text-sm'
            >
              <span className='hidden sm:inline'>Logout</span>
              <svg className='w-4 h-4 sm:hidden' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Modern Chat Container with Glass Effect - Responsive */}
      <main className='flex-1 flex flex-col max-w-5xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-6 overflow-hidden'>
        {/* Chat Messages Area */}
        <div className='flex-1 overflow-y-auto space-y-4 sm:space-y-6 mb-4 sm:mb-6 pr-1 sm:pr-2 chat-scroll'>
          {chatHistory.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-6 px-4'>
              <div className='relative'>
                <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-2xl'>
                  <img 
                    src={userData?.assistantImage} 
                    alt={userData?.assistantName} 
                    className='w-full h-full object-cover'
                  />
                </div>
                {isListening && (
                  <div className='absolute inset-0 rounded-full border-4 border-green-400 animate-ping'></div>
                )}
              </div>
              
              <div className='space-y-3 sm:space-y-4 max-w-md mx-auto px-2'>
                <h2 className='text-white text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
                  {userData?.assistantName}
                </h2>
                <p className='text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed'>
                  Hi there! I'm your AI assistant ready to help with tasks, answer questions, and control your system.
                </p>
                
                {speechSupported && (
                  <div className={`backdrop-blur-sm border rounded-xl p-3 sm:p-4 ${
                    isListening 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30' 
                      : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30'
                  }`}>
                    <p className={`text-xs sm:text-sm flex items-center gap-2 justify-center flex-wrap ${
                      isListening ? 'text-green-300' : 'text-blue-300'
                    }`}>
                      <svg className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z'/>
                      </svg>
                      <span className='text-center'>
                        {isListening 
                          ? <><strong>🎤 Listening...</strong> Say <strong>"{userData?.assistantName}"</strong> then your command</>
                          : <>Click the microphone button below to activate voice recognition</>
                        }
                      </span>
                    </p>
                  </div>
                )}
                
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6'>
                  {['open calculator', 'what time is it', 'open notepad', 'search google'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setMessage(suggestion)}
                      className='bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 hover:scale-105 capitalize'
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={`chat-${index}-${chat.timestamp || Date.now()}`} className='animate-fadeIn'>
                {chat.role === 'user' ? (
                  /* User Message - Modern Style */
                  <div className='flex justify-end mb-3 sm:mb-4'>
                    <div className='max-w-[90%] sm:max-w-[85%] md:max-w-[75%] group'>
                      <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-md shadow-xl'>
                        <div className='flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 md:mb-2'>
                          <svg className='w-3 h-3 sm:w-4 sm:h-4 text-blue-200 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z'/>
                          </svg>
                          <span className='text-xs text-blue-200'>
                            {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <p className='text-xs sm:text-sm md:text-base leading-relaxed break-words'>{chat.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI Response */
                  <div className='flex justify-start mb-4 sm:mb-6'>
                    <div className='max-w-[90%] sm:max-w-[85%] md:max-w-[70%] lg:max-w-[60%] px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-3xl bg-gradient-to-r from-slate-800/90 via-purple-800/90 to-slate-800/90 border border-purple-400/30 text-white backdrop-blur-xl shadow-2xl'>
                      <div className='flex items-start gap-2 sm:gap-3'>
                        <div className='w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-purple-400/50 flex-shrink-0 shadow-lg'>
                          <img 
                            src={userData.assistantImage} 
                            alt={userData.assistantName} 
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='text-xs sm:text-sm md:text-base leading-relaxed text-gray-100 break-words'>
                            <MessageFormatter content={chat.content} />
                          </div>
                          {chat.action && (
                            <div className='mt-2 sm:mt-3 flex items-center gap-2 flex-wrap'>
                              <span className='inline-flex items-center px-3 py-1.5 bg-transparent text-xs rounded-full backdrop-blur-sm border border-transparent font-medium' style={{display: 'none'}}>
                                ✅ Action: {chat.action}
                              </span>
                              {chat.execution?.success && (
                                <span className='inline-flex items-center px-3 py-1.5 bg-transparent text-xs rounded-full backdrop-blur-sm border border-transparent font-medium' style={{display: 'none'}}>
                                  🚀 Executed
                                </span>
                              )}
                              {chat.execution?.command && (
                                <span className='inline-block px-2 py-1 bg-purple-600 text-xs rounded-full'>
                                  {chat.execution.command}
                                </span>
                              )}
                            </div>
                          )}
                          {chat.responseType && chat.responseType !== 'general' && (
                            <span className='inline-block mt-2 px-2 py-1 bg-gray-600 text-xs rounded-full'>
                              {chat.responseType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {(isTyping || isProcessing) && (
            <div className='flex justify-start animate-fadeIn mb-4 sm:mb-6'>
              <div className='bg-gradient-to-r from-slate-800/90 via-purple-800/90 to-slate-800/90 border border-purple-400/30 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-4 rounded-3xl shadow-2xl'>
                <div className='flex items-center gap-2 sm:gap-4'>
                  <div className='w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-purple-400/50 shadow-lg'>
                    <img 
                      src={userData?.assistantImage} 
                      alt={userData?.assistantName} 
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='flex space-x-1.5 sm:space-x-2'>
                    <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-400 rounded-full animate-bounce'></div>
                    <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                    <div className='w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className='text-gray-200 text-xs sm:text-sm font-medium'>
                    {isProcessing ? 'Processing...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input - Responsive */}
        <div className={`bg-gradient-to-r from-slate-800/80 via-purple-800/60 to-slate-800/80 backdrop-blur-xl border-2 rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 shadow-2xl ${
          isListening ? 'border-emerald-400/70 shadow-emerald-500/25 shadow-2xl' : 'border-purple-400/40'
        }`}>
          {/* Voice Recognition Status */}
          {isListening && (
            <div className='flex items-center gap-2 mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-xl backdrop-blur-sm'>
              <div className='flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0'>
                <div className='relative flex-shrink-0'>
                  <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse'></div>
                  <div className='absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20'></div>
                </div>
                <span className='text-emerald-300 text-xs sm:text-sm font-medium truncate'>
                  🎤 Listening for "{userData?.assistantName}"...
                </span>
              </div>
            </div>
          )}
          
          <div className='flex gap-1.5 sm:gap-2 md:gap-4 items-end'>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? 
                `Voice active! Or type...` :
                `Message ${userData?.assistantName || 'assistant'}...`
              }
              disabled={isTyping || isProcessing}
              className='flex-1 bg-transparent text-white placeholder-gray-300 resize-none outline-none 
              min-h-[40px] sm:min-h-[44px] max-h-24 sm:max-h-28 md:max-h-32 py-2 sm:py-3 px-1 text-sm sm:text-base disabled:opacity-50 leading-relaxed'
              rows={1}
            />
            
            {/* Voice Recognition Toggle Button */}
            {speechSupported && (
              <button
                onClick={toggleListening}
                className={`p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm border shadow-lg flex-shrink-0 ${
                  isListening 
                    ? 'bg-emerald-500/90 hover:bg-emerald-600/90 text-white border-emerald-400/50 shadow-emerald-500/50' 
                    : 'bg-gray-600/80 hover:bg-gray-500/80 text-gray-200 border-gray-500/50 shadow-gray-600/30'
                }`}
                title={isListening ? `Click to Stop - Currently listening for "${userData?.assistantName}"` : `Click to Start Voice Recognition - Say "${userData?.assistantName}" then your command`}
              >
                <svg className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z'/>
                </svg>
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping || isProcessing}
              className='bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-700/90 hover:to-purple-700/90 
              disabled:from-gray-600/70 disabled:to-gray-700/70 disabled:cursor-not-allowed backdrop-blur-sm
              text-white p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 
              shadow-lg border border-blue-400/50 disabled:border-gray-500/50 flex-shrink-0'
            >
              <svg className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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