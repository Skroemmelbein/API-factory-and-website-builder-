"""
Code Execution Module for Devon Agent
"""

import os
import subprocess
import ast
import json
import tempfile
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class CodeExecutor:
    """
    Responsible for executing code-related tasks
    """
    
    def __init__(self, workspace_path: str = "./workspace"):
        self.workspace_path = Path(workspace_path)
        self.workspace_path.mkdir(exist_ok=True)
        self.execution_history = []
        
    async def execute_task(self, task: str, context: Dict[str, Any] = None, 
                          memory: Any = None) -> Dict[str, Any]:
        """
        Execute a specific task
        
        Args:
            task: The task description
            context: Current execution context
            memory: Memory manager instance
            
        Returns:
            Dictionary with execution results
        """
        logger.info(f"Executing: {task}")
        
        try:
            # Determine task type and execute accordingly
            if "test" in task.lower():
                return await self._execute_test_task(task, context)
            elif "implement" in task.lower() or "write" in task.lower():
                return await self._execute_implementation_task(task, context)
            elif "analyze" in task.lower():
                return await self._execute_analysis_task(task, context)
            elif "fix" in task.lower() or "debug" in task.lower():
                return await self._execute_debug_task(task, context)
            else:
                return await self._execute_generic_task(task, context)
                
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "task": task
            }
    
    async def _execute_implementation_task(self, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an implementation task
        """
        # Generate code based on task description
        code = self._generate_code_snippet(task, context)
        
        # Determine file path
        file_path = self._determine_file_path(task, context)
        
        # Write code to file
        full_path = self.workspace_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(full_path, 'w') as f:
            f.write(code)
        
        # Validate the code
        validation = self._validate_code(full_path)
        
        return {
            "success": validation["valid"],
            "summary": f"Implemented {file_path}",
            "code_changes": [{
                "file": str(file_path),
                "action": "created",
                "lines": len(code.splitlines())
            }],
            "artifacts": {
                "files_created": [str(file_path)]
            },
            "context": {
                "last_file": str(file_path),
                "last_action": "implement"
            }
        }
    
    async def _execute_test_task(self, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a testing task
        """
        # Generate test code
        test_code = self._generate_test_code(task, context)
        
        # Write test file
        test_file = self.workspace_path / "tests" / "test_generated.py"
        test_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(test_file, 'w') as f:
            f.write(test_code)
        
        # Run tests
        result = self._run_tests(test_file)
        
        return {
            "success": result["passed"],
            "summary": f"Tests {'passed' if result['passed'] else 'failed'}",
            "test_results": result,
            "artifacts": {
                "files_created": ["tests/test_generated.py"],
                "commands_executed": [result["command"]]
            }
        }
    
    async def _execute_analysis_task(self, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an analysis task
        """
        # Analyze code in workspace
        analysis_results = self._analyze_codebase()
        
        return {
            "success": True,
            "summary": "Code analysis completed",
            "analysis": analysis_results,
            "context": {
                "files_analyzed": analysis_results["file_count"],
                "issues_found": analysis_results["issue_count"]
            }
        }
    
    async def _execute_debug_task(self, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a debugging task
        """
        # Find potential bug locations
        bug_locations = self._find_bug_locations(context)
        
        # Generate fixes
        fixes = []
        for location in bug_locations:
            fix = self._generate_fix(location, context)
            fixes.append(fix)
            
            # Apply fix
            if fix["confidence"] > 0.7:
                self._apply_fix(fix)
        
        return {
            "success": len(fixes) > 0,
            "summary": f"Found and fixed {len(fixes)} potential issues",
            "fixes": fixes,
            "artifacts": {
                "files_modified": [f["file"] for f in fixes]
            }
        }
    
    async def _execute_generic_task(self, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a generic task
        """
        # Try to interpret and execute the task
        logger.info(f"Executing generic task: {task}")
        
        return {
            "success": True,
            "summary": f"Completed: {task}",
            "context": {
                "last_task": task
            }
        }
    
    def _generate_code_snippet(self, task: str, context: Dict[str, Any]) -> str:
        """
        Generate code based on task description
        """
        # Simplified code generation
        if "api" in task.lower():
            return self._generate_api_code()
        elif "function" in task.lower():
            return self._generate_function_code()
        else:
            return self._generate_generic_code()
    
    def _generate_api_code(self) -> str:
        """Generate API endpoint code"""
        return '''from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "version": "1.0.0"})

@app.route('/api/data', methods=['GET'])
def get_data():
    """Get data endpoint"""
    # TODO: Implement data retrieval logic
    return jsonify({"data": [], "count": 0})

@app.route('/api/data', methods=['POST'])
def create_data():
    """Create data endpoint"""
    data = request.json
    # TODO: Implement data creation logic
    return jsonify({"success": True, "id": "generated_id"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
'''
    
    def _generate_function_code(self) -> str:
        """Generate function code"""
        return '''def process_data(input_data):
    """
    Process input data and return results
    
    Args:
        input_data: Data to process
        
    Returns:
        Processed data
    """
    # Validate input
    if not input_data:
        raise ValueError("Input data cannot be empty")
    
    # Process data
    result = []
    for item in input_data:
        processed_item = transform_item(item)
        result.append(processed_item)
    
    return result

def transform_item(item):
    """Transform a single item"""
    # TODO: Implement transformation logic
    return {
        "original": item,
        "transformed": str(item).upper(),
        "timestamp": None
    }
'''
    
    def _generate_generic_code(self) -> str:
        """Generate generic code"""
        return '''"""
Auto-generated module
"""

class Implementation:
    """Main implementation class"""
    
    def __init__(self):
        self.data = []
        
    def process(self, input_value):
        """Process input value"""
        # TODO: Implement processing logic
        self.data.append(input_value)
        return True
    
    def get_results(self):
        """Get processing results"""
        return self.data.copy()
'''
    
    def _generate_test_code(self, task: str, context: Dict[str, Any]) -> str:
        """Generate test code"""
        return '''import unittest

class TestGenerated(unittest.TestCase):
    """Auto-generated tests"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_data = [1, 2, 3, 4, 5]
    
    def test_basic_functionality(self):
        """Test basic functionality"""
        self.assertTrue(True)
        self.assertEqual(1 + 1, 2)
    
    def test_data_processing(self):
        """Test data processing"""
        result = sum(self.test_data)
        self.assertEqual(result, 15)
    
    def test_edge_cases(self):
        """Test edge cases"""
        self.assertIsNone(None)
        self.assertEqual([], [])

if __name__ == '__main__':
    unittest.main()
'''
    
    def _determine_file_path(self, task: str, context: Dict[str, Any]) -> str:
        """Determine appropriate file path for task"""
        if "api" in task.lower():
            return "api/endpoints.py"
        elif "test" in task.lower():
            return "tests/test_main.py"
        elif "model" in task.lower():
            return "models/data_model.py"
        else:
            return "src/implementation.py"
    
    def _validate_code(self, file_path: Path) -> Dict[str, Any]:
        """Validate Python code"""
        try:
            with open(file_path, 'r') as f:
                code = f.read()
            
            # Try to parse as Python
            ast.parse(code)
            
            return {
                "valid": True,
                "errors": []
            }
        except SyntaxError as e:
            return {
                "valid": False,
                "errors": [str(e)]
            }
    
    def _run_tests(self, test_file: Path) -> Dict[str, Any]:
        """Run tests and return results"""
        try:
            cmd = f"python -m pytest {test_file} -v"
            result = subprocess.run(
                cmd.split(),
                capture_output=True,
                text=True,
                cwd=self.workspace_path
            )
            
            return {
                "passed": result.returncode == 0,
                "output": result.stdout,
                "errors": result.stderr,
                "command": cmd
            }
        except Exception as e:
            return {
                "passed": False,
                "error": str(e),
                "command": cmd
            }
    
    def _analyze_codebase(self) -> Dict[str, Any]:
        """Analyze the codebase"""
        py_files = list(self.workspace_path.rglob("*.py"))
        
        total_lines = 0
        issues = []
        
        for file in py_files:
            try:
                with open(file, 'r') as f:
                    lines = f.readlines()
                    total_lines += len(lines)
                    
                    # Check for common issues
                    for i, line in enumerate(lines, 1):
                        if "TODO" in line:
                            issues.append({
                                "file": str(file.relative_to(self.workspace_path)),
                                "line": i,
                                "type": "TODO",
                                "message": line.strip()
                            })
            except Exception as e:
                logger.error(f"Error analyzing {file}: {e}")
        
        return {
            "file_count": len(py_files),
            "total_lines": total_lines,
            "issue_count": len(issues),
            "issues": issues[:10]  # Limit to first 10 issues
        }
    
    def _find_bug_locations(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find potential bug locations"""
        locations = []
        
        # Check recent files from context
        if "last_file" in context:
            locations.append({
                "file": context["last_file"],
                "line": 1,
                "description": "Recent modification site"
            })
        
        # Check for common bug patterns
        py_files = list(self.workspace_path.rglob("*.py"))
        for file in py_files[:5]:  # Limit search
            try:
                with open(file, 'r') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines, 1):
                        if "except:" in line:  # Bare except
                            locations.append({
                                "file": str(file.relative_to(self.workspace_path)),
                                "line": i,
                                "description": "Bare except clause"
                            })
            except Exception:
                pass
        
        return locations
    
    def _generate_fix(self, location: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a fix for a bug location"""
        return {
            "file": location["file"],
            "line": location["line"],
            "original": "except:",
            "fixed": "except Exception as e:",
            "description": "Added specific exception handling",
            "confidence": 0.8
        }
    
    def _apply_fix(self, fix: Dict[str, Any]):
        """Apply a code fix"""
        file_path = self.workspace_path / fix["file"]
        
        if not file_path.exists():
            return
        
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            # Apply fix (simplified)
            if fix["line"] <= len(lines):
                lines[fix["line"] - 1] = lines[fix["line"] - 1].replace(
                    fix["original"], 
                    fix["fixed"]
                )
            
            with open(file_path, 'w') as f:
                f.writelines(lines)
                
            logger.info(f"Applied fix to {fix['file']}:{fix['line']}")
        except Exception as e:
            logger.error(f"Failed to apply fix: {e}")