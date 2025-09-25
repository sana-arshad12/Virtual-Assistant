"use client"

import { createContext, useEffect, useState } from "react"
import { api, authenticatedFetch } from "../utils/api.js"
export const userDataContext = createContext()

function UserContext({ children }) {
  const serverUrl = (() => {
    try {
      // Try Next.js environment variables first
      if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE) {
        return process.env.NEXT_PUBLIC_API_BASE
      }
      // Try Vite environment variables
      if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) {
        return import.meta.env.VITE_API_BASE
      }
      // Updated fallback - will be auto-detected by API utility
      return "http://localhost:8001"
    } catch (error) {
      console.log("Using default server URL due to environment variable access error")
      return "http://localhost:8001"
    }
  })()

  const [userData, setUserData] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isRecognitionActive, setIsRecognitionActive] = useState(false)
  const [shouldRestart, setShouldRestart] = useState(true)
  const [serverConnected, setServerConnected] = useState(false)

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setSpeechSupported(false)
      console.log("❌ Speech recognition not supported")
      return
    }

    setSpeechSupported(true)

    if (!userData?.assistantName) {
      console.log("⏳ Waiting for userData to initialize speech recognition...")
      return
    }

    if (!shouldRestart) {
      console.log("🛑 Speech recognition restart disabled")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      console.log("❌ Speech recognition not supported")
      return
    }

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = "en-US"

    recognitionInstance.onstart = () => {
      const wakeWord = userData?.assistantName?.toLowerCase() || "assistant"
      console.log(`🎤 Started listening for wake word "${wakeWord}"...`)
      setIsListening(true)
      setIsRecognitionActive(true)
    }

    recognitionInstance.onresult = (event) => {
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        }
      }

      if (finalTranscript) {
        const lowerTranscript = finalTranscript.toLowerCase().trim()
        const wakeWord = userData?.assistantName?.toLowerCase() || "assistant"

        console.log(`🔍 Heard: "${finalTranscript}" | Looking for wake word: "${wakeWord}"`)

        // Check if the transcript contains the wake word
        if (lowerTranscript.includes(wakeWord)) {
          console.log(`✅ Wake word "${wakeWord}" detected!`)

          // Extract the command after the wake word
          const wakeWordIndex = lowerTranscript.indexOf(wakeWord)
          const commandPart = lowerTranscript.substring(wakeWordIndex + wakeWord.length).trim()

          if (commandPart) {
            console.log(`🎯 Command extracted: "${commandPart}"`)
            handleVoiceCommand(commandPart)
          } else {
            console.log("⚠️ Wake word detected but no command found")
            speakResponse("Yes, how can I help you?")
          }
        }
      }
    }

    recognitionInstance.onerror = (event) => {
      console.error("🚨 Speech recognition error:", event.error)
      setIsListening(false)
      setIsRecognitionActive(false)

      // Auto-restart on certain errors
      if (event.error === "no-speech" || event.error === "aborted") {
        console.log("🔄 Restarting speech recognition due to:", event.error)
        setTimeout(() => {
          if (shouldRestart && recognitionInstance) {
            try {
              recognitionInstance.start()
            } catch (error) {
              console.error("Failed to restart recognition:", error)
            }
          }
        }, 1000)
      }
    }

    recognitionInstance.onend = () => {
      console.log("🔇 Speech recognition ended")
      setIsListening(false)
      setIsRecognitionActive(false)

      // Auto-restart if should restart is true
      if (shouldRestart) {
        console.log("🔄 Auto-restarting speech recognition...")
        setTimeout(() => {
          if (shouldRestart && recognitionInstance) {
            try {
              recognitionInstance.start()
            } catch (error) {
              console.error("Failed to restart recognition:", error)
            }
          }
        }, 500)
      }
    }

    // Start listening immediately
    try {
      recognitionInstance.start()
      console.log(
        '✅ Speech recognition initialized with wake word "' +
          (userData?.assistantName?.toLowerCase() || "assistant") +
          '"',
      )
    } catch (error) {
      console.error("Failed to start initial recognition:", error)
    }

    // Return cleanup function that references the local recognitionInstance
    return () => {
      setShouldRestart(false)
      setIsRecognitionActive(false)
      if (recognitionInstance) {
        try {
          recognitionInstance.stop()
        } catch (error) {
          console.log("Error stopping recognition on cleanup:", error)
        }
      }
    }
  }, [userData?.assistantName]) // Only depend on assistant name, not full userData

  const handleCurrentUser = async () => {
    try {
      const response = await api.get(`/api/user/check-auth`)

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setUserData(data.user)
          setServerConnected(true)
          console.log("✅ Connected to backend server")
          return data.user
        } else {
          console.warn("⚠️ User not authenticated, using demo mode")
          setMockUserData()
          setServerConnected(false)
          return null
        }
      } else {
        console.warn("⚠️ Backend server responded with error, using demo mode")
        setMockUserData()
        setServerConnected(false)
        return null
      }
    } catch (error) {
      console.warn("🔧 Backend server not available - running in demo mode")
      console.log("💡 To enable full functionality, start your backend server at:", serverUrl)
      setMockUserData()
      setServerConnected(false)
      return null
    }
  }

  const setMockUserData = () => {
    // Set mock user data for demo mode
    setUserData({
      _id: "demo-user",
      name: "Demo User",
      email: "demo@example.com",
      assistantName: "neelam",
      assistantImage: "https://i.postimg.cc/d0Z1QJpr/ai.gif"
    })
    console.log("🎭 Running in demo mode with mock user data")
  }

  const handleVoiceCommand = async (command) => {
    console.log(`🎙️ Processing voice command: "${command}"`)
    setIsProcessing(true)

    try {
      const userMessage = { role: "user", content: command, timestamp: new Date().toISOString() }
      setChatHistory((prev) => [...prev, userMessage])

      if (!serverConnected) {
        const mockResponse = "Please sign in to use the AI assistant. Click the sign-in button to get started!"
        const aiMessage = {
          role: "assistant",
          content: mockResponse,
          timestamp: new Date().toISOString(),
        }
        setChatHistory((prev) => [...prev, aiMessage])
        speakResponse(mockResponse)
        setIsProcessing(false)
        return
      }

      const response = await api.post(`/api/ai/chat`, {
        message: command,
        history: chatHistory,
        execute: true, // Enable system command execution
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
          action: data.action,
          execution: data.execution,
          responseType: data.responseType
        }
        setChatHistory((prev) => [...prev, aiMessage])

        speakResponse(data.response)

        if (data.action) {
          try {
            switch (data.action) {
              case "get_current_time":
                console.log("⏰ Time provided in response")
                break
              case "clear_chat":
                clearChatHistory()
                console.log("🗑️ Chat history cleared")
                break
              case "toggle_listening":
                toggleListening()
                console.log("🎤 Listening toggled")
                break
              default:
                console.log("❓ Unknown action:", data.action)
                break
            }
          } catch (actionError) {
            console.error("Error handling action:", actionError)
          }
        }
      } else {
        console.error("Failed to process voice command")
        speakResponse("Sorry, I couldn't process that command.")
      }
    } catch (error) {
      console.error("Error processing voice command:", error)
      speakResponse("Sorry, there was an error processing your command.")
    } finally {
      setIsProcessing(false)
    }
  }

  const sendMessage = async (message, imageFile = null) => {
    setIsProcessing(true)

    try {
      if (!serverConnected) {
        const mockResponse =
          "Please sign in to enable full AI functionality. Visit the sign-in page to authenticate."

        const userMessage = {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
          image: imageFile ? URL.createObjectURL(imageFile) : null,
        }
        const aiMessage = {
          role: "assistant",
          content: mockResponse,
          timestamp: new Date().toISOString(),
        }

        setChatHistory((prev) => [...prev, userMessage, aiMessage])
        setIsProcessing(false)
        return mockResponse
      }

      const formData = new FormData()
      formData.append("message", message)
      if (imageFile) {
        formData.append("image", imageFile)
      }

      formData.append("history", JSON.stringify(chatHistory))
      formData.append("execute", "true") // Enable system command execution

      const response = await authenticatedFetch(`/api/ai/chat`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()

        const userMessage = {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
          image: imageFile ? URL.createObjectURL(imageFile) : null,
        }
        const aiMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
          action: data.action,
          execution: data.execution,
          responseType: data.responseType
        }

        setChatHistory((prev) => [...prev, userMessage, aiMessage])
        return data.response
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeImage = async (imageFile) => {
    setIsProcessing(true)

    try {
      if (!serverConnected) {
        setIsProcessing(false)
        return "Please sign in to enable image analysis functionality."
      }

      // Use the chat endpoint with image for now
      const formData = new FormData()
      formData.append("message", "Please analyze this image")
      formData.append("image", imageFile)
      formData.append("execute", "true") // Enable system command execution

      const response = await authenticatedFetch(`/api/ai/chat`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.response || "Image analyzed successfully"
      } else {
        throw new Error("Failed to analyze image")
      }
    } catch (error) {
      console.error("Error analyzing image:", error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const clearChatHistory = () => {
    setChatHistory([])
  }

  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }))
  }

  useEffect(() => {
    // Don't auto-authenticate, let user choose to sign in
    // handleCurrentUser()
    console.log("🎭 User needs to sign in manually")
  }, [])

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log(
          "Available voices:",
          voices.map((v) => v.name),
        )
      }

      loadVoices()

      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speakResponse = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.name.includes("Alex") ||
          voice.name.includes("Samantha"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        console.log("🔊 Started speaking:", text.substring(0, 50) + "...")
      }

      utterance.onend = () => {
        console.log("🔇 Finished speaking")
      }

      utterance.onerror = (event) => {
        console.error("🚨 Speech synthesis error:", event.error)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      console.log("❌ Speech synthesis not supported")
    }
  }

  const toggleListening = () => {
    setShouldRestart(!shouldRestart)
    if (shouldRestart) {
      console.log("🛑 Stopping speech recognition...")
    } else {
      console.log("▶️ Starting speech recognition...")
    }
  }

  const value = {
    userData,
    setUserData,
    selectedImage,
    setSelectedImage,
    chatHistory,
    setChatHistory,
    isListening,
    isProcessing,
    speechSupported,
    isRecognitionActive,
    shouldRestart,
    serverConnected,
    serverUrl,
    handleCurrentUser,
    sendMessage,
    analyzeImage,
    clearChatHistory,
    updateUserData,
    toggleListening,
    speakResponse,
    isVoiceCommandActive: () => {
      return isRecognitionActive && speechSupported
    },
    canUseVoice: () => {
      return speechSupported && userData?.assistantName
    },
    getAssistantName: () => {
      return userData?.assistantName || "Assistant"
    },
    getLastMessage: () => {
      return chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null
    },
    getMessageCount: () => {
      return chatHistory.length
    },
    hasMessages: () => {
      return chatHistory.length > 0
    },
    hasSelectedImage: () => {
      return selectedImage !== null
    },
    clearSelectedImage: () => {
      setSelectedImage(null)
    },
    isAnyProcessing: () => {
      return isProcessing
    },
    isSpeaking: () => {
      if ("speechSynthesis" in window) {
        return window.speechSynthesis.speaking
      }
      return false
    },
    stopSpeaking: () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    },
    setVoiceSettings: (settings) => {
      updateUserData({ voiceSettings: settings })
    },
    getVoiceSettings: () => {
      return (
        userData?.voiceSettings || {
          rate: 0.9,
          pitch: 1,
          volume: 0.8,
          voice: null,
        }
      )
    },
    exportChatHistory: () => {
      return JSON.stringify(chatHistory, null, 2)
    },
    importChatHistory: (jsonString) => {
      try {
        const imported = JSON.parse(jsonString)
        if (Array.isArray(imported)) {
          setChatHistory(imported)
          return true
        }
      } catch (error) {
        console.error("Failed to import chat history:", error)
      }
      return false
    },
    speakText: (text) => speakResponse(text),
    isServerConnected: () => serverConnected,
    retryServerConnection: () => handleCurrentUser(),
    updateServerConnection: (connected) => setServerConnected(connected),
  }

  return <userDataContext.Provider value={value}>{children}</userDataContext.Provider>
}

export default UserContext
export { userDataContext as UserContext }
