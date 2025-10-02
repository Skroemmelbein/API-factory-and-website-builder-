"""
Example usage of Devon Agent
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from devon_agent import DevonAgent

async def example_basic_task():
    """Example: Basic task execution"""
    print("=" * 50)
    print("Example 1: Basic Function Generation")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    result = await agent.process_request(
        "Write a Python function that checks if a number is prime"
    )
    
    print(f"Success: {result['success']}")
    print(f"Response: {result['response']['summary']}")
    print(f"Tasks completed: {result['tasks_completed']}")
    print()

async def example_api_creation():
    """Example: Create a REST API"""
    print("=" * 50)
    print("Example 2: REST API Creation")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    result = await agent.process_request(
        "Create a REST API for managing a book library with CRUD operations"
    )
    
    print(f"Success: {result['success']}")
    print(f"Response: {result['response']['summary']}")
    if result.get('artifacts'):
        print(f"Files created: {result['artifacts']['files_created']}")
    print()

async def example_debugging():
    """Example: Debug and fix code"""
    print("=" * 50)
    print("Example 3: Debugging Code")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    # First, create some buggy code
    buggy_code = '''
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)  # Bug: doesn't handle empty list
'''
    
    # Write the buggy code to a file
    with open("./example_workspace/buggy_code.py", "w") as f:
        f.write(buggy_code)
    
    result = await agent.process_request(
        "Find and fix the bug in buggy_code.py that causes division by zero"
    )
    
    print(f"Success: {result['success']}")
    print(f"Response: {result['response']['summary']}")
    print()

async def example_test_generation():
    """Example: Generate tests for existing code"""
    print("=" * 50)
    print("Example 4: Test Generation")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    result = await agent.process_request(
        "Write comprehensive unit tests for the prime number checker function"
    )
    
    print(f"Success: {result['success']}")
    print(f"Response: {result['response']['summary']}")
    print()

async def example_refactoring():
    """Example: Refactor existing code"""
    print("=" * 50)
    print("Example 5: Code Refactoring")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    # Create some code that needs refactoring
    messy_code = '''
def process_data(d):
    r = []
    for i in d:
        if i > 0:
            r.append(i * 2)
    return r
'''
    
    with open("./example_workspace/messy_code.py", "w") as f:
        f.write(messy_code)
    
    result = await agent.process_request(
        "Refactor messy_code.py to be more readable with better variable names and documentation"
    )
    
    print(f"Success: {result['success']}")
    print(f"Response: {result['response']['summary']}")
    print()

async def example_complex_project():
    """Example: Build a complex project"""
    print("=" * 50)
    print("Example 6: Complex Project")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    result = await agent.process_request("""
        Create a complete todo list application with:
        1. REST API with Flask
        2. SQLite database
        3. User authentication
        4. Frontend with HTML/CSS/JavaScript
        5. Docker configuration
    """)
    
    print(f"Success: {result['success']}")
    print(f"Response: {result['response']['summary']}")
    print(f"Total tasks: {result['response']['total_tasks']}")
    print(f"Successful tasks: {result['response']['successful_tasks']}")
    print()

async def example_with_memory():
    """Example: Using agent memory for context"""
    print("=" * 50)
    print("Example 7: Using Memory Context")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    # First request
    result1 = await agent.process_request(
        "Create a User class with name and email attributes"
    )
    print(f"First request: {result1['response']['summary']}")
    
    # Second request using context from first
    result2 = await agent.process_request(
        "Now add a method to the User class to validate the email format"
    )
    print(f"Second request: {result2['response']['summary']}")
    
    # Check memory
    memory_summary = agent.memory.summarize_session()
    print(f"Memory summary: {memory_summary}")
    print()

async def example_tool_usage():
    """Example: Direct tool usage"""
    print("=" * 50)
    print("Example 8: Direct Tool Usage")
    print("=" * 50)
    
    agent = DevonAgent(workspace_path="./example_workspace")
    
    # List available tools
    tools = agent.tools.list_tools()
    print("Available tools:")
    for tool in tools:
        print(f"  - {tool['name']}: {tool['description']}")
    
    # Use a specific tool
    result = await agent.tools.execute_tool(
        "code_analysis",
        code="""
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
""",
        language="python"
    )
    
    print(f"\nCode analysis result: {result}")
    print()

async def main():
    """Run all examples"""
    print("\n🤖 Devon Agent Examples\n")
    
    # Create example workspace
    os.makedirs("./example_workspace", exist_ok=True)
    
    try:
        # Run examples
        await example_basic_task()
        await example_api_creation()
        await example_debugging()
        await example_test_generation()
        await example_refactoring()
        await example_complex_project()
        await example_with_memory()
        await example_tool_usage()
        
        print("=" * 50)
        print("✅ All examples completed successfully!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error running examples: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())