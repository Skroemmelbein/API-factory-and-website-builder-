"""
Memory Management Module for Devon Agent
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import deque
import json
import pickle
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Manages short-term and long-term memory for the agent
    """
    
    def __init__(self, max_short_term: int = 100, persistence_path: Optional[str] = None):
        """
        Initialize memory manager
        
        Args:
            max_short_term: Maximum number of items in short-term memory
            persistence_path: Path to persist long-term memory
        """
        self.short_term = deque(maxlen=max_short_term)
        self.long_term = {}
        self.interactions = []
        self.persistence_path = Path(persistence_path) if persistence_path else None
        
        # Load existing memory if available
        if self.persistence_path and self.persistence_path.exists():
            self.load_memory()
    
    def add_interaction(self, role: str, content: str, metadata: Dict[str, Any] = None):
        """
        Add an interaction to memory
        
        Args:
            role: Role of the speaker (user/assistant/system)
            content: Content of the interaction
            metadata: Additional metadata
        """
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "role": role,
            "content": content,
            "metadata": metadata or {}
        }
        
        self.interactions.append(interaction)
        self.short_term.append(interaction)
        
        # Extract and store important information in long-term memory
        self._extract_to_long_term(interaction)
    
    def get_recent_context(self, n: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent context from short-term memory
        
        Args:
            n: Number of recent items to retrieve
            
        Returns:
            List of recent interactions
        """
        return list(self.short_term)[-n:]
    
    def search_memory(self, query: str, memory_type: str = "all") -> List[Dict[str, Any]]:
        """
        Search through memory for relevant information
        
        Args:
            query: Search query
            memory_type: Type of memory to search (short_term/long_term/all)
            
        Returns:
            List of relevant memory items
        """
        results = []
        query_lower = query.lower()
        
        if memory_type in ["short_term", "all"]:
            for item in self.short_term:
                if query_lower in item.get("content", "").lower():
                    results.append(item)
        
        if memory_type in ["long_term", "all"]:
            for key, value in self.long_term.items():
                if query_lower in key.lower() or query_lower in str(value).lower():
                    results.append({
                        "type": "long_term",
                        "key": key,
                        "value": value
                    })
        
        return results
    
    def _extract_to_long_term(self, interaction: Dict[str, Any]):
        """
        Extract important information to long-term memory
        """
        content = interaction.get("content", "")
        
        # Extract file paths
        if "/" in content or "\\" in content:
            import re
            paths = re.findall(r'[./\\]?[\w./\\-]+\.\w+', content)
            for path in paths:
                self.long_term[f"file_{path}"] = {
                    "last_mentioned": interaction["timestamp"],
                    "context": content[:100]
                }
        
        # Extract function/class definitions
        if "def " in content or "class " in content:
            import re
            functions = re.findall(r'def\s+(\w+)', content)
            classes = re.findall(r'class\s+(\w+)', content)
            
            for func in functions:
                self.long_term[f"function_{func}"] = {
                    "defined_at": interaction["timestamp"],
                    "type": "function"
                }
            
            for cls in classes:
                self.long_term[f"class_{cls}"] = {
                    "defined_at": interaction["timestamp"],
                    "type": "class"
                }
        
        # Extract error messages
        if "error" in content.lower() or "exception" in content.lower():
            error_key = f"error_{len([k for k in self.long_term if k.startswith('error_')])}"
            self.long_term[error_key] = {
                "timestamp": interaction["timestamp"],
                "content": content[:200]
            }
    
    def get_file_history(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Get history related to a specific file
        """
        history = []
        
        for interaction in self.interactions:
            if file_path in interaction.get("content", ""):
                history.append(interaction)
        
        return history
    
    def get_error_history(self) -> List[Dict[str, Any]]:
        """
        Get history of errors encountered
        """
        errors = []
        
        for key, value in self.long_term.items():
            if key.startswith("error_"):
                errors.append(value)
        
        return errors
    
    def summarize_session(self) -> Dict[str, Any]:
        """
        Generate a summary of the current session
        """
        return {
            "total_interactions": len(self.interactions),
            "files_mentioned": len([k for k in self.long_term if k.startswith("file_")]),
            "functions_defined": len([k for k in self.long_term if k.startswith("function_")]),
            "classes_defined": len([k for k in self.long_term if k.startswith("class_")]),
            "errors_encountered": len([k for k in self.long_term if k.startswith("error_")]),
            "session_start": self.interactions[0]["timestamp"] if self.interactions else None,
            "last_interaction": self.interactions[-1]["timestamp"] if self.interactions else None
        }
    
    def save_memory(self):
        """
        Save memory to disk
        """
        if not self.persistence_path:
            return
        
        self.persistence_path.parent.mkdir(parents=True, exist_ok=True)
        
        memory_data = {
            "long_term": self.long_term,
            "interactions": self.interactions,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(self.persistence_path, 'wb') as f:
            pickle.dump(memory_data, f)
        
        logger.info(f"Memory saved to {self.persistence_path}")
    
    def load_memory(self):
        """
        Load memory from disk
        """
        if not self.persistence_path or not self.persistence_path.exists():
            return
        
        try:
            with open(self.persistence_path, 'rb') as f:
                memory_data = pickle.load(f)
            
            self.long_term = memory_data.get("long_term", {})
            self.interactions = memory_data.get("interactions", [])
            
            # Rebuild short-term memory from recent interactions
            for interaction in self.interactions[-self.short_term.maxlen:]:
                self.short_term.append(interaction)
            
            logger.info(f"Memory loaded from {self.persistence_path}")
        except Exception as e:
            logger.error(f"Failed to load memory: {e}")
    
    def clear(self):
        """
        Clear all memory
        """
        self.short_term.clear()
        self.long_term.clear()
        self.interactions.clear()
        logger.info("Memory cleared")
    
    def export_to_json(self, file_path: str):
        """
        Export memory to JSON format
        """
        export_data = {
            "summary": self.summarize_session(),
            "recent_context": list(self.short_term),
            "long_term_keys": list(self.long_term.keys()),
            "interactions_count": len(self.interactions)
        }
        
        with open(file_path, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        logger.info(f"Memory exported to {file_path}")