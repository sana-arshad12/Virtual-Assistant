#!/usr/bin/env python3
"""
Flask API Server for Virtual Assistant System Integration
Provides REST API endpoints to execute system commands from the React frontend.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import threading
import time
from system_executor import SystemExecutor

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize the system executor
executor = SystemExecutor()

# Store for background processes
background_processes = {}

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Virtual Assistant System Executor API is running',
        'system': executor.system,
        'available_commands': list(executor.commands.keys())
    })

@app.route('/api/execute', methods=['POST'])
def execute_command():
    """Execute system command"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        app_name = data.get('app_name') or data.get('command')
        parameters = data.get('parameters', {})
        
        if not app_name:
            return jsonify({
                'success': False,
                'error': 'app_name or command is required'
            }), 400
        
        print(f"📨 Received command: {app_name}")
        result = executor.execute_command(app_name, parameters)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/search', methods=['POST'])
def search_web():
    """Search the web"""
    try:
        data = request.get_json()
        
        query = data.get('query')
        search_engine = data.get('search_engine', 'google')
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'query is required'
            }), 400
        
        print(f"🔍 Received search: {query}")
        result = executor.search_web(query, search_engine)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/folder/open', methods=['POST'])
def open_folder():
    """Open folder"""
    try:
        data = request.get_json()
        
        folder_path = data.get('path')
        
        if not folder_path:
            return jsonify({
                'success': False,
                'error': 'path is required'
            }), 400
        
        print(f"📁 Opening folder: {folder_path}")
        result = executor.open_folder(folder_path)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/folder/create', methods=['POST'])
def create_folder():
    """Create folder"""
    try:
        data = request.get_json()
        
        folder_path = data.get('path')
        
        if not folder_path:
            return jsonify({
                'success': False,
                'error': 'path is required'
            }), 400
        
        print(f"📁 Creating folder: {folder_path}")
        result = executor.create_folder(folder_path)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/voice/listen', methods=['POST'])
def listen_for_voice():
    """Listen for voice command"""
    try:
        data = request.get_json() or {}
        timeout = data.get('timeout', 5)
        
        print(f"🎤 Listening for voice command (timeout: {timeout}s)")
        voice_command = executor.listen(timeout=timeout)
        
        if voice_command:
            return jsonify({
                'success': True,
                'command': voice_command,
                'message': f'Heard: {voice_command}'
            })
        else:
            return jsonify({
                'success': False,
                'command': None,
                'message': 'No voice command detected'
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/voice/process', methods=['POST'])
def process_voice_command():
    """Process voice command"""
    try:
        data = request.get_json()
        
        command = data.get('command')
        
        if not command:
            return jsonify({
                'success': False,
                'error': 'command is required'
            }), 400
        
        print(f"🎯 Processing voice command: {command}")
        result = executor.process_voice_command(command)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/speak', methods=['POST'])
def text_to_speech():
    """Convert text to speech"""
    try:
        data = request.get_json()
        
        text = data.get('text')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'text is required'
            }), 400
        
        print(f"🔊 Speaking: {text}")
        executor.speak(text)
        
        return jsonify({
            'success': True,
            'message': f'Spoke: {text}'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/commands', methods=['GET'])
def get_available_commands():
    """Get list of available commands"""
    try:
        commands_info = {}
        
        for app_name, command_info in executor.commands.items():
            commands_info[app_name] = {
                'available': executor.system in command_info,
                'command': command_info.get(executor.system, 'Not available'),
                'description': f'Open/Execute {app_name.replace("_", " ").title()}'
            }
        
        return jsonify({
            'success': True,
            'system': executor.system,
            'commands': commands_info
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def run_server(host='localhost', port=8080, debug=False):
    """Run the Flask server"""
    print(f"🚀 Starting Virtual Assistant API Server")
    print(f"📍 Server will run at: http://{host}:{port}")
    print(f"🔧 System: {executor.system}")
    print(f"📁 System Tools Path: {executor.system_tools_path}")
    print("=" * 60)
    
    # Start the server
    app.run(host=host, port=port, debug=debug, threaded=True)

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Virtual Assistant System Executor API')
    parser.add_argument('--host', default='localhost', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8080, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    run_server(host=args.host, port=args.port, debug=args.debug)
