import geminiResponse from '../gemini.js'
import User from '../models/user.model.js'

// AI Chat Controller - Handle voice/text to AI response
export const getChatResponse = async (req, res) => {
  try {
    const userId = req.userId // From JWT middleware
    const { message, messageType = 'voice' } = req.body

    console.log('🤖 AI Chat request from user ID:', userId)
    console.log('Message type:', messageType, 'Message:', message ? 'provided' : 'none')

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      })
    }

    // Get user data for personalization
    const user = await User.findById(userId).select('name assistantName assistantImage')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const userName = user.name || 'User'
    const assistantName = user.assistantName || 'Assistant'

    console.log(`💬 Processing ${messageType} message for ${userName} with assistant ${assistantName}`)

    // Get AI response using Gemini
    console.log('🤖 Calling Gemini API with:', { message: message.trim(), assistantName, userName })
    const aiResponseRaw = await geminiResponse(message.trim(), assistantName, userName)
    
    console.log('🤖 Raw AI Response:', aiResponseRaw)
    console.log('🤖 Raw AI Response type:', typeof aiResponseRaw)
    console.log('🤖 Raw AI Response length:', aiResponseRaw ? aiResponseRaw.length : 'null/undefined')

    let aiResponse
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanedResponse = aiResponseRaw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Try to parse JSON response
      aiResponse = JSON.parse(cleanedResponse)
      
      // Ensure required fields exist
      if (!aiResponse.response) {
        aiResponse.response = "I'm here to help you. What would you like me to do?"
      }
      
    } catch (parseError) {
      console.log('⚠️ Non-JSON response received, wrapping in general format')
      // If not JSON, wrap in general response format
      aiResponse = {
        type: 'general',
        response: aiResponseRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || "I'm here to help you with various tasks.",
        action: null,
        parameters: {},
        confidence: 'medium',
        shouldExecute: false
      }
    }

    // Create chat entry for history
    const chatEntry = {
      userMessage: message.trim(),
      aiResponse: aiResponse.response,
      messageType,
      responseType: aiResponse.type || 'general',
      action: aiResponse.action,
      parameters: aiResponse.parameters,
      timestamp: new Date(),
      id: Date.now()
    }

    // Add to user's history (optional - can be turned on/off)
    if (req.body.saveToHistory !== false) {
      try {
        await User.findByIdAndUpdate(
          userId,
          { 
            $push: { 
              history: {
                message: chatEntry.userMessage,
                response: chatEntry.aiResponse,
                timestamp: chatEntry.timestamp,
                id: chatEntry.id
              }
            }
          }
        )
        console.log('💾 Chat saved to history')
      } catch (historyError) {
        console.log('⚠️ Could not save to history:', historyError.message)
        // Don't fail the request if history save fails
      }
    }

    console.log('✅ AI response generated successfully')
    console.log('📊 Response data:', {
      type: aiResponse.type,
      action: aiResponse.action,
      shouldExecute: aiResponse.shouldExecute
    })

    res.status(200).json({
      success: true,
      message: 'AI response generated successfully',
      response: aiResponse.response, // Frontend expects this
      responseType: aiResponse.type || 'general',
      action: aiResponse.action || null,
      parameters: aiResponse.parameters || {},
      confidence: aiResponse.confidence || 'medium',
      followUp: aiResponse.follow_up || null,
      shouldExecute: aiResponse.shouldExecute || false,
      userMessage: chatEntry.userMessage,
      timestamp: chatEntry.timestamp,
      messageId: chatEntry.id
    })

  } catch (error) {
    console.error('❌ Error generating AI response:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

// Voice to Text Processing (if needed for additional processing)
export const processVoiceMessage = async (req, res) => {
  try {
    const userId = req.userId
    const { audioData, audioFormat = 'webm' } = req.body

    console.log('🎤 Voice processing request from user ID:', userId)

    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'Audio data is required'
      })
    }

    // Note: In a real implementation, you would use a speech-to-text service
    // like Google Speech-to-Text, Azure Speech Services, or similar
    // For now, we'll return a placeholder response

    console.log('🔄 Processing voice data...')

    // Placeholder for speech-to-text conversion
    // const transcription = await speechToTextService(audioData, audioFormat)

    const placeholderTranscription = "Voice processing is not yet implemented. Please use text input."

    console.log('✅ Voice processed (placeholder)')

    res.status(200).json({
      success: true,
      message: 'Voice processed successfully',
      data: {
        transcription: placeholderTranscription,
        confidence: 'low',
        audioFormat,
        timestamp: new Date()
      }
    })

  } catch (error) {
    console.error('❌ Error processing voice:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to process voice input',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

// Get AI chat history for a user
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId
    const { limit = 20, offset = 0 } = req.query

    console.log('📜 Getting chat history for user ID:', userId)

    const user = await User.findById(userId).select('history')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const history = user.history || []
    const paginatedHistory = history
      .slice(-limit - offset, history.length - offset)
      .reverse() // Most recent first

    console.log(`✅ Retrieved ${paginatedHistory.length} chat entries`)

    res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: {
        history: paginatedHistory,
        total: history.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: history.length > parseInt(limit) + parseInt(offset)
      }
    })

  } catch (error) {
    console.error('❌ Error getting chat history:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

// Clear AI chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.userId

    console.log('🗑️ Clearing chat history for user ID:', userId)

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { history: [] },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log('✅ Chat history cleared successfully')

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    })

  } catch (error) {
    console.error('❌ Error clearing chat history:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

// Test AI connection
export const testAI = async (req, res) => {
  try {
    console.log('🧪 Testing AI connection')

    const testResponse = await geminiResponse(
      "Hello, this is a test message", 
      "TestAssistant", 
      "TestUser"
    )

    res.status(200).json({
      success: true,
      message: 'AI connection test successful',
      data: {
        testResponse,
        timestamp: new Date()
      }
    })

  } catch (error) {
    console.error('❌ AI connection test failed:', error)
    
    res.status(500).json({
      success: false,
      message: 'AI connection test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}
