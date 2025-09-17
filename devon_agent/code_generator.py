"""
Code Generation Module for Devon Agent
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
import ast
import logging

logger = logging.getLogger(__name__)


@dataclass
class CodeTemplate:
    """Represents a code template"""
    name: str
    language: str
    template: str
    variables: List[str]


class CodeGenerator:
    """
    Advanced code generation capabilities
    """
    
    def __init__(self):
        self.templates = self._load_templates()
        self.language_configs = {
            "python": {
                "extension": ".py",
                "comment": "#",
                "docstring": '"""'
            },
            "javascript": {
                "extension": ".js",
                "comment": "//",
                "docstring": "/**"
            },
            "typescript": {
                "extension": ".ts",
                "comment": "//",
                "docstring": "/**"
            }
        }
    
    def generate_code(self, 
                     description: str,
                     language: str = "python",
                     code_type: str = "function") -> str:
        """
        Generate code based on description
        
        Args:
            description: Natural language description
            language: Programming language
            code_type: Type of code to generate
            
        Returns:
            Generated code string
        """
        if language == "python":
            return self._generate_python(description, code_type)
        elif language in ["javascript", "typescript"]:
            return self._generate_javascript(description, code_type, language)
        else:
            return self._generate_generic(description, language)
    
    def _generate_python(self, description: str, code_type: str) -> str:
        """Generate Python code"""
        
        if code_type == "class":
            return self._generate_python_class(description)
        elif code_type == "function":
            return self._generate_python_function(description)
        elif code_type == "api":
            return self._generate_python_api(description)
        elif code_type == "test":
            return self._generate_python_test(description)
        else:
            return self._generate_python_generic(description)
    
    def _generate_python_class(self, description: str) -> str:
        """Generate a Python class"""
        # Extract class name from description
        class_name = self._extract_name(description, "class") or "GeneratedClass"
        
        return f'''class {class_name}:
    """
    {description}
    """
    
    def __init__(self, **kwargs):
        """Initialize {class_name}"""
        self.data = {{}}
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def process(self, input_data):
        """Process input data"""
        # TODO: Implement processing logic
        result = self._validate(input_data)
        if result:
            return self._transform(input_data)
        return None
    
    def _validate(self, data):
        """Validate input data"""
        if not data:
            raise ValueError("Input data cannot be empty")
        return True
    
    def _transform(self, data):
        """Transform data"""
        # TODO: Implement transformation
        return data
    
    def __repr__(self):
        """String representation"""
        return f"{class_name}(data={{self.data}})"
'''
    
    def _generate_python_function(self, description: str) -> str:
        """Generate a Python function"""
        func_name = self._extract_name(description, "function") or "process_data"
        
        # Analyze description for parameters
        params = self._extract_parameters(description)
        param_str = ", ".join(params) if params else "data"
        
        return f'''def {func_name}({param_str}):
    """
    {description}
    
    Args:
        {param_str}: Input parameter(s)
    
    Returns:
        Processed result
    """
    # Input validation
    if not {param_str.split(",")[0].strip()}:
        raise ValueError("Input cannot be None")
    
    # Main processing logic
    try:
        # TODO: Implement main logic
        result = []
        
        # Process input
        if isinstance({param_str.split(",")[0].strip()}, list):
            for item in {param_str.split(",")[0].strip()}:
                processed = _process_item(item)
                result.append(processed)
        else:
            result = _process_item({param_str.split(",")[0].strip()})
        
        return result
        
    except Exception as e:
        logger.error(f"Error in {func_name}: {{e}}")
        raise

def _process_item(item):
    """Helper function to process individual items"""
    # TODO: Implement item processing
    return {{
        "original": item,
        "processed": str(item).upper(),
        "timestamp": None
    }}
'''
    
    def _generate_python_api(self, description: str) -> str:
        """Generate Python API code"""
        return '''from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory data store (replace with database in production)
data_store = {}

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/v1/items', methods=['GET'])
def get_items():
    """Get all items"""
    try:
        # Add pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        items = list(data_store.values())
        start = (page - 1) * per_page
        end = start + per_page
        
        return jsonify({
            "items": items[start:end],
            "total": len(items),
            "page": page,
            "per_page": per_page
        })
    except Exception as e:
        logger.error(f"Error fetching items: {e}")
        abort(500)

@app.route('/api/v1/items/<item_id>', methods=['GET'])
def get_item(item_id):
    """Get specific item"""
    if item_id not in data_store:
        abort(404, description="Item not found")
    
    return jsonify(data_store[item_id])

@app.route('/api/v1/items', methods=['POST'])
def create_item():
    """Create new item"""
    if not request.json:
        abort(400, description="No data provided")
    
    try:
        # Generate ID
        item_id = str(len(data_store) + 1)
        
        # Create item
        item = {
            "id": item_id,
            "created_at": datetime.now().isoformat(),
            **request.json
        }
        
        data_store[item_id] = item
        
        return jsonify(item), 201
        
    except Exception as e:
        logger.error(f"Error creating item: {e}")
        abort(500)

@app.route('/api/v1/items/<item_id>', methods=['PUT'])
def update_item(item_id):
    """Update existing item"""
    if item_id not in data_store:
        abort(404, description="Item not found")
    
    if not request.json:
        abort(400, description="No data provided")
    
    try:
        # Update item
        data_store[item_id].update(request.json)
        data_store[item_id]["updated_at"] = datetime.now().isoformat()
        
        return jsonify(data_store[item_id])
        
    except Exception as e:
        logger.error(f"Error updating item: {e}")
        abort(500)

@app.route('/api/v1/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Delete item"""
    if item_id not in data_store:
        abort(404, description="Item not found")
    
    del data_store[item_id]
    return '', 204

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": str(error)}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
'''
    
    def _generate_python_test(self, description: str) -> str:
        """Generate Python test code"""
        return '''import unittest
from unittest.mock import Mock, patch, MagicMock
import pytest

class TestGenerated(unittest.TestCase):
    """Generated test suite"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_data = {
            "valid": [1, 2, 3, 4, 5],
            "empty": [],
            "single": [42],
            "negative": [-1, -2, -3]
        }
        self.mock_service = Mock()
    
    def tearDown(self):
        """Clean up after tests"""
        self.mock_service.reset_mock()
    
    def test_basic_functionality(self):
        """Test basic functionality"""
        # Arrange
        input_data = self.test_data["valid"]
        expected = 15
        
        # Act
        result = sum(input_data)
        
        # Assert
        self.assertEqual(result, expected)
        self.assertIsInstance(result, int)
    
    def test_edge_case_empty(self):
        """Test empty input edge case"""
        # Arrange
        input_data = self.test_data["empty"]
        
        # Act & Assert
        self.assertEqual(sum(input_data), 0)
        self.assertEqual(len(input_data), 0)
    
    def test_edge_case_single(self):
        """Test single element edge case"""
        # Arrange
        input_data = self.test_data["single"]
        
        # Act
        result = sum(input_data)
        
        # Assert
        self.assertEqual(result, 42)
        self.assertEqual(len(input_data), 1)
    
    def test_negative_values(self):
        """Test with negative values"""
        # Arrange
        input_data = self.test_data["negative"]
        
        # Act
        result = sum(input_data)
        
        # Assert
        self.assertEqual(result, -6)
        self.assertTrue(all(x < 0 for x in input_data))
    
    @patch('module.function_to_mock')
    def test_with_mock(self, mock_function):
        """Test using mocks"""
        # Arrange
        mock_function.return_value = "mocked_result"
        
        # Act
        result = mock_function("input")
        
        # Assert
        mock_function.assert_called_once_with("input")
        self.assertEqual(result, "mocked_result")
    
    def test_exception_handling(self):
        """Test exception handling"""
        # Arrange & Act & Assert
        with self.assertRaises(ValueError):
            # Code that should raise ValueError
            raise ValueError("Expected error")
    
    @pytest.mark.parametrize("input_val,expected", [
        ([1, 2, 3], 6),
        ([0, 0, 0], 0),
        ([-1, 1], 0),
    ])
    def test_parametrized(self, input_val, expected):
        """Parametrized test"""
        self.assertEqual(sum(input_val), expected)

if __name__ == '__main__':
    unittest.main()
'''
    
    def _generate_python_generic(self, description: str) -> str:
        """Generate generic Python code"""
        return f'''"""
Generated code for: {description}
"""

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

def main():
    """Main entry point"""
    try:
        # TODO: Implement main logic
        logger.info("Starting process...")
        
        # Initialize components
        data = initialize()
        
        # Process data
        result = process(data)
        
        # Output results
        output(result)
        
        logger.info("Process completed successfully")
        
    except Exception as e:
        logger.error(f"Process failed: {{e}}")
        raise

def initialize() -> Dict[str, Any]:
    """Initialize components"""
    return {{
        "config": {{}},
        "data": []
    }}

def process(data: Dict[str, Any]) -> Any:
    """Process data"""
    # TODO: Implement processing logic
    return data

def output(result: Any):
    """Output results"""
    print(f"Result: {{result}}")

if __name__ == "__main__":
    main()
'''
    
    def _generate_javascript(self, description: str, code_type: str, language: str) -> str:
        """Generate JavaScript/TypeScript code"""
        type_annotations = language == "typescript"
        
        if code_type == "class":
            return self._generate_js_class(description, type_annotations)
        elif code_type == "function":
            return self._generate_js_function(description, type_annotations)
        elif code_type == "api":
            return self._generate_js_api(description, type_annotations)
        else:
            return self._generate_js_generic(description, type_annotations)
    
    def _generate_js_class(self, description: str, typescript: bool) -> str:
        """Generate JavaScript/TypeScript class"""
        class_name = self._extract_name(description, "class") or "GeneratedClass"
        types = ": any" if typescript else ""
        
        return f'''class {class_name} {{
    /**
     * {description}
     */
    constructor(options{types} = {{}}) {{
        this.options = options;
        this.data = [];
        this.initialize();
    }}
    
    initialize(){types} {{
        // Initialize component
        console.log('{class_name} initialized');
    }}
    
    async process(input{types}){types} {{
        // Validate input
        if (!this.validate(input)) {{
            throw new Error('Invalid input');
        }}
        
        // Process data
        const result = await this.transform(input);
        this.data.push(result);
        
        return result;
    }}
    
    validate(input{types}){": boolean" if typescript else ""} {{
        // TODO: Implement validation
        return input !== null && input !== undefined;
    }}
    
    async transform(input{types}){types} {{
        // TODO: Implement transformation
        return {{
            original: input,
            processed: String(input).toUpperCase(),
            timestamp: new Date().toISOString()
        }};
    }}
    
    getData(){types} {{
        return this.data;
    }}
}}

{"export default" if typescript else "module.exports ="} {class_name};
'''
    
    def _generate_js_function(self, description: str, typescript: bool) -> str:
        """Generate JavaScript/TypeScript function"""
        func_name = self._extract_name(description, "function") or "processData"
        types = ": any" if typescript else ""
        
        return f'''/**
 * {description}
 */
{"export " if typescript else ""}{"async " if "async" in description.lower() else ""}function {func_name}(data{types}){types} {{
    // Input validation
    if (!data) {{
        throw new Error('Data is required');
    }}
    
    try {{
        // Main processing logic
        let result{types};
        
        if (Array.isArray(data)) {{
            result = await Promise.all(
                data.map(item => processItem(item))
            );
        }} else {{
            result = await processItem(data);
        }}
        
        return result;
        
    }} catch (error) {{
        console.error(`Error in {func_name}:`, error);
        throw error;
    }}
}}

async function processItem(item{types}){types} {{
    // TODO: Implement item processing
    return {{
        original: item,
        processed: String(item).toUpperCase(),
        timestamp: new Date().toISOString()
    }};
}}

{"" if typescript else f"module.exports = {{ {func_name} }};"}
'''
    
    def _generate_js_api(self, description: str, typescript: bool) -> str:
        """Generate Node.js Express API"""
        return '''const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data store
const dataStore = new Map();

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Get all items
app.get('/api/items', (req, res) => {
    try {
        const items = Array.from(dataStore.values());
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const start = (page - 1) * limit;
        const end = start + limit;
        
        res.json({
            items: items.slice(start, end),
            total: items.length,
            page,
            limit
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single item
app.get('/api/items/:id', (req, res) => {
    const item = dataStore.get(req.params.id);
    
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
});

// Create item
app.post('/api/items', (req, res) => {
    try {
        const id = String(dataStore.size + 1);
        const item = {
            id,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        dataStore.set(id, item);
        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update item
app.put('/api/items/:id', (req, res) => {
    const item = dataStore.get(req.params.id);
    
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    const updated = {
        ...item,
        ...req.body,
        id: req.params.id,
        updatedAt: new Date().toISOString()
    };
    
    dataStore.set(req.params.id, updated);
    res.json(updated);
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
    if (!dataStore.has(req.params.id)) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    dataStore.delete(req.params.id);
    res.status(204).send();
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
'''
    
    def _generate_js_generic(self, description: str, typescript: bool) -> str:
        """Generate generic JavaScript/TypeScript code"""
        return f'''/**
 * Generated code for: {description}
 */

{"const " if not typescript else ""}main{"" if typescript else " = async ()"} {"async ()" if typescript else ""} => {{
    try {{
        console.log('Starting process...');
        
        // Initialize
        const config = await initialize();
        
        // Process
        const result = await process(config);
        
        // Output
        output(result);
        
        console.log('Process completed successfully');
        
    }} catch (error) {{
        console.error('Process failed:', error);
        throw error;
    }}
}}{{";" if typescript else ""}}

{"const " if not typescript else ""}initialize{"" if typescript else " = async ()"} {"async ()" if typescript else ""} => {{
    // TODO: Initialize components
    return {{
        config: {{}},
        data: []
    }};
}}{{";" if typescript else ""}}

{"const " if not typescript else ""}process{"" if typescript else " = async (config)"} {"async (config: any)" if typescript else ""} => {{
    // TODO: Implement processing
    return config;
}}{{";" if typescript else ""}}

{"const " if not typescript else ""}output{"" if typescript else " = (result)"} {"(result: any)" if typescript else ""} => {{
    console.log('Result:', result);
}}{{";" if typescript else ""}}

// Run if main module
if (require.main === module) {{
    main().catch(console.error);
}}

{"export { main };" if typescript else "module.exports = { main };"}
'''
    
    def _generate_generic(self, description: str, language: str) -> str:
        """Generate generic code for unsupported languages"""
        config = self.language_configs.get(language, {
            "comment": "//",
            "docstring": "/**"
        })
        
        return f'''{config["comment"]} Generated code for: {description}
{config["comment"]} Language: {language}

{config["comment"]} TODO: Implement the following:
{config["comment"]} 1. Parse input
{config["comment"]} 2. Process data
{config["comment"]} 3. Return results

{config["comment"]} Main function
function main() {{
    {config["comment"]} Implementation goes here
}}
'''
    
    def _extract_name(self, description: str, code_type: str) -> Optional[str]:
        """Extract name from description"""
        # Look for patterns like "create a function called X"
        patterns = [
            rf'{code_type}\s+called\s+(\w+)',
            rf'{code_type}\s+named\s+(\w+)',
            rf'(\w+)\s+{code_type}',
            rf'create\s+(\w+)',
            rf'implement\s+(\w+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, description, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _extract_parameters(self, description: str) -> List[str]:
        """Extract parameters from description"""
        # Look for patterns like "takes X and Y"
        patterns = [
            r'takes?\s+([\w\s,]+)\s+as',
            r'with\s+parameters?\s+([\w\s,]+)',
            r'accepts?\s+([\w\s,]+)',
            r'parameters?:\s+([\w\s,]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, description, re.IGNORECASE)
            if match:
                params = match.group(1)
                return [p.strip() for p in params.split(',')]
        
        return []
    
    def _load_templates(self) -> Dict[str, CodeTemplate]:
        """Load code templates"""
        templates = {}
        
        # Add some basic templates
        templates["python_dataclass"] = CodeTemplate(
            name="python_dataclass",
            language="python",
            template='''from dataclasses import dataclass
from typing import Optional

@dataclass
class {class_name}:
    """
    {description}
    """
    {fields}
''',
            variables=["class_name", "description", "fields"]
        )
        
        return templates
    
    def refactor_code(self, code: str, language: str = "python") -> str:
        """
        Refactor existing code
        """
        if language == "python":
            return self._refactor_python(code)
        else:
            return code
    
    def _refactor_python(self, code: str) -> str:
        """Refactor Python code"""
        try:
            tree = ast.parse(code)
            
            # Add imports if missing
            has_logging = any(
                isinstance(node, ast.Import) and 
                any(alias.name == 'logging' for alias in node.names)
                for node in ast.walk(tree)
            )
            
            if not has_logging and "logger" in code:
                code = "import logging\n\n" + code
            
            # Add type hints if missing
            # This would require more complex AST manipulation
            
            return code
            
        except SyntaxError:
            return code