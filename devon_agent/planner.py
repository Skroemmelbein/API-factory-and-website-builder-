"""
Task Planning Module for Devon Agent
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
import logging

logger = logging.getLogger(__name__)


@dataclass
class TaskPlan:
    """Represents a plan of tasks to execute"""
    tasks: List[str]
    dependencies: Dict[str, List[str]]
    estimated_time: Optional[float] = None
    complexity: Optional[str] = None


class TaskPlanner:
    """
    Responsible for breaking down user requests into actionable tasks
    """
    
    def __init__(self, model: str = "gpt-4"):
        self.model = model
        self.planning_strategies = {
            "sequential": self._sequential_planning,
            "parallel": self._parallel_planning,
            "hierarchical": self._hierarchical_planning
        }
    
    async def create_plan(self, request: str, context: Dict[str, Any] = None) -> TaskPlan:
        """
        Create an execution plan from a user request
        
        Args:
            request: The user's request in natural language
            context: Additional context for planning
            
        Returns:
            A TaskPlan object with ordered tasks
        """
        logger.info("Creating execution plan...")
        
        # Analyze the request complexity
        complexity = self._analyze_complexity(request)
        
        # Choose planning strategy based on complexity
        strategy = self._select_strategy(complexity)
        
        # Generate the plan
        tasks = await self.planning_strategies[strategy](request, context)
        
        # Identify dependencies
        dependencies = self._identify_dependencies(tasks)
        
        plan = TaskPlan(
            tasks=tasks,
            dependencies=dependencies,
            complexity=complexity
        )
        
        logger.info(f"Plan created with {len(tasks)} tasks")
        return plan
    
    def _analyze_complexity(self, request: str) -> str:
        """
        Analyze the complexity of a request
        """
        # Simple heuristic based on request length and keywords
        complex_keywords = ["implement", "refactor", "optimize", "migrate", "deploy"]
        simple_keywords = ["fix", "add", "update", "change", "rename"]
        
        request_lower = request.lower()
        
        if any(keyword in request_lower for keyword in complex_keywords):
            return "complex"
        elif any(keyword in request_lower for keyword in simple_keywords):
            return "simple"
        elif len(request) > 200:
            return "complex"
        else:
            return "moderate"
    
    def _select_strategy(self, complexity: str) -> str:
        """
        Select planning strategy based on complexity
        """
        strategy_map = {
            "simple": "sequential",
            "moderate": "parallel",
            "complex": "hierarchical"
        }
        return strategy_map.get(complexity, "sequential")
    
    async def _sequential_planning(self, request: str, context: Dict[str, Any] = None) -> List[str]:
        """
        Create a sequential plan where tasks are executed one after another
        """
        # For now, using a simple template-based approach
        # In production, this would use the LLM
        tasks = []
        
        if "test" in request.lower():
            tasks.append("Analyze existing test coverage")
            tasks.append("Write unit tests")
            tasks.append("Run tests and verify")
        elif "api" in request.lower():
            tasks.append("Design API endpoints")
            tasks.append("Implement API handlers")
            tasks.append("Add API documentation")
        elif "bug" in request.lower() or "fix" in request.lower():
            tasks.append("Identify the bug location")
            tasks.append("Analyze root cause")
            tasks.append("Implement fix")
            tasks.append("Verify fix works")
        else:
            tasks.append("Understand requirements")
            tasks.append("Implement solution")
            tasks.append("Test implementation")
        
        return tasks
    
    async def _parallel_planning(self, request: str, context: Dict[str, Any] = None) -> List[str]:
        """
        Create a plan where some tasks can be executed in parallel
        """
        # Similar to sequential but with parallelizable tasks
        tasks = await self._sequential_planning(request, context)
        
        # Mark certain tasks as parallelizable (simplified)
        parallel_tasks = []
        for i, task in enumerate(tasks):
            if "test" in task.lower() or "document" in task.lower():
                parallel_tasks.append(f"[Parallel] {task}")
            else:
                parallel_tasks.append(task)
        
        return parallel_tasks
    
    async def _hierarchical_planning(self, request: str, context: Dict[str, Any] = None) -> List[str]:
        """
        Create a hierarchical plan with main tasks and subtasks
        """
        # Break down into high-level tasks first
        high_level_tasks = [
            "1. Analyze requirements",
            "2. Design solution architecture",
            "3. Implement core functionality",
            "4. Add error handling and edge cases",
            "5. Write tests",
            "6. Document implementation"
        ]
        
        # Expand each high-level task (simplified)
        detailed_tasks = []
        for task in high_level_tasks:
            detailed_tasks.append(task)
            if "Implement" in task:
                detailed_tasks.append("  - Set up project structure")
                detailed_tasks.append("  - Implement main logic")
                detailed_tasks.append("  - Add helper functions")
            elif "test" in task.lower():
                detailed_tasks.append("  - Write unit tests")
                detailed_tasks.append("  - Write integration tests")
        
        return detailed_tasks
    
    def _identify_dependencies(self, tasks: List[str]) -> Dict[str, List[str]]:
        """
        Identify dependencies between tasks
        """
        dependencies = {}
        
        for i, task in enumerate(tasks):
            deps = []
            
            # Simple heuristic: tasks depend on previous non-parallel tasks
            if i > 0 and not task.startswith("[Parallel]"):
                for j in range(i - 1, -1, -1):
                    if not tasks[j].startswith("[Parallel]"):
                        deps.append(tasks[j])
                        break
            
            if deps:
                dependencies[task] = deps
        
        return dependencies
    
    def optimize_plan(self, plan: TaskPlan) -> TaskPlan:
        """
        Optimize a plan for better execution
        """
        # Remove redundant tasks
        unique_tasks = []
        seen = set()
        
        for task in plan.tasks:
            task_key = task.lower().strip()
            if task_key not in seen:
                unique_tasks.append(task)
                seen.add(task_key)
        
        plan.tasks = unique_tasks
        return plan