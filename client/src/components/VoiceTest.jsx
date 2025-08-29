import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/UserContext'

const VoiceTest = () => {
    const {
        isListening,
        isProcessing,
        speechSupported,
        startVoiceRecognition,
        stopVoiceRecognition,
        speakText
    } = useContext(UserContext)

    const testVoice = () => {
        speakText("Hello! I am your virtual assistant. Voice recognition is working perfectly!")
    }

    const testCommand = () => {
        speakText("Opening a new tab for you")
        setTimeout(() => {
            window.open('about:blank', '_blank')
        }, 1000)
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Voice Assistant Test</h2>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                    Speech Support: {speechSupported ? '✅ Yes' : '❌ No'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                    Listening: {isListening ? '🎤 Yes' : '⏸️ No'}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    Processing: {isProcessing ? '⚙️ Yes' : '✅ Ready'}
                </p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={testVoice}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    🗣️ Test Voice Output
                </button>

                <button
                    onClick={testCommand}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                    🌐 Test New Tab Command
                </button>

                <button
                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                    className={`w-full px-4 py-2 rounded transition ${
                        isListening 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                    disabled={!speechSupported}
                >
                    {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
                </button>
            </div>

            {isListening && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        🎤 Listening... Try saying:
                        <br />• "Open new tab"
                        <br />• "Hello assistant"
                        <br />• "How are you?"
                    </p>
                </div>
            )}

            {isProcessing && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                        ⚙️ Processing your command...
                    </p>
                </div>
            )}
        </div>
    )
}

export default VoiceTest
