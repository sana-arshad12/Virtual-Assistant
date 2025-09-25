// Quick test of Gemini API without server
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

async function testGemini() {
    console.log('🧪 Testing Gemini API directly...')
    
    try {
        // Check API key
        const apiKey = process.env.GEMINI_API_KEY
        console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')
        
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in .env file')
        }
        
        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey)
        console.log('✅ GoogleGenerativeAI initialized')
        
        // Get model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        console.log('✅ Model obtained')
        
        // Test simple prompt
        console.log('📤 Sending test prompt...')
        const result = await model.generateContent('Say hello in a friendly way')
        console.log('✅ Response received')
        
        const response = await result.response
        const text = response.text()
        
        console.log('🎉 SUCCESS! Gemini response:', text)
        return true
        
    } catch (error) {
        console.error('❌ GEMINI TEST FAILED:', {
            name: error.name,
            message: error.message,
            code: error.code,
            details: error.details
        })
        return false
    }
}

testGemini().then(success => {
    console.log(`\n${success ? '🎉 GEMINI API IS WORKING!' : '❌ GEMINI API FAILED'}\n`)
    process.exit(success ? 0 : 1)
})
