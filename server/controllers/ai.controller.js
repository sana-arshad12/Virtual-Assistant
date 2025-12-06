import axios from 'axios'
import { generateAIResponse } from '../config/gemini.js'
import User from '../models/user.model.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// AI Chat Controller - Handle voice/text to AI response
export const getChatResponse = async (req, res) => {
  try {
    const userId = req.userId || 'test-user' // Allow testing without userId
    
    // Handle both JSON and FormData
    let message, messageType, history, execute
    
    if (req.is('multipart/form-data')) {
      // FormData from multer (with image)
      message = req.body.message
      messageType = req.body.messageType || 'text'
      history = req.body.history ? JSON.parse(req.body.history) : []
      execute = req.body.execute === 'true' || req.body.execute === true
      console.log('📦 Received FormData request')
    } else {
      // JSON request (text-only)
      message = req.body.message
      messageType = req.body.messageType || 'text'
      history = req.body.history || []
      execute = req.body.execute
      console.log('📝 Received JSON request')
    }

    console.log('🤖 AI Chat request from user ID:', userId)
    console.log('Message type:', messageType, 'Message:', message ? message.substring(0, 50) + '...' : 'none')

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      })
    }

    // Get user data for personalization (skip if no userId for testing)
    let user = null
    if (userId && userId !== 'test-user') {
      user = await User.findById(userId).select('name assistantName assistantImage')
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
    }

    const userName = user?.name || 'User'
    const assistantName = user?.assistantName || 'Assistant'

    console.log(`💬 Processing ${messageType} message for ${userName} with assistant ${assistantName}`)

    // Try to get AI response with better error handling
    let aiResponse, responseAnalysis
    try {
      console.log('🤖 Calling Gemini API...')
      aiResponse = await generateAIResponse(message.trim(), messageType, [])
      console.log('🤖 Gemini API response received')
      responseAnalysis = {
        type: 'general',
        action: null,
        parameters: {},
        shouldExecute: false,
        confidence: 0.8
      }
    } catch (aiError) {
      console.error('❌ Gemini API failed:', aiError.message)
      
      // Smart fallback responses based on the command
      let smartResponse = `I'm sorry, I'm having trouble connecting to my AI service right now. `
      let detectedAction = null
      let detectedParameters = {}
      let shouldExecute = false
      
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('who created you') || lowerMessage.includes('who made you')) {
        smartResponse = `I was created by Sana Arshad, a talented developer who built me as a virtual assistant. I'm here to help you with various tasks like opening applications, searching the web, and answering questions!`
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        smartResponse = `Hello ${userName}! I'm ${assistantName}, your virtual assistant. How can I help you today?`
      } else if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
        smartResponse = `I'm doing great, thank you for asking ${userName}! I'm ${assistantName}, your virtual assistant, and I'm ready to help you with anything you need. You can ask me to open applications, search the web, or just chat!`
      } else if (lowerMessage.includes('what can you do') || lowerMessage.includes('help')) {
        smartResponse = `I can help you with many things! I can open applications like calculator or notepad, search the web, tell you the time, and answer questions. Just ask me naturally - for example, say "open calculator" or "what time is it"!`
      } else if (lowerMessage.includes('time') || lowerMessage.includes('what time')) {
        smartResponse = `The current time is ${new Date().toLocaleTimeString()}.`
        detectedAction = 'get_current_time'
        shouldExecute = true
      } else if (lowerMessage.includes('date') || lowerMessage.includes('what date')) {
        smartResponse = `Today is ${new Date().toLocaleDateString()}.`
      } else if (lowerMessage.includes('weather')) {
        smartResponse = `I'd love to help you with the weather! Let me search for that information online.`
        if (lowerMessage.includes('google') || lowerMessage.includes('search')) {
          detectedAction = 'open_search'
          detectedParameters = { query: 'weather', search_engine: 'google' }
          shouldExecute = true
        }
      } else if (lowerMessage.includes('open') && lowerMessage.includes('google')) {
        smartResponse = `I'll open Google for you and search for what you requested!`
        detectedAction = 'open_search'
        const searchTerm = lowerMessage.replace(/.*google.*search.*for|.*search.*google.*for|open.*google/, '').trim()
        detectedParameters = { query: searchTerm || 'google search', search_engine: 'google' }
        shouldExecute = true
      } else if (lowerMessage.includes('calculator') || lowerMessage.includes('calc')) {
        smartResponse = `I'll open the calculator for you right away!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'calculator' }
        shouldExecute = true
      } else if (lowerMessage.includes('notepad')) {
        smartResponse = `Opening Notepad for you now!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'notepad' }
        shouldExecute = true
      } else if (lowerMessage.includes('word') || lowerMessage.includes('microsoft word')) {
        smartResponse = `I'll open Microsoft Word for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'word' }
        shouldExecute = true
      } else if (lowerMessage.includes('excel') || lowerMessage.includes('microsoft excel')) {
        smartResponse = `Opening Microsoft Excel for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'excel' }
        shouldExecute = true
      } else if (lowerMessage.includes('powerpoint') || lowerMessage.includes('microsoft powerpoint') || lowerMessage.includes('power point')) {
        smartResponse = `I'll open Microsoft PowerPoint for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'powerpoint' }
        shouldExecute = true
      } else if (lowerMessage.includes('whatsapp') || lowerMessage.includes('whats app')) {
        smartResponse = `Opening WhatsApp for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'whatsapp' }
        shouldExecute = true
      } else if (lowerMessage.includes('chrome') || lowerMessage.includes('google chrome')) {
        smartResponse = `I'll open Google Chrome for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'chrome' }
        shouldExecute = true
      } else if (lowerMessage.includes('firefox') || lowerMessage.includes('mozilla firefox')) {
        smartResponse = `Opening Mozilla Firefox for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'firefox' }
        shouldExecute = true
      } else if (lowerMessage.includes('edge') || lowerMessage.includes('microsoft edge')) {
        smartResponse = `I'll open Microsoft Edge for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'edge' }
        shouldExecute = true
      } else if (lowerMessage.includes('paint') || lowerMessage.includes('mspaint')) {
        smartResponse = `Opening Paint for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'paint' }
        shouldExecute = true
      } else if (lowerMessage.includes('skype')) {
        smartResponse = `I'll open Skype for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'skype' }
        shouldExecute = true
      } else if (lowerMessage.includes('discord')) {
        smartResponse = `Opening Discord for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'discord' }
        shouldExecute = true
      } else if (lowerMessage.includes('zoom')) {
        smartResponse = `I'll open Zoom for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'zoom' }
        shouldExecute = true
      } else if (lowerMessage.includes('spotify')) {
        smartResponse = `Opening Spotify for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'spotify' }
        shouldExecute = true
      } else if (lowerMessage.includes('vlc') || lowerMessage.includes('vlc player')) {
        smartResponse = `I'll open VLC Media Player for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'vlc' }
        shouldExecute = true
      } else if (lowerMessage.includes('steam')) {
        smartResponse = `Opening Steam for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'steam' }
        shouldExecute = true
      } else if (lowerMessage.includes('visual studio') || lowerMessage.includes('vs code') || lowerMessage.includes('vscode')) {
        smartResponse = `I'll open Visual Studio Code for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'vscode' }
        shouldExecute = true
      } else if (lowerMessage.includes('photoshop') || lowerMessage.includes('adobe photoshop')) {
        smartResponse = `Opening Adobe Photoshop for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'photoshop' }
        shouldExecute = true
      } else if (lowerMessage.includes('file manager') || lowerMessage.includes('explorer')) {
        smartResponse = `I'll open the file manager for you!`
        detectedAction = 'open_file_manager'
        detectedParameters = { path: 'default' }
        shouldExecute = true
      } else if (lowerMessage.includes('cmd') || lowerMessage.includes('command prompt') || lowerMessage.includes('terminal')) {
        smartResponse = `I'll open the command prompt for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'cmd' }
        shouldExecute = true
      } else if (lowerMessage.includes('task manager') || lowerMessage.includes('taskmgr')) {
        smartResponse = `Opening Task Manager for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'taskmgr' }
        shouldExecute = true
      } else if (lowerMessage.includes('control panel')) {
        smartResponse = `I'll open Control Panel for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'control' }
        shouldExecute = true
      } else if (lowerMessage.includes('settings') || lowerMessage.includes('windows settings')) {
        smartResponse = `Opening Windows Settings for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'settings' }
        shouldExecute = true
      } else if (lowerMessage.includes('device manager')) {
        smartResponse = `I'll open Device Manager for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'devmgmt' }
        shouldExecute = true
      } else if (lowerMessage.includes('registry editor') || lowerMessage.includes('regedit')) {
        smartResponse = `Opening Registry Editor for you! Please be careful when making changes.`
        detectedAction = 'open_app'
        detectedParameters = { app: 'regedit' }
        shouldExecute = true
      } else if (lowerMessage.includes('run') || lowerMessage.includes('run dialog')) {
        smartResponse = `Opening the Run dialog for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'run' }
        shouldExecute = true
      } else if (lowerMessage.includes('screenshot') || lowerMessage.includes('snipping tool')) {
        smartResponse = `I'll open the Snipping Tool for you to take a screenshot!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'snippingtool' }
        shouldExecute = true
      } else if (lowerMessage.includes('character map') || lowerMessage.includes('charmap')) {
        smartResponse = `Opening Character Map for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'charmap' }
        shouldExecute = true
      } else if (lowerMessage.includes('system information') || lowerMessage.includes('msinfo32')) {
        smartResponse = `I'll open System Information for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'msinfo32' }
        shouldExecute = true
      } else if (lowerMessage.includes('event viewer') || lowerMessage.includes('eventvwr')) {
        smartResponse = `Opening Event Viewer for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'eventvwr' }
        shouldExecute = true
      } else if (lowerMessage.includes('services') || lowerMessage.includes('services.msc')) {
        smartResponse = `I'll open Services for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'services' }
        shouldExecute = true
      } else if (lowerMessage.includes('disk cleanup') || lowerMessage.includes('cleanmgr')) {
        smartResponse = `Opening Disk Cleanup for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'cleanmgr' }
        shouldExecute = true
      } else if (lowerMessage.includes('windows update') || lowerMessage.includes('update settings')) {
        smartResponse = `I'll open Windows Update settings for you!`
        detectedAction = 'open_app'
        detectedParameters = { app: 'windowsupdate' }
        shouldExecute = true
      } else {
        smartResponse += `However, I heard you say "${message}". Let me try to help with that using my basic capabilities.`
      }
      
      console.log(`🎯 Detected action: ${detectedAction}, shouldExecute: ${shouldExecute}`)
      
      // Fallback response when Gemini fails
      aiResponse = {
        response: smartResponse,
        responseType: 'general',
        action: detectedAction,
        parameters: detectedParameters,
        shouldExecute: shouldExecute,
        confidence: 0.7
      }
      
      responseAnalysis = {
        type: 'general',
        action: detectedAction,
        parameters: detectedParameters,
        shouldExecute: shouldExecute,
        confidence: 0.7
      }
    }

    // Create chat entry for history
    const chatEntry = {
      userMessage: message.trim(),
      aiResponse: aiResponse.response || aiResponse,
      messageType,
      responseType: responseAnalysis.type || 'general',
      action: responseAnalysis.action,
      parameters: responseAnalysis.parameters,
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

    // System command execution using Node.js child_process
    let execution = null
    const shouldExecute = Boolean(responseAnalysis.shouldExecute)
    const executeRequested = req.body.execute === true || req.body.execute === 'true'
    console.log(`🔧 Execute parameters - shouldExecute: ${shouldExecute}, executeRequested: ${executeRequested}, req.body.execute: ${req.body.execute}`)
    
    if (executeRequested && shouldExecute && responseAnalysis.action) {
      try {
        console.log(`🔧 Executing system command: ${responseAnalysis.action}`)
        
        let command = ''
        if (responseAnalysis.action === 'open_file_manager') {
          command = 'explorer.exe'
        } else if (responseAnalysis.action === 'open_search') {
          const query = responseAnalysis.parameters?.query || 'weather'
          command = `start https://www.google.com/search?q=${encodeURIComponent(query)}`
        } else if (responseAnalysis.action === 'open_calculator') {
          command = 'calc.exe'
        } else if (responseAnalysis.action === 'open_notepad') {
          command = 'notepad.exe'
        } else if (responseAnalysis.action === 'open_app' && responseAnalysis.parameters?.app) {
          const app = responseAnalysis.parameters.app.toLowerCase()
          
          // Handle special case for run dialog (Windows + R)
          if (app === 'run') {
            // Use PowerShell to send Windows+R key combination
            command = 'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^{ESC}\'); Start-Sleep -Milliseconds 100; [System.Windows.Forms.SendKeys]::SendWait(\'^r\')"'
          } else {
            // Map application names to their executable commands
            const appCommands = {
            'calculator': 'calc.exe',
            'calc': 'calc.exe',
            'notepad': 'notepad.exe',
            'word': 'start winword.exe',
            'excel': 'start excel.exe',
            'powerpoint': 'start powerpnt.exe',
            'whatsapp': 'start shell:AppsFolder\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App',
            'chrome': 'start chrome.exe',
            'firefox': 'start firefox.exe',
            'edge': 'start msedge.exe',
            'paint': 'mspaint.exe',
            'skype': 'start shell:AppsFolder\\Microsoft.SkypeApp_kzf8qxf38zg5c!App',
            'discord': 'start shell:AppsFolder\\Discord.Discord_ncrqdemuxvp20!Discord',
            'zoom': 'start shell:AppsFolder\\ZoomVideoSolutions.ZoomMeetings_ncrqdemuxvp20!Zoom',
            'spotify': 'start shell:AppsFolder\\SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify',
            'vlc': 'start vlc.exe',
            'steam': 'start steam://open/main',
            'vscode': 'start code.exe',
            'photoshop': 'start photoshop.exe',
            'cmd': 'start cmd.exe',
            'taskmgr': 'taskmgr.exe',
            'control': 'control.exe',
            'settings': 'start ms-settings:',
            'devmgmt': 'devmgmt.msc',
            'regedit': 'regedit.exe',
            'run': 'start shell:AppsFolder\\windows.immersivecontrolpanel_cw5n1h2txyewy!microsoft.windows.immersivecontrolpanel',
            'snippingtool': 'snippingtool.exe',
            'charmap': 'charmap.exe',
            'msinfo32': 'msinfo32.exe',
            'eventvwr': 'eventvwr.msc',
            'services': 'services.msc',
            'cleanmgr': 'cleanmgr.exe',
            'windowsupdate': 'start ms-settings:windowsupdate'
          }
          
          command = appCommands[app] || `start ${app}.exe`
          }
        }

        if (command) {
          console.log(`⚡ Running command: ${command}`)
          await execAsync(command)
          execution = { 
            success: true, 
            message: `Successfully executed: ${responseAnalysis.action}`,
            command: command
          }
          console.log(`✅ System command executed successfully: ${responseAnalysis.action}`)
        } else {
          execution = { 
            success: false, 
            error: `Unknown action: ${responseAnalysis.action}` 
          }
        }
      } catch (execErr) {
        console.log('⚠️ System command execution failed:', execErr.message)
        execution = { success: false, error: execErr.message }
      }
    }

    console.log('✅ AI response processed successfully')
    console.log(`🎯 Final response data: action=${responseAnalysis.action}, shouldExecute=${shouldExecute}`)

    res.status(200).json({
      success: true,
      message: 'AI response generated successfully',
      response: typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || aiResponse),
      responseType: responseAnalysis.type || 'general',
      action: responseAnalysis.action || null,
      parameters: responseAnalysis.parameters || {},
      confidence: responseAnalysis.confidence || 0.5,
      followUp: null,
      shouldExecute,
      execution,
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
