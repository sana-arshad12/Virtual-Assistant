import React, {createContext, useEffect, useState} from 'react'
export const userDataContext = createContext()

function UserContext({ children }) {
    const serverUrl = "http://localhost:8000"
    const [userData, setUserData] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Speech Recognition Setup
    const [recognition, setRecognition] = useState(null)
    const [speechSupported, setSpeechSupported] = useState(false)
    const [shouldRestart, setShouldRestart] = useState(true)
    const [isRecognitionActive, setIsRecognitionActive] = useState(false)

    useEffect(() => {
        // Only initialize speech recognition if we have userData and don't already have an active instance
        if (!userData || recognition) {
            return
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognitionInstance = new SpeechRecognition()
            
            recognitionInstance.continuous = true
            recognitionInstance.interimResults = true
            recognitionInstance.lang = 'en-US'

            recognitionInstance.onstart = () => {
                const wakeWord = userData?.assistantName?.toLowerCase() || 'assistant'
                console.log(`🎤 Started listening for wake word "${wakeWord}"...`)
                setIsListening(true)
                setIsRecognitionActive(true)
            }

            recognitionInstance.onresult = (event) => {
                let finalTranscript = ''
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript
                    }
                }

                if (finalTranscript) {
                    const lowerTranscript = finalTranscript.toLowerCase().trim()
                    const wakeWord = userData?.assistantName?.toLowerCase() || 'assistant'
                    
                    console.log(`🔍 Heard: "${finalTranscript}" | Looking for wake word: "${wakeWord}"`)
                    
                    // Check if the transcript contains the wake word
                    if (lowerTranscript.includes(wakeWord)) {
                        console.log(`✅ Wake word "${wakeWord}" detected!`)
                        
                        // Extract the command after the wake word
                        const wakeWordIndex = lowerTranscript.indexOf(wakeWord)
                        const command = finalTranscript.substring(wakeWordIndex + wakeWord.length).trim()
                        
                        if (command) {
                            console.log(`🎯 Command extracted: "${command}"`)
                            handleVoiceCommand(command)
                        } else {
                            console.log('⚠️ No command found after wake word')
                        }
                    }
                }
            }

            recognitionInstance.onerror = (event) => {
                console.error('🚫 Speech recognition error:', event.error)
                setIsListening(false)
                setIsRecognitionActive(false)
                
                // Handle different types of errors
                if (event.error === 'aborted' || !shouldRestart) {
                    console.log('🛑 Speech recognition stopped - not restarting')
                    return
                }
                
                if (event.error === 'network') {
                    console.log('🌐 Network error - will retry in 5 seconds')
                    // Longer delay for network errors
                    if (userData && !isProcessing && shouldRestart) {
                        setTimeout(() => {
                            try {
                                if (shouldRestart && !isRecognitionActive) {
                                    recognitionInstance.start()
                                }
                            } catch (error) {
                                console.log('Failed to restart recognition after network error:', error)
                            }
                        }, 5000)
                    }
                    return
                }
                
                // Auto-restart recognition after a delay for other errors
                if (userData && !isProcessing && shouldRestart) {
                    setTimeout(() => {
                        try {
                            if (shouldRestart && !isRecognitionActive) {
                                recognitionInstance.start()
                            }
                        } catch (error) {
                            console.log('Failed to restart recognition:', error)
                        }
                    }, 2000)
                }
            }

            recognitionInstance.onend = () => {
                console.log('🎤 Speech recognition ended')
                setIsListening(false)
                setIsRecognitionActive(false)
                
                // Only restart if we should and user data is still available
                if (userData && !isProcessing && shouldRestart) {
                    setTimeout(() => {
                        try {
                            if (shouldRestart && !isRecognitionActive) {
                                recognitionInstance.start()
                            }
                        } catch (error) {
                            console.log('Failed to restart recognition:', error)
                        }
                    }, 1000)
                }
            }

            setRecognition(recognitionInstance)
            setSpeechSupported(true)
            setShouldRestart(true)
            
            // Start listening immediately
            try {
                recognitionInstance.start()
                console.log('✅ Speech recognition initialized with wake word "' + (userData?.assistantName?.toLowerCase() || 'assistant') + '"')
            } catch (error) {
                console.error('Failed to start initial recognition:', error)
            }

            // Return cleanup function that references the local recognitionInstance
            return () => {
                setShouldRestart(false)
                setIsRecognitionActive(false)
                if (recognitionInstance) {
                    try {
                        recognitionInstance.stop()
                    } catch (error) {
                        console.log('Error stopping recognition on cleanup:', error)
                    }
                }
            }
        } else {
            setSpeechSupported(false)
            console.log('❌ Speech recognition not supported')
            
            // Return empty cleanup function
            return () => {}
        }
    }, [userData?.assistantName]) // Only depend on assistant name, not full userData

    const handleCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token found, user not authenticated')
                return
            }

            const response = await fetch(`${serverUrl}/api/user/check-auth`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()
            
            if (response.ok && data.success && data.authenticated) {
                setUserData(data.user)
                console.log('✅ User authenticated:', data.user.name)
            } else {
                console.log('User not authenticated, removing token')
                localStorage.removeItem('token')
                setUserData(null)
            }
        } catch (error) {
            console.error('Error checking authentication:', error)
            localStorage.removeItem('token')
            setUserData(null)
        }
    }

    // Logout function to clear user data and token
    const handleLogout = () => {
        setShouldRestart(false)
        setIsRecognitionActive(false)
        localStorage.removeItem('token')
        setUserData(null)
        setChatHistory([])
        setIsListening(false)
        setIsProcessing(false)
        
        // Stop speech recognition if active
        if (recognition) {
            try {
                recognition.stop()
            } catch (error) {
                console.log('No recognition to stop during logout')
            }
        }
        
        setRecognition(null)
        console.log('✅ User logged out successfully')
    }

    const handleVoiceCommand = async (command) => {
        if (isProcessing) {
            console.log('⏳ Already processing a command, skipping...')
            return
        }

        setIsProcessing(true)
        console.log(`🎙️ Processing voice command: "${command}"`)

        try {
            await sendMessageToAI(command, 'voice')
        } catch (error) {
            console.error('Error processing voice command:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const sendMessageToAI = async (message, messageType = 'text') => {
        if (!userData) {
            console.error('User not authenticated')
            return
        }

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.error('No authentication token found')
                return
            }

            // Add user message to chat history immediately
            const newUserChat = {
                id: Date.now(),
                userMessage: message,
                aiResponse: '',
                timestamp: new Date(),
                messageType: messageType
            }

            setChatHistory(prev => [...prev, newUserChat])

            // Send to AI
            const response = await fetch(`${serverUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: message,
                    assistantName: userData.assistantName,
                    messageType: messageType
                })
            })

            const data = await response.json()

            if (response.ok && data.success && data.response) {
                // Update the chat with AI response
                const updatedChat = {
                    ...newUserChat,
                    aiResponse: data.response,
                    responseType: data.responseType || 'general'
                }

                setChatHistory(prev => 
                    prev.map(chat => 
                        chat.id === newUserChat.id ? updatedChat : chat
                    )
                )

                // Save to backend only if we have a valid response
                await saveChatToHistory(message, data.response, messageType)

                // Speak the response if it was a voice command
                if (messageType === 'voice' && data.response) {
                    speakResponse(data.response)
                }

                console.log('✅ AI response received:', data.response)
            } else {
                console.error('AI request failed:', data.message || 'Unknown error')
                console.error('Full response:', data)
                console.error('Response status:', response.status)
                
                const errorMessage = 'Sorry, I encountered an error. Please try again.'
                
                // Update chat with error message
                const updatedChat = {
                    ...newUserChat,
                    aiResponse: errorMessage,
                    responseType: 'error'
                }

                setChatHistory(prev => 
                    prev.map(chat => 
                        chat.id === newUserChat.id ? updatedChat : chat
                    )
                )

                // Save error response to history
                await saveChatToHistory(message, errorMessage, messageType)
            }
        } catch (error) {
            console.error('Error sending message to AI:', error)
            
            const errorMessage = 'Sorry, I encountered a network error. Please try again.'
            
            // Update chat with error message
            const updatedChat = {
                ...newUserChat,
                aiResponse: errorMessage,
                responseType: 'error'
            }

            setChatHistory(prev => 
                prev.map(chat => 
                    chat.id === newUserChat.id ? updatedChat : chat
                )
            )

            // Try to save error response to history
            try {
                await saveChatToHistory(message, errorMessage, messageType)
            } catch (saveError) {
                console.error('Failed to save error message to history:', saveError)
            }
        }
    }

    const speakResponse = (text) => {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            window.speechSynthesis.cancel()
            
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.9
            utterance.pitch = 1
            utterance.volume = 0.8
            
            utterance.onstart = () => {
                console.log('🔊 Starting to speak response')
            }
            
            utterance.onend = () => {
                console.log('🔊 Finished speaking response')
            }
            
            utterance.onerror = (event) => {
                console.error('🔊 Speech synthesis error:', event.error)
            }
            
            window.speechSynthesis.speak(utterance)
        } else {
            console.log('Text-to-speech not supported')
        }
    }

    const saveChatToHistory = async (message, response, messageType = 'text') => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token available for saving chat history')
                return
            }

            const chatResponse = await fetch(`${serverUrl}/api/user/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message,
                    response,
                    messageType,
                    timestamp: new Date().toISOString()
                })
            })

            const chatData = await chatResponse.json()
            
            if (chatResponse.ok && chatData.success) {
                console.log('💾 Chat saved to history successfully')
            } else {
                console.error('Failed to save chat to history:', chatData.message)
            }
        } catch (error) {
            console.error('Error saving chat to history:', error)
        }
    }

    const loadChatHistory = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token available for loading chat history')
                return
            }

            const response = await fetch(`${serverUrl}/api/user/history?limit=50`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()
            
            if (response.ok && data.success && data.history) {
                const formattedHistory = data.history.map(chat => ({
                    id: chat.id || Date.now() + Math.random(),
                    userMessage: chat.message,
                    aiResponse: chat.response,
                    timestamp: new Date(chat.timestamp),
                    messageType: chat.messageType || 'text',
                    responseType: chat.responseType || 'general'
                }))
                
                setChatHistory(formattedHistory.reverse()) // Show newest first
                console.log('✅ Chat history loaded')
            } else {
                console.log('No chat history found or failed to load')
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
        }
    }

    const clearChatHistory = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token available for clearing chat history')
                return
            }

            const response = await fetch(`${serverUrl}/api/user/history`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()
            
            if (response.ok && data.success) {
                setChatHistory([])
                console.log('✅ Chat history cleared')
            } else {
                console.error('Failed to clear chat history:', data.message)
            }
        } catch (error) {
            console.error('Error clearing chat history:', error)
        }
    }

    // Auto-login disabled - user must manually sign in
    // useEffect(() => {
    //     handleCurrentUser()
    // }, [])

    // Load chat history when user data is available
    useEffect(() => {
        if (userData) {
            loadChatHistory()
        }
    }, [userData])

    const value = { 
        serverUrl, 
        userData, 
        setUserData, 
        handleCurrentUser, 
        handleLogout,
        selectedImage, 
        setSelectedImage,
        chatHistory,
        setChatHistory,
        sendMessageToAI,
        clearChatHistory,
        isListening,
        isProcessing,
        speechSupported,
        startVoiceRecognition: () => {
            if (recognition && !isListening && !isRecognitionActive) {
                try {
                    setShouldRestart(true)
                    recognition.start()
                    return true
                } catch (error) {
                    console.error('Failed to start voice recognition:', error)
                    return false
                }
            }
            return false
        },
        stopVoiceRecognition: () => {
            if (recognition && (isListening || isRecognitionActive)) {
                try {
                    setShouldRestart(false)
                    recognition.stop()
                    return true
                } catch (error) {
                    console.error('Failed to stop voice recognition:', error)
                    return false
                }
            }
            return false
        }
    }

    return (
        <userDataContext.Provider value={{ value }}>
            {children}
        </userDataContext.Provider>
    )
}

export default UserContext