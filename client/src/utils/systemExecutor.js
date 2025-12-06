// Automatic System Command Executor - Complete App Opening System

const SYSTEM_API_URL = import.meta.env.VITE_SYSTEM_SERVER_URL || 'http://localhost:8001'

// Comprehensive list of all supported applications
export const SUPPORTED_APPS = {
  // System Apps
  calculator: { name: 'Calculator', command: 'calculator' },
  notepad: { name: 'Notepad', command: 'notepad' },
  paint: { name: 'Paint', command: 'paint' },
  wordpad: { name: 'WordPad', command: 'wordpad' },
  cmd: { name: 'Command Prompt', command: 'cmd' },
  powershell: { name: 'PowerShell', command: 'powershell' },
  taskManager: { name: 'Task Manager', command: 'task manager' },
  controlPanel: { name: 'Control Panel', command: 'control panel' },
  settings: { name: 'Settings', command: 'settings' },
  snippingTool: { name: 'Snipping Tool', command: 'snipping tool' },
  
  // Microsoft Office
  word: { name: 'Microsoft Word', command: 'word' },
  excel: { name: 'Microsoft Excel', command: 'excel' },
  powerpoint: { name: 'PowerPoint', command: 'powerpoint' },
  outlook: { name: 'Outlook', command: 'outlook' },
  
  // Web Browsers
  chrome: { name: 'Google Chrome', command: 'chrome' },
  edge: { name: 'Microsoft Edge', command: 'edge' },
  firefox: { name: 'Firefox', command: 'firefox' },
  brave: { name: 'Brave', command: 'brave' },
  opera: { name: 'Opera', command: 'opera' },
  
  // Code Editors
  vscode: { name: 'VS Code', command: 'vscode' },
  notepadPlusPlus: { name: 'Notepad++', command: 'notepad++' },
  sublimeText: { name: 'Sublime Text', command: 'sublime text' },
  atom: { name: 'Atom', command: 'atom' },
  
  // Media & Communication
  spotify: { name: 'Spotify', command: 'spotify' },
  vlc: { name: 'VLC Player', command: 'vlc' },
  discord: { name: 'Discord', command: 'discord' },
  slack: { name: 'Slack', command: 'slack' },
  zoom: { name: 'Zoom', command: 'zoom' },
  teams: { name: 'Microsoft Teams', command: 'teams' },
  skype: { name: 'Skype', command: 'skype' },
  
  // File Management
  fileExplorer: { name: 'File Explorer', command: 'explorer' },
  
  // Gaming & Design
  steam: { name: 'Steam', command: 'steam' },
  epicGames: { name: 'Epic Games', command: 'epic games' },
  photoshop: { name: 'Adobe Photoshop', command: 'photoshop' },
  obs: { name: 'OBS Studio', command: 'obs' },
  gimp: { name: 'GIMP', command: 'gimp' },
  blender: { name: 'Blender', command: 'blender' },
  
  // Development Tools
  git: { name: 'Git Bash', command: 'git bash' }
}

// Show notification
const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div')
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  }
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
  `
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  notification.innerHTML = `${icons[type] || icons.info} ${message}`
  document.body.appendChild(notification)
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in'
      setTimeout(() => document.body.removeChild(notification), 300)
    }
  }, 5000)
}

// Execute system command automatically
export const executeSystemCommand = async (action, parameters = {}) => {
  console.log('🚀 Executing system command:', action, parameters)
  
  try {
    const response = await fetch(`${SYSTEM_API_URL}/api/system/execute`, {
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
    
    if (result.success) {
      showNotification(result.message, 'success')
    } else {
      showNotification(result.message || 'Command failed', 'error')
    }
    
    return result
    
  } catch (error) {
    console.error('❌ System command error:', error)
    showNotification(`System command failed: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Open any application by name
export const openApp = async (appName) => {
  return await executeSystemCommand('open_app', { app: appName })
}

// Open file manager/explorer
export const openFileManager = async (path = '') => {
  return await executeSystemCommand('open_file_manager', { path })
}

// Open web search
export const openWebSearch = async (query) => {
  return await executeSystemCommand('open_search', { query })
}

// Open terminal
export const openTerminal = async () => {
  return await executeSystemCommand('open_new_terminal', {})
}

// Quick app launchers for common apps
export const quickLaunch = {
  calculator: () => openApp('calculator'),
  notepad: () => openApp('notepad'),
  paint: () => openApp('paint'),
  chrome: () => openApp('chrome'),
  edge: () => openApp('edge'),
  firefox: () => openApp('firefox'),
  vscode: () => openApp('vscode'),
  word: () => openApp('word'),
  excel: () => openApp('excel'),
  powerpoint: () => openApp('powerpoint'),
  outlook: () => openApp('outlook'),
  spotify: () => openApp('spotify'),
  vlc: () => openApp('vlc'),
  discord: () => openApp('discord'),
  slack: () => openApp('slack'),
  zoom: () => openApp('zoom'),
  teams: () => openApp('teams'),
  taskManager: () => openApp('task manager'),
  controlPanel: () => openApp('control panel'),
  settings: () => openApp('settings'),
  fileExplorer: () => openFileManager(),
  terminal: () => openTerminal(),
  cmd: () => openApp('cmd'),
  powershell: () => openApp('powershell')
}

// Auto-detect app from user intent
export const autoOpenApp = async (userInput) => {
  const input = userInput.toLowerCase()
  
  // Search for matching app
  for (const [key, app] of Object.entries(SUPPORTED_APPS)) {
    if (input.includes(app.command.toLowerCase()) || 
        input.includes(app.name.toLowerCase()) ||
        input.includes(key.toLowerCase())) {
      console.log(`🎯 Auto-detected app: ${app.name}`)
      return await openApp(app.command)
    }
  }
  
  return { success: false, message: 'No matching application found' }
}

export default {
  executeSystemCommand,
  openApp,
  openFileManager,
  openWebSearch,
  openTerminal,
  quickLaunch,
  autoOpenApp,
  SUPPORTED_APPS
}
