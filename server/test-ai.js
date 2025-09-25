import geminiResponse from './gemini.js';
import dotenv from 'dotenv';

dotenv.config();

const testAI = async () => {
    try {
        console.log('Testing AI with time query...');
        const response = await geminiResponse("what's the time now?", "neelam", "Handa");
        console.log('AI Response:', response);
        
        console.log('\nTesting AI with terminal command...');
        const response2 = await geminiResponse("open new terminal", "neelam", "Handa");
        console.log('AI Response 2:', response2);
    } catch (error) {
        console.error('Error:', error);
    }
};

testAI();
