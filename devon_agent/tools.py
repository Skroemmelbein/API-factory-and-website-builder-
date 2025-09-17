"""
Tool Management Module for Devon Agent
"""

import os
import subprocess
import requests
import json
from typing import Dict, Any, List, Optional, Callable
from pathlib import Path
import logging
import ast
import re

logger = logging.getLogger(__name__)


class Tool:
    """Base class for all tools"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool with given parameters"""
        raise NotImplementedError


class FileSystemTool(Tool):
    """Tool for file system operations"""
    
    def __init__(self, workspace_path: str):
        super().__init__(
            "filesystem",
            "Perform file system operations (read, write, list, search)"
        )
        self.workspace_path = Path(workspace_path)
    
    async def execute(self, operation: str, **kwargs) -> Dict[str, Any]:
        """Execute file system operation"""
        operations = {
            "read": self._read_file,
            "write": self._write_file,
            "list": self._list_directory,
            "search": self._search_files,
            "create_dir": self._create_directory,
            "delete": self._delete_file
        }
        
        if operation not in operations:
            return {"success": False, "error": f"Unknown operation: {operation}"}
        
        try:
            result = operations[operation](**kwargs)
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _read_file(self, path: str) -> str:
        """Read file contents"""
        file_path = self.workspace_path / path
        with open(file_path, 'r') as f:
            return f.read()
    
    def _write_file(self, path: str, content: str) -> str:
        """Write content to file"""
        file_path = self.workspace_path / path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, 'w') as f:
            f.write(content)
        return f"Written to {path}"
    
    def _list_directory(self, path: str = ".") -> List[str]:
        """List directory contents"""
        dir_path = self.workspace_path / path
        return [str(p.relative_to(self.workspace_path)) for p in dir_path.iterdir()]
    
    def _search_files(self, pattern: str) -> List[str]:
        """Search for files matching pattern"""
        matches = []
        for path in self.workspace_path.rglob(pattern):
            matches.append(str(path.relative_to(self.workspace_path)))
        return matches
    
    def _create_directory(self, path: str) -> str:
        """Create directory"""
        dir_path = self.workspace_path / path
        dir_path.mkdir(parents=True, exist_ok=True)
        return f"Created directory: {path}"
    
    def _delete_file(self, path: str) -> str:
        """Delete file"""
        file_path = self.workspace_path / path
        if file_path.exists():
            file_path.unlink()
            return f"Deleted: {path}"
        return f"File not found: {path}"


class CodeAnalysisTool(Tool):
    """Tool for analyzing code"""
    
    def __init__(self):
        super().__init__(
            "code_analysis",
            "Analyze code for issues, complexity, and suggestions"
        )
    
    async def execute(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code"""
        if language == "python":
            return self._analyze_python(code)
        else:
            return {"success": False, "error": f"Unsupported language: {language}"}
    
    def _analyze_python(self, code: str) -> Dict[str, Any]:
        """Analyze Python code"""
        try:
            tree = ast.parse(code)
            
            analysis = {
                "success": True,
                "metrics": {
                    "lines": len(code.splitlines()),
                    "functions": 0,
                    "classes": 0,
                    "imports": 0
                },
                "issues": [],
                "suggestions": []
            }
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    analysis["metrics"]["functions"] += 1
                elif isinstance(node, ast.ClassDef):
                    analysis["metrics"]["classes"] += 1
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    analysis["metrics"]["imports"] += 1
            
            # Check for common issues
            if "except:" in code:
                analysis["issues"].append("Bare except clause detected")
            
            if analysis["metrics"]["functions"] > 10:
                analysis["suggestions"].append("Consider splitting into multiple modules")
            
            return analysis
            
        except SyntaxError as e:
            return {
                "success": False,
                "error": f"Syntax error: {e}",
                "line": e.lineno
            }


class ShellCommandTool(Tool):
    """Tool for executing shell commands"""
    
    def __init__(self, workspace_path: str):
        super().__init__(
            "shell",
            "Execute shell commands"
        )
        self.workspace_path = Path(workspace_path)
    
    async def execute(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        """Execute shell command"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=self.workspace_path
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Command timed out after {timeout} seconds"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


class WebSearchTool(Tool):
    """Tool for searching the web"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            "web_search",
            "Search the web for information"
        )
        self.api_key = api_key
    
    async def execute(self, query: str, num_results: int = 5) -> Dict[str, Any]:
        """Search the web"""
        # This is a placeholder - in production, use a real search API
        return {
            "success": True,
            "results": [
                {
                    "title": f"Result for: {query}",
                    "snippet": "This is a placeholder search result",
                    "url": "https://example.com"
                }
            ] * min(num_results, 3)
        }


class GitTool(Tool):
    """Tool for Git operations"""
    
    def __init__(self, workspace_path: str):
        super().__init__(
            "git",
            "Perform Git operations"
        )
        self.workspace_path = Path(workspace_path)
    
    async def execute(self, operation: str, **kwargs) -> Dict[str, Any]:
        """Execute Git operation"""
        operations = {
            "status": "git status",
            "add": f"git add {kwargs.get('files', '.')}",
            "commit": f"git commit -m \"{kwargs.get('message', 'Auto commit')}\"",
            "push": f"git push {kwargs.get('remote', 'origin')} {kwargs.get('branch', 'main')}",
            "pull": f"git pull {kwargs.get('remote', 'origin')} {kwargs.get('branch', 'main')}",
            "branch": "git branch",
            "checkout": f"git checkout {kwargs.get('branch', 'main')}",
            "log": "git log --oneline -10"
        }
        
        if operation not in operations:
            return {"success": False, "error": f"Unknown operation: {operation}"}
        
        command = operations[operation]
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.workspace_path
            )
            
            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr
            }
        except Exception as e:
            return {"success": False, "error": str(e)}


class ToolManager:
    """Manages all available tools"""
    
    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path)
        self.tools = {}
        
        # Initialize built-in tools
        self._initialize_tools()
    
    def _initialize_tools(self):
        """Initialize built-in tools"""
        self.register_tool(FileSystemTool(self.workspace_path))
        self.register_tool(CodeAnalysisTool())
        self.register_tool(ShellCommandTool(self.workspace_path))
        self.register_tool(WebSearchTool())
        self.register_tool(GitTool(self.workspace_path))
    
    def register_tool(self, tool: Tool):
        """Register a new tool"""
        self.tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")
    
    async def execute_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Execute a tool by name"""
        if tool_name not in self.tools:
            return {
                "success": False,
                "error": f"Tool not found: {tool_name}"
            }
        
        tool = self.tools[tool_name]
        logger.info(f"Executing tool: {tool_name}")
        
        try:
            result = await tool.execute(**kwargs)
            return result
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_tools(self) -> List[Dict[str, str]]:
        """List all available tools"""
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools.values()
        ]
    
    def get_tool_description(self, tool_name: str) -> Optional[str]:
        """Get description of a specific tool"""
        if tool_name in self.tools:
            return self.tools[tool_name].description
        return None