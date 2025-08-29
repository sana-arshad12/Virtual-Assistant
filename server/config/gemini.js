import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Enhanced system prompt for comprehensive virtual assistant capabilities
const SYSTEM_PROMPT = `You are an advanced virtual assistant with comprehensive capabilities. Your personality and responses should be:

**CORE PERSONALITY:**
- Professional yet friendly and approachable
- Highly knowledgeable across multiple domains
- Proactive in offering help and suggestions
- Adaptable to user's communication style and preferences
- Always helpful, never dismissive or condescending

**CAPABILITIES & RESPONSE TYPES:**
1. **GENERAL QUERIES** (general) - Answer questions, provide information, have conversations
2. **SYSTEM OPERATIONS** (system_command) - File management, system settings, app control
3. **COMMUNICATION** (communication) - Email, messaging, social media assistance
4. **FILE OPERATIONS** (file_operation) - Create, edit, organize files and folders
5. **APP CONTROL** (app_control) - Launch, close, switch between applications
6. **PRODUCTIVITY** (productivity) - Scheduling, reminders, task management
7. **CREATIVE** (creative) - Writing, brainstorming, design assistance
8. **TECHNICAL** (technical) - Coding, troubleshooting, technical explanations

**RESPONSE FORMATTING:**
- Always respond in a clear, conversational manner
- Provide actionable information when possible
- Ask clarifying questions if the user's request is ambiguous
- Suggest related actions or follow-up tasks when appropriate
- For system commands, describe what will happen before executing

**SYSTEM INTEGRATION EXAMPLES:**
- "Open file manager" → responseType: "system_command", action: "open_file_manager"
- "Send WhatsApp to John: Hello" → responseType: "communication", action: "send_whatsapp", parameters: {contact: "John", message: "Hello"}
- "Create a new folder called Projects" → responseType: "file_operation", action: "create_folder", parameters: {name: "Projects", location: "current"}
- "Open Chrome browser" → responseType: "app_control", action: "open_app", parameters: {app: "chrome"}

**VOICE INTERACTION:**
- When processing voice input, confirm understanding: "I heard you say [transcript]. Let me help with that."
- Be more conversational and natural for voice responses
- Provide verbal confirmations for actions taken

**IMPORTANT GUIDELINES:**
- Always be helpful and supportive
- Maintain user privacy and security
- If you cannot perform a system action, explain why and suggest alternatives
- Learn from user preferences and adapt accordingly
- Be proactive in suggesting useful features or shortcuts

Remember: You are not just answering questions - you are a comprehensive digital assistant capable of helping with both digital tasks and providing intelligent conversation.`

// Get model with system prompt
export const getAIModel = () => {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
    })
    return model
}

// Generate AI response with context
export const generateAIResponse = async (userMessage, messageType = 'text', chatHistory = []) => {
    try {
        const model = getAIModel()
        
        // Build conversation context
        let conversationContext = ""
        if (chatHistory && chatHistory.length > 0) {
            const recentHistory = chatHistory.slice(-5) // Last 5 messages for context
            conversationContext = recentHistory.map(chat => 
                `User: ${chat.message}\nAssistant: ${chat.response}`
            ).join('\n\n')
        }

        // Prepare the prompt
        let prompt = ""
        
        if (messageType === 'voice') {
            prompt = `[VOICE INPUT] User said: "${userMessage}"\n\n`
        } else {
            prompt = `User: ${userMessage}\n\n`
        }

        if (conversationContext) {
            prompt = `Previous conversation:\n${conversationContext}\n\n${prompt}`
        }

        prompt += `Please provide a helpful response and categorize it with the appropriate responseType. If this requires a system action, specify the action and parameters.`

        // Generate response
        const result = await model.generateContent(prompt)
        const response = await result.response
        let aiResponse = response.text()

        // Analyze response type and extract actions
        const responseAnalysis = await analyzeResponse(aiResponse, userMessage)
        
        return {
            response: aiResponse,
            responseType: responseAnalysis.type,
            action: responseAnalysis.action,
            parameters: responseAnalysis.parameters,
            confidence: responseAnalysis.confidence
        }

    } catch (error) {
        console.error('Gemini AI Error:', error)
        throw new Error('Failed to generate AI response')
    }
}

// Analyze response to determine type and actions
const analyzeResponse = async (aiResponse, userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    const lowerResponse = aiResponse.toLowerCase()

    // Define patterns for different response types
    const patterns = {
        system_command: [
            'open file', 'file manager', 'explorer', 'system settings', 'control panel',
            'task manager', 'registry', 'command prompt', 'cmd', 'powershell'
        ],
        communication: [
            'send email', 'whatsapp', 'telegram', 'sms', 'message', 'call', 'contact',
            'social media', 'facebook', 'twitter', 'instagram', 'linkedin'
        ],
        file_operation: [
            'create file', 'create folder', 'delete file', 'rename', 'move file',
            'copy file', 'save document', 'new document', 'organize files'
        ],
        app_control: [
            'open app', 'launch', 'start program', 'close app', 'switch to',
            'browser', 'chrome', 'firefox', 'notepad', 'calculator', 'music'
        ],
        productivity: [
            'schedule', 'reminder', 'calendar', 'meeting', 'appointment',
            'todo', 'task', 'note', 'deadline'
        ],
        creative: [
            'write', 'story', 'poem', 'design', 'create', 'brainstorm',
            'ideas', 'creative', 'art', 'drawing'
        ],
        technical: [
            'code', 'programming', 'debug', 'error', 'fix', 'install',
            'troubleshoot', 'configuration', 'setup'
        ]
    }

    // Check for specific actions
    let detectedAction = null
    let parameters = {}
    let responseType = 'general'
    let confidence = 0.5

    // Analyze message for specific patterns
    for (const [type, keywords] of Object.entries(patterns)) {
        const matchCount = keywords.filter(keyword => lowerMessage.includes(keyword)).length
        if (matchCount > 0) {
            responseType = type
            confidence = Math.min(0.9, 0.5 + (matchCount * 0.2))
            break
        }
    }

    // Extract specific actions and parameters
    if (lowerMessage.includes('open file manager') || lowerMessage.includes('file explorer')) {
        detectedAction = 'open_file_manager'
        responseType = 'system_command'
    } else if (lowerMessage.includes('whatsapp')) {
        detectedAction = 'send_whatsapp'
        responseType = 'communication'
        // Try to extract contact and message
        const whatsappMatch = lowerMessage.match(/whatsapp.*?(?:to|send)\s+([^:]+):\s*(.+)/)
        if (whatsappMatch) {
            parameters = {
                contact: whatsappMatch[1].trim(),
                message: whatsappMatch[2].trim()
            }
        }
    } else if (lowerMessage.includes('send email')) {
        detectedAction = 'send_email'
        responseType = 'communication'
    } else if (lowerMessage.includes('open') && (lowerMessage.includes('app') || lowerMessage.includes('program'))) {
        detectedAction = 'open_app'
        responseType = 'app_control'
        // Extract app name
        const appMatch = lowerMessage.match(/open\s+([a-zA-Z\s]+?)(?:\s+app|\s+program|$)/)
        if (appMatch) {
            parameters = { app: appMatch[1].trim() }
        }
    }

    return {
        type: responseType,
        action: detectedAction,
        parameters: Object.keys(parameters).length > 0 ? parameters : null,
        confidence
    }
}

export default { getAIModel, generateAIResponse }
