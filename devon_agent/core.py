"""
Core Devon Agent Implementation
"""

import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

from .planner import TaskPlanner
from .executor import CodeExecutor
from .memory import MemoryManager
from .tools import ToolManager

logger = logging.getLogger(__name__)


@dataclass
class AgentState:
    """Represents the current state of the Devon agent"""
    current_task: Optional[str] = None
    completed_tasks: List[str] = None
    pending_tasks: List[str] = None
    context: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.completed_tasks is None:
            self.completed_tasks = []
        if self.pending_tasks is None:
            self.pending_tasks = []
        if self.context is None:
            self.context = {}


class DevonAgent:
    """
    Main Devon Agent class that coordinates planning, execution, and memory
    """
    
    def __init__(self, model: str = "gpt-4", workspace_path: str = "./workspace"):
        """
        Initialize the Devon agent
        
        Args:
            model: The LLM model to use for reasoning
            workspace_path: Path to the working directory
        """
        self.model = model
        self.workspace_path = workspace_path
        self.state = AgentState()
        
        # Initialize components
        self.planner = TaskPlanner(model=model)
        self.executor = CodeExecutor(workspace_path=workspace_path)
        self.memory = MemoryManager()
        self.tools = ToolManager(workspace_path=workspace_path)
        
        logger.info(f"Devon Agent initialized with model: {model}")
    
    async def process_request(self, user_request: str) -> Dict[str, Any]:
        """
        Process a user request end-to-end
        
        Args:
            user_request: The natural language request from the user
            
        Returns:
            A dictionary containing the result and any artifacts
        """
        logger.info(f"Processing request: {user_request[:100]}...")
        
        try:
            # Store the request in memory
            self.memory.add_interaction("user", user_request)
            
            # Generate a plan
            plan = await self.planner.create_plan(
                user_request, 
                context=self.state.context
            )
            self.state.pending_tasks = plan.tasks
            
            # Execute each task in the plan
            results = []
            for task in plan.tasks:
                self.state.current_task = task
                logger.info(f"Executing task: {task}")
                
                # Execute the task
                result = await self.executor.execute_task(
                    task,
                    context=self.state.context,
                    memory=self.memory
                )
                
                # Update state
                self.state.completed_tasks.append(task)
                self.state.pending_tasks.remove(task)
                self.state.context.update(result.get("context", {}))
                
                # Store result
                results.append(result)
                self.memory.add_interaction("assistant", f"Completed: {task}")
            
            # Generate final response
            response = self._synthesize_response(results)
            self.memory.add_interaction("assistant", response["summary"])
            
            return {
                "success": True,
                "response": response,
                "tasks_completed": self.state.completed_tasks,
                "artifacts": self._collect_artifacts(results)
            }
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return {
                "success": False,
                "error": str(e),
                "tasks_completed": self.state.completed_tasks
            }
    
    def _synthesize_response(self, results: List[Dict]) -> Dict[str, Any]:
        """
        Synthesize a final response from task results
        """
        summary_parts = []
        code_changes = []
        
        for result in results:
            if result.get("success"):
                summary_parts.append(result.get("summary", "Task completed"))
                if "code_changes" in result:
                    code_changes.extend(result["code_changes"])
        
        return {
            "summary": "\n".join(summary_parts),
            "code_changes": code_changes,
            "total_tasks": len(results),
            "successful_tasks": sum(1 for r in results if r.get("success"))
        }
    
    def _collect_artifacts(self, results: List[Dict]) -> Dict[str, Any]:
        """
        Collect all artifacts generated during execution
        """
        artifacts = {
            "files_created": [],
            "files_modified": [],
            "commands_executed": [],
            "errors": []
        }
        
        for result in results:
            if "artifacts" in result:
                for key in artifacts:
                    if key in result["artifacts"]:
                        artifacts[key].extend(result["artifacts"][key])
        
        return artifacts
    
    def reset(self):
        """
        Reset the agent state
        """
        self.state = AgentState()
        self.memory.clear()
        logger.info("Agent state reset")
    
    def get_state(self) -> Dict[str, Any]:
        """
        Get the current agent state
        """
        return {
            "current_task": self.state.current_task,
            "completed_tasks": self.state.completed_tasks,
            "pending_tasks": self.state.pending_tasks,
            "memory_size": len(self.memory.interactions),
            "context": self.state.context
        }