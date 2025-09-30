# Devon Agent - AI Software Engineering Assistant

An advanced AI-powered software engineering assistant inspired by Cognition Labs' Devin. This agent can autonomously plan, write, debug, and deploy code based on natural language instructions.

## 🚀 Features

- **Autonomous Task Planning**: Breaks down complex requests into actionable tasks
- **Code Generation**: Generates code in multiple languages (Python, JavaScript, TypeScript)
- **Intelligent Execution**: Executes tasks with context awareness and error handling
- **Memory Management**: Maintains short-term and long-term memory for context
- **Tool Integration**: Built-in tools for file system, code analysis, shell commands, and Git
- **RESTful API**: Full-featured API for integration with other systems
- **Web Interface**: Beautiful, modern UI for interacting with Devon

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devon-agent.git
cd devon-agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables (optional):
```bash
export MODEL="gpt-4"  # or your preferred model
export WORKSPACE_PATH="./workspace"
export PORT=5000
```

## 🎯 Quick Start

### Running the API Server

```bash
python api.py
```

The API will be available at `http://localhost:5000`

### Using the Web Interface

Open `index.html` in your browser or serve it with:
```bash
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

## 💻 Usage Examples

### Python SDK Usage

```python
from devon_agent import DevonAgent

# Initialize the agent
agent = DevonAgent(model="gpt-4", workspace_path="./my_project")

# Process a request
async def main():
    result = await agent.process_request(
        "Create a REST API with CRUD operations for a todo list"
    )
    print(result)

# Run
import asyncio
asyncio.run(main())
```

### API Usage

```bash
# Execute a task
curl -X POST http://localhost:5000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"request": "Write a function to calculate fibonacci numbers"}'

# Check agent status
curl http://localhost:5000/api/agent/status

# List available tools
curl http://localhost:5000/api/tools
```

### JavaScript Integration

```javascript
const response = await fetch('http://localhost:5000/api/agent/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        request: 'Create a React component for a user profile card'
    })
});

const result = await response.json();
console.log(result);
```

## 🏗️ Architecture

### Core Components

1. **TaskPlanner**: Analyzes requests and creates execution plans
2. **CodeExecutor**: Executes tasks and manages code generation
3. **MemoryManager**: Maintains context and learning from interactions
4. **ToolManager**: Manages and executes various development tools
5. **CodeGenerator**: Advanced code generation with templates and patterns

### Project Structure

```
devon-agent/
├── devon_agent/
│   ├── __init__.py
│   ├── core.py           # Main agent logic
│   ├── planner.py        # Task planning
│   ├── executor.py       # Task execution
│   ├── memory.py         # Memory management
│   ├── tools.py          # Tool implementations
│   └── code_generator.py # Code generation
├── api.py                 # Flask API server
├── index.html            # Web interface
├── requirements.txt      # Python dependencies
└── README.md            # Documentation
```

## 🛠️ Available Tools

- **FileSystem**: Read, write, search, and manage files
- **CodeAnalysis**: Analyze code for issues and metrics
- **ShellCommand**: Execute shell commands
- **GitTool**: Perform Git operations
- **WebSearch**: Search the web for information

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/agent/status` | GET | Get agent status |
| `/api/agent/execute` | POST | Execute a task |
| `/api/agent/reset` | POST | Reset agent state |
| `/api/agent/memory` | GET | Get memory summary |
| `/api/agent/memory/search` | POST | Search memory |
| `/api/tools` | GET | List available tools |
| `/api/tools/execute` | POST | Execute specific tool |

## 🧪 Testing

Run the test suite:
```bash
pytest tests/ -v
```

Run with coverage:
```bash
pytest tests/ --cov=devon_agent --cov-report=html
```

## 🔧 Configuration

Configure the agent behavior by modifying:
- Model selection in `DevonAgent` initialization
- Planning strategies in `TaskPlanner`
- Tool configurations in `ToolManager`
- Memory limits in `MemoryManager`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Cognition Labs' Devin
- Built with Flask, Python, and modern web technologies
- Community contributions and feedback

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the maintainers
- Check the documentation

---

**Note**: This is an educational implementation inspired by Devon/Devin. For production use, additional security, error handling, and optimization may be required.