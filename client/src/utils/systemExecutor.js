// Automatic System Command Executor - Add to UserContext.jsx

const executeSystemCommandAutomatically = async (action, parameters = {}) => {
    console.log('🚀 AUTOMATIC EXECUTION:', action, parameters)
    
    try {
        const response = await fetch('http://localhost:8001/api/system/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command: action,
                parameters: parameters
            })
        })
        
        const result = await response.json()
        
        // Show result notification
        const notification = document.createElement('div')
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${result.success ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `
        
        if (result.success) {
            notification.innerHTML = `✅ ${result.message}`
        } else {
            notification.innerHTML = `❌ ${result.message || 'Command failed'}`
        }
        
        document.body.appendChild(notification)
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification)
            }
        }, 5000)
        
        return result
        
    } catch (error) {
        console.error('❌ System command error:', error)
        
        // Show error notification
        const notification = document.createElement('div')
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `
        notification.innerHTML = `⚠️ System command failed<br><small>${error.message}</small>`
        document.body.appendChild(notification)
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification)
            }
        }, 6000)
        
        return { success: false, error: error.message }
    }
}

// Replace the file manager case with:
/*
case 'open_file_manager':
    await executeSystemCommandAutomatically('open_file_manager', parameters)
    break
*/
