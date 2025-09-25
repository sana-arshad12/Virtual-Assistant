import { spawn, exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// System commands mapping for Windows
const systemCommands = {
  'file_manager': 'explorer',
  'calculator': 'calc',
  'notepad': 'notepad',
  'command_prompt': 'cmd',
  'task_manager': 'taskmgr',
  'control_panel': 'control',
  'system_settings': 'ms-settings:',
  'paint': 'mspaint',
  'wordpad': 'write',
  'snipping_tool': 'snippingtool',
  'character_map': 'charmap'
}

// System Command Executor Controller
export const executeSystemCommand = async (req, res) => {
  try {
    const { command, parameters = {} } = req.body

    console.log('🔧 System command request:', command, parameters)

    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Command is required'
      })
    }

    let result = { success: false, message: 'Unknown command' }

    // Handle different command types
    switch (command) {
      case 'open_file_manager':
        result = await openFileManager(parameters)
        break
      
      case 'open_app':
        result = await openApplication(parameters)
        break
      
      case 'open_search':
        result = await openWebSearch(parameters)
        break
      
      case 'open_new_terminal':
        result = await openTerminal(parameters)
        break
      
      default:
        result = {
          success: false,
          message: `Command '${command}' is not supported`
        }
    }

    console.log('🔧 System command result:', result)

    res.json(result)

  } catch (error) {
    console.error('❌ System command error:', error)
    res.status(500).json({
      success: false,
      message: 'System command execution failed',
      error: error.message
    })
  }
}

// Open Windows File Manager/Explorer
async function openFileManager(parameters = {}) {
  try {
    const path = parameters.path || ''
    
    // Use Windows explorer command
    const command = path ? `explorer "${path}"` : 'explorer'
    
    await execAsync(command)
    
    return {
      success: true,
      message: `File Manager opened${path ? ` at ${path}` : ''}`,
      command: command
    }
  } catch (error) {
    console.error('❌ File Manager error:', error)
    return {
      success: false,
      message: 'Failed to open File Manager',
      error: error.message
    }
  }
}

// Open Windows Applications
async function openApplication(parameters = {}) {
  try {
    const appName = parameters.app || parameters.app_name || ''
    
    if (!appName) {
      return {
        success: false,
        message: 'Application name is required'
      }
    }

    // Map common app names to Windows commands
    const appMapping = {
      'calculator': 'calc',
      'calc': 'calc',
      'notepad': 'notepad',
      'paint': 'mspaint',
      'wordpad': 'write',
      'cmd': 'cmd',
      'command prompt': 'cmd',
      'terminal': 'cmd',
      'task manager': 'taskmgr',
      'taskmgr': 'taskmgr',
      'control panel': 'control',
      'control': 'control',
      'settings': 'ms-settings:',
      'snipping tool': 'snippingtool',
      'character map': 'charmap'
    }

    const command = appMapping[appName.toLowerCase()] || appName
    
    await execAsync(command)
    
    return {
      success: true,
      message: `${appName} opened successfully`,
      command: command
    }
  } catch (error) {
    console.error('❌ Application open error:', error)
    return {
      success: false,
      message: `Failed to open ${parameters.app || 'application'}`,
      error: error.message
    }
  }
}

// Open Web Search
async function openWebSearch(parameters = {}) {
  try {
    const query = parameters.query || parameters.search_query || 'search'
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    
    // Use Windows start command to open URL in default browser
    await execAsync(`start "" "${searchUrl}"`)
    
    return {
      success: true,
      message: `Search opened for: ${query}`,
      url: searchUrl
    }
  } catch (error) {
    console.error('❌ Web search error:', error)
    return {
      success: false,
      message: 'Failed to open web search',
      error: error.message
    }
  }
}

// Open Terminal/Command Prompt
async function openTerminal(parameters = {}) {
  try {
    const command = 'start cmd'
    
    await execAsync(command)
    
    return {
      success: true,
      message: 'Terminal opened successfully',
      command: command
    }
  } catch (error) {
    console.error('❌ Terminal open error:', error)
    return {
      success: false,
      message: 'Failed to open terminal',
      error: error.message
    }
  }
}
