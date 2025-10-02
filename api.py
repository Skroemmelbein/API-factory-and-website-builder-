"""
Devon Agent API Server
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import logging
from typing import Dict, Any
import os

from devon_agent import DevonAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Devon Agent
agent = DevonAgent(
    model=os.getenv("MODEL", "gpt-4"),
    workspace_path=os.getenv("WORKSPACE_PATH", "./workspace")
)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "agent": "Devon",
        "version": "0.1.0"
    })

@app.route('/api/agent/status', methods=['GET'])
def get_agent_status():
    """Get current agent status"""
    try:
        state = agent.get_state()
        return jsonify({
            "success": True,
            "state": state
        })
    except Exception as e:
        logger.error(f"Error getting agent status: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/agent/execute', methods=['POST'])
def execute_task():
    """Execute a task with the agent"""
    try:
        data = request.json
        if not data or 'request' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'request' in body"
            }), 400
        
        user_request = data['request']
        
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            agent.process_request(user_request)
        )
        loop.close()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error executing task: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/agent/reset', methods=['POST'])
def reset_agent():
    """Reset agent state"""
    try:
        agent.reset()
        return jsonify({
            "success": True,
            "message": "Agent state reset successfully"
        })
    except Exception as e:
        logger.error(f"Error resetting agent: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/agent/memory', methods=['GET'])
def get_memory():
    """Get agent memory summary"""
    try:
        summary = agent.memory.summarize_session()
        recent = agent.memory.get_recent_context(5)
        
        return jsonify({
            "success": True,
            "summary": summary,
            "recent_context": recent
        })
    except Exception as e:
        logger.error(f"Error getting memory: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/agent/memory/search', methods=['POST'])
def search_memory():
    """Search agent memory"""
    try:
        data = request.json
        query = data.get('query', '')
        memory_type = data.get('type', 'all')
        
        results = agent.memory.search_memory(query, memory_type)
        
        return jsonify({
            "success": True,
            "results": results
        })
    except Exception as e:
        logger.error(f"Error searching memory: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/tools', methods=['GET'])
def list_tools():
    """List available tools"""
    try:
        tools = agent.tools.list_tools()
        return jsonify({
            "success": True,
            "tools": tools
        })
    except Exception as e:
        logger.error(f"Error listing tools: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/tools/execute', methods=['POST'])
def execute_tool():
    """Execute a specific tool"""
    try:
        data = request.json
        tool_name = data.get('tool')
        params = data.get('params', {})
        
        if not tool_name:
            return jsonify({
                "success": False,
                "error": "Missing 'tool' in body"
            }), 400
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            agent.tools.execute_tool(tool_name, **params)
        )
        loop.close()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error executing tool: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(
        debug=os.getenv('DEBUG', 'False').lower() == 'true',
        host='0.0.0.0',
        port=port
    )
    logger.info(f"Devon Agent API running on port {port}")