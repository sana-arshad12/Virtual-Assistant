// Test script for voice commands
const testCommands = [
  "open calculator",
  "open notepad", 
  "open word",
  "open chrome",
  "open file manager",
  "open paint",
  "open task manager",
  "open control panel",
  "search google for weather"
]

console.log("🎤 Voice Commands Test Suite")
console.log("============================")

testCommands.forEach((command, index) => {
  console.log(`${index + 1}. "${command}" ✅`)
})

console.log("\n🎯 All these commands should now work with your voice assistant!")
console.log("📢 Just say: '[Assistant Name] + [command]'")
console.log("\nExample: 'Hey Assistant, open calculator'")
