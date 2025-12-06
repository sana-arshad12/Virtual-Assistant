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

    // Check if running on Vercel (serverless environment)
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

    if (isServerless) {
      return res.status(200).json({
        success: false,
        message: 'System commands are not available in cloud deployments. This feature only works on your local device where the app has system access.',
        tip: 'To use system commands like opening file manager or applications, please run this application locally on your device.',
        availableOnline: [
          'AI chat responses',
          'Web searches',
          'Information lookup',
          'General assistance'
        ]
      })
    }

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

    // Dynamic app mapping - Uses Windows 'start' command and protocol handlers
    // No hardcoded paths - relies on system PATH and Windows registry associations
    const appMapping = {
      // System Apps (built-in Windows commands)
      'calculator': 'calc',
      'calc': 'calc',
      'notepad': 'notepad',
      'paint': 'mspaint',
      'wordpad': 'write',
      'cmd': 'cmd',
      'command prompt': 'cmd',
      'powershell': 'powershell',
      'terminal': 'cmd',
      'task manager': 'taskmgr',
      'taskmgr': 'taskmgr',
      'control panel': 'control',
      'control': 'control',
      'settings': 'ms-settings:',
      'snipping tool': 'snippingtool',
      'character map': 'charmap',
      'registry editor': 'regedit',
      'regedit': 'regedit',
      
      // Microsoft Office (uses 'start' command to find via Windows associations)
      'word': 'start winword',
      'microsoft word': 'start winword',
      'excel': 'start excel',
      'microsoft excel': 'start excel',
      'powerpoint': 'start powerpnt',
      'microsoft powerpoint': 'start powerpnt',
      'outlook': 'start outlook',
      'microsoft outlook': 'start outlook',
      
      // Web Browsers (uses protocol handlers and 'start' command)
      'chrome': 'start chrome',
      'google chrome': 'start chrome',
      'edge': 'start msedge',
      'microsoft edge': 'start msedge',
      'firefox': 'start firefox',
      'mozilla firefox': 'start firefox',
      'brave': 'start brave',
      'opera': 'start opera',
      
      // Code Editors (relies on PATH environment variable)
      'vscode': 'code',
      'visual studio code': 'code',
      'vs code': 'code',
      'notepad++': 'start notepad++',
      'sublime text': 'start sublime_text',
      'atom': 'start atom',
      
      // Media Players (uses 'start' command for Windows associations)
      'spotify': 'start spotify',
      'vlc': 'start vlc',
      'vlc player': 'start vlc',
      'windows media player': 'wmplayer',
      'media player': 'wmplayer',
      
      // Communication Apps (uses protocol handlers)
      'discord': 'start discord',
      'slack': 'start slack',
      'zoom': 'start zoom',
      'teams': 'start ms-teams:',
      'microsoft teams': 'start ms-teams:',
      'skype': 'start skype',
      
      // File Management
      'explorer': 'explorer',
      'file manager': 'explorer',
      'file explorer': 'explorer',
      'this pc': 'explorer',
      
      // Gaming & Design (uses 'start' command)
      'steam': 'start steam',
      'epic games': 'start com.epicgames.launcher:',
      'photoshop': 'start photoshop',
      'adobe photoshop': 'start photoshop',
      'obs': 'start obs64',
      'obs studio': 'start obs64',
      'gimp': 'start gimp',
      'blender': 'start blender',
      
      // Development Tools
      'git': 'start git-bash',
      'git bash': 'start git-bash'
    }

    const command = appMapping[appName.toLowerCase()] || `start ${appName}`
    
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
