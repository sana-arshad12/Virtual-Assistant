#!/usr/bin/env python3
"""
Virtual Assistant System Command Executor
This Python script provides real system integration for the Virtual Assistant.
It can execute actual system commands, open applications, and perform file operations.
"""

import os
import sys
import subprocess
import platform
import webbrowser
import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
import speech_recognition as sr
import pyttsx3

class SystemExecutor:
    def __init__(self):
        self.system = platform.system().lower()
        self.user_path = os.path.expanduser("~")
        self.system_tools_path = r"C:\Users\Packe\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\System Tools"
        
        # Initialize text-to-speech
        try:
            self.tts_engine = pyttsx3.init()
            self.tts_engine.setProperty('rate', 150)  # Speaking rate
            self.tts_engine.setProperty('volume', 0.8)  # Volume level
        except:
            self.tts_engine = None
            print("⚠️ Text-to-speech not available")
        
        # Initialize speech recognition
        try:
            self.recognizer = sr.Recognizer()
            self.microphone = sr.Microphone()
            print("🎤 Speech recognition initialized")
        except:
            self.recognizer = None
            self.microphone = None
            print("⚠️ Speech recognition not available")
        
        # System commands mapping
        self.commands = {
            # File Manager and Folders
            'file_manager': {
                'windows': 'explorer.exe',
                'darwin': 'open .',
                'linux': 'nautilus'
            },
            'documents': {
                'windows': f'explorer.exe "{os.path.join(self.user_path, "Documents")}"',
                'darwin': f'open "{os.path.join(self.user_path, "Documents")}"',
                'linux': f'nautilus "{os.path.join(self.user_path, "Documents")}"'
            },
            'downloads': {
                'windows': f'explorer.exe "{os.path.join(self.user_path, "Downloads")}"',
                'darwin': f'open "{os.path.join(self.user_path, "Downloads")}"',
                'linux': f'nautilus "{os.path.join(self.user_path, "Downloads")}"'
            },
            
            # Applications
            'notepad': {
                'windows': 'notepad.exe',
                'darwin': 'open -a TextEdit',
                'linux': 'gedit'
            },
            'calculator': {
                'windows': 'calc.exe',
                'darwin': 'open -a Calculator',
                'linux': 'gnome-calculator'
            },
            'word': {
                'windows': 'winword.exe',
                'darwin': 'open -a "Microsoft Word"',
                'linux': 'libreoffice --writer'
            },
            'excel': {
                'windows': 'excel.exe',
                'darwin': 'open -a "Microsoft Excel"',
                'linux': 'libreoffice --calc'
            },
            'powerpoint': {
                'windows': 'powerpnt.exe',
                'darwin': 'open -a "Microsoft PowerPoint"',
                'linux': 'libreoffice --impress'
            },
            'paint': {
                'windows': 'mspaint.exe',
                'darwin': 'open -a Preview',
                'linux': 'gimp'
            },
            
            # System Tools
            'cmd': {
                'windows': 'cmd.exe',
                'darwin': 'open -a Terminal',
                'linux': 'gnome-terminal'
            },
            'powershell': {
                'windows': 'powershell.exe',
                'darwin': 'open -a Terminal',
                'linux': 'gnome-terminal'
            },
            'task_manager': {
                'windows': 'taskmgr.exe',
                'darwin': 'open -a "Activity Monitor"',
                'linux': 'gnome-system-monitor'
            },
            'control_panel': {
                'windows': 'control.exe',
                'darwin': 'open -a "System Preferences"',
                'linux': 'gnome-control-center'
            },
            
            # Browsers
            'chrome': {
                'windows': 'chrome.exe',
                'darwin': 'open -a "Google Chrome"',
                'linux': 'google-chrome'
            },
            'firefox': {
                'windows': 'firefox.exe',
                'darwin': 'open -a Firefox',
                'linux': 'firefox'
            },
            'edge': {
                'windows': 'msedge.exe',
                'darwin': 'open -a "Microsoft Edge"',
                'linux': 'microsoft-edge'
            }
        }
    
    def speak(self, text: str):
        """Convert text to speech"""
        if self.tts_engine:
            print(f"🔊 Speaking: {text}")
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        else:
            print(f"💬 Would say: {text}")
    
    def listen(self, timeout: int = 5) -> Optional[str]:
        """Listen for voice commands"""
        if not self.recognizer or not self.microphone:
            return None
        
        try:
            print("🎤 Listening...")
            with self.microphone as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=timeout)
            
            print("🔍 Processing speech...")
            # Recognize speech using Google Speech Recognition
            command = self.recognizer.recognize_google(audio)
            print(f"📝 Heard: {command}")
            return command.lower()
        
        except sr.WaitTimeoutError:
            print("⏰ Listening timeout")
            return None
        except sr.UnknownValueError:
            print("❓ Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"❌ Speech recognition error: {e}")
            return None
    
    def execute_command(self, app_name: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute system command"""
        result = {
            'success': False,
            'message': '',
            'command_used': '',
            'error': None
        }
        
        app_name = app_name.lower().replace(' ', '_')
        
        if app_name not in self.commands:
            result['message'] = f"Unknown application: {app_name}"
            return result
        
        command_info = self.commands[app_name]
        command = command_info.get(self.system)
        
        if not command:
            result['message'] = f"Command not available for {self.system}"
            return result
        
        try:
            print(f"🚀 Executing: {command}")
            result['command_used'] = command
            
            # Execute the command
            if self.system == 'windows':
                # For Windows, try to change to system tools directory first
                try:
                    os.chdir(self.system_tools_path)
                    print(f"📁 Changed directory to: {self.system_tools_path}")
                except:
                    print("⚠️ Could not change to system tools directory, using current directory")
                
                # Execute command
                process = subprocess.Popen(
                    command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                # For GUI applications, don't wait for completion
                if any(gui_app in command for gui_app in ['explorer', 'notepad', 'calc', 'mspaint', 'taskmgr']):
                    time.sleep(0.5)  # Give it a moment to start
                    if process.poll() is None:
                        result['success'] = True
                        result['message'] = f"Successfully opened {app_name}"
                    else:
                        stdout, stderr = process.communicate()
                        if process.returncode == 0:
                            result['success'] = True
                            result['message'] = f"Successfully executed {app_name}"
                        else:
                            result['error'] = stderr
                            result['message'] = f"Command failed: {stderr}"
                else:
                    # For command-line tools, wait for completion
                    stdout, stderr = process.communicate()
                    if process.returncode == 0:
                        result['success'] = True
                        result['message'] = f"Successfully executed {app_name}"
                        if stdout:
                            result['output'] = stdout
                    else:
                        result['error'] = stderr
                        result['message'] = f"Command failed: {stderr}"
            
            else:
                # For macOS and Linux
                process = subprocess.run(
                    command,
                    shell=True,
                    capture_output=True,
                    text=True
                )
                
                if process.returncode == 0:
                    result['success'] = True
                    result['message'] = f"Successfully executed {app_name}"
                    if process.stdout:
                        result['output'] = process.stdout
                else:
                    result['error'] = process.stderr
                    result['message'] = f"Command failed: {process.stderr}"
        
        except Exception as e:
            result['error'] = str(e)
            result['message'] = f"Error executing command: {str(e)}"
        
        return result
    
    def search_web(self, query: str, search_engine: str = 'google') -> Dict[str, Any]:
        """Open web search in default browser"""
        result = {
            'success': False,
            'message': '',
            'url': ''
        }
        
        try:
            search_urls = {
                'google': f"https://www.google.com/search?q={query.replace(' ', '+')}",
                'bing': f"https://www.bing.com/search?q={query.replace(' ', '+')}",
                'youtube': f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}",
                'wikipedia': f"https://en.wikipedia.org/wiki/Special:Search?search={query.replace(' ', '_')}"
            }
            
            url = search_urls.get(search_engine.lower(), search_urls['google'])
            result['url'] = url
            
            print(f"🔍 Opening search: {url}")
            webbrowser.open(url)
            
            result['success'] = True
            result['message'] = f"Opened {search_engine} search for: {query}"
            
        except Exception as e:
            result['error'] = str(e)
            result['message'] = f"Error opening search: {str(e)}"
        
        return result
    
    def open_folder(self, folder_path: str) -> Dict[str, Any]:
        """Open specific folder"""
        result = {
            'success': False,
            'message': '',
            'path': folder_path
        }
        
        try:
            # Expand user path and resolve path
            full_path = os.path.expanduser(folder_path)
            full_path = os.path.abspath(full_path)
            
            if not os.path.exists(full_path):
                result['message'] = f"Folder does not exist: {full_path}"
                return result
            
            if not os.path.isdir(full_path):
                result['message'] = f"Path is not a directory: {full_path}"
                return result
            
            if self.system == 'windows':
                command = f'explorer.exe "{full_path}"'
            elif self.system == 'darwin':
                command = f'open "{full_path}"'
            else:  # linux
                command = f'nautilus "{full_path}"'
            
            print(f"📁 Opening folder: {full_path}")
            subprocess.run(command, shell=True)
            
            result['success'] = True
            result['message'] = f"Opened folder: {full_path}"
            
        except Exception as e:
            result['error'] = str(e)
            result['message'] = f"Error opening folder: {str(e)}"
        
        return result
    
    def create_folder(self, folder_path: str) -> Dict[str, Any]:
        """Create a new folder"""
        result = {
            'success': False,
            'message': '',
            'path': folder_path
        }
        
        try:
            full_path = os.path.expanduser(folder_path)
            full_path = os.path.abspath(full_path)
            
            if os.path.exists(full_path):
                result['message'] = f"Folder already exists: {full_path}"
                return result
            
            os.makedirs(full_path, exist_ok=True)
            
            result['success'] = True
            result['message'] = f"Created folder: {full_path}"
            
            print(f"📁 Created folder: {full_path}")
            
        except Exception as e:
            result['error'] = str(e)
            result['message'] = f"Error creating folder: {str(e)}"
        
        return result
    
    def process_voice_command(self, command: str) -> Dict[str, Any]:
        """Process natural language voice command"""
        command = command.lower()
        result = {'success': False, 'message': 'Command not recognized', 'action_taken': None}
        
        # File Manager commands
        if any(phrase in command for phrase in ['open file manager', 'file explorer', 'show files']):
            result = self.execute_command('file_manager')
            if result['success']:
                self.speak("Opening file manager")
        
        # Application opening
        elif 'open notepad' in command or 'notepad' in command:
            result = self.execute_command('notepad')
            if result['success']:
                self.speak("Opening Notepad")
        
        elif 'open calculator' in command or 'calculator' in command:
            result = self.execute_command('calculator')
            if result['success']:
                self.speak("Opening Calculator")
        
        elif 'open word' in command or 'microsoft word' in command:
            result = self.execute_command('word')
            if result['success']:
                self.speak("Opening Microsoft Word")
        
        elif 'open excel' in command or 'microsoft excel' in command:
            result = self.execute_command('excel')
            if result['success']:
                self.speak("Opening Microsoft Excel")
        
        elif 'open powerpoint' in command or 'microsoft powerpoint' in command:
            result = self.execute_command('powerpoint')
            if result['success']:
                self.speak("Opening Microsoft PowerPoint")
        
        elif 'open paint' in command or 'mspaint' in command:
            result = self.execute_command('paint')
            if result['success']:
                self.speak("Opening Paint")
        
        elif 'open cmd' in command or 'command prompt' in command or 'open terminal' in command:
            result = self.execute_command('cmd')
            if result['success']:
                self.speak("Opening Command Prompt")
        
        elif 'open powershell' in command or 'powershell' in command:
            result = self.execute_command('powershell')
            if result['success']:
                self.speak("Opening PowerShell")
        
        elif 'task manager' in command or 'open task manager' in command:
            result = self.execute_command('task_manager')
            if result['success']:
                self.speak("Opening Task Manager")
        
        elif 'control panel' in command or 'open control panel' in command:
            result = self.execute_command('control_panel')
            if result['success']:
                self.speak("Opening Control Panel")
        
        # Browser commands
        elif 'open chrome' in command or 'google chrome' in command:
            result = self.execute_command('chrome')
            if result['success']:
                self.speak("Opening Google Chrome")
        
        elif 'open firefox' in command or 'mozilla firefox' in command:
            result = self.execute_command('firefox')
            if result['success']:
                self.speak("Opening Firefox")
        
        elif 'open edge' in command or 'microsoft edge' in command:
            result = self.execute_command('edge')
            if result['success']:
                self.speak("Opening Microsoft Edge")
        
        # Search commands
        elif 'search' in command and ('google' in command or 'web' in command):
            # Extract search query
            query_start = command.find('search') + 6
            query = command[query_start:].strip()
            # Remove common words
            query = query.replace('on google', '').replace('in google', '').replace('google', '').strip()
            
            if query:
                result = self.search_web(query)
                if result['success']:
                    self.speak(f"Searching for {query}")
        
        # Folder commands
        elif 'open documents' in command or 'documents folder' in command:
            result = self.execute_command('documents')
            if result['success']:
                self.speak("Opening Documents folder")
        
        elif 'open downloads' in command or 'downloads folder' in command:
            result = self.execute_command('downloads')
            if result['success']:
                self.speak("Opening Downloads folder")
        
        return result

def main():
    """Main function for testing the system executor"""
    executor = SystemExecutor()
    
    print("🤖 Virtual Assistant System Executor")
    print("=" * 50)
    print("Available commands:")
    print("- 'listen' - Listen for voice commands")
    print("- 'test <app>' - Test opening an application")
    print("- 'search <query>' - Search the web")
    print("- 'exit' - Exit the program")
    print("=" * 50)
    
    while True:
        try:
            user_input = input("\n💭 Enter command (or 'listen' for voice): ").strip()
            
            if user_input.lower() == 'exit':
                print("👋 Goodbye!")
                break
            
            elif user_input.lower() == 'listen':
                print("🎤 Listening for voice command...")
                voice_command = executor.listen(timeout=10)
                if voice_command:
                    print(f"🎯 Processing: {voice_command}")
                    result = executor.process_voice_command(voice_command)
                    print(f"📊 Result: {result}")
                else:
                    print("❌ No voice command detected")
            
            elif user_input.lower().startswith('test '):
                app_name = user_input[5:].strip()
                print(f"🧪 Testing: {app_name}")
                result = executor.execute_command(app_name)
                print(f"📊 Result: {result}")
            
            elif user_input.lower().startswith('search '):
                query = user_input[7:].strip()
                print(f"🔍 Searching: {query}")
                result = executor.search_web(query)
                print(f"📊 Result: {result}")
            
            else:
                print(f"🎯 Processing as voice command: {user_input}")
                result = executor.process_voice_command(user_input)
                print(f"📊 Result: {result}")
        
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
