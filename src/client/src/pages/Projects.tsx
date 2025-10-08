import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Code as CodeIcon,
  Web as WebIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
  type: 'api' | 'website' | 'fullstack';
  description: string;
  status: 'draft' | 'generating' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    
    try {
      await axios.delete(`/api/projects/${selectedProject.id}`);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      const res = await axios.post('/api/builder/create', {
        templateId,
        project: { name: `Website from ${templateId}` }
      });
      // Refresh projects after creation
      await fetchProjects();
      return res.data;
    } catch (e) {
      console.error('Failed to create project from template', e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'generating': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <CodeIcon />;
      case 'website': return <WebIcon />;
      default: return <CodeIcon />;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Please log in to view your projects
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to manage your projects.
          </Typography>
          <Button variant="contained" href="/login">
            Log In
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          My Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href="/api-factory"
        >
          New Project
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center" sx={{ py: 4 }}>
          <Typography>Loading projects...</Typography>
        </Box>
      ) : projects.length === 0 ? (
        <Box textAlign="center" sx={{ py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No projects yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start by creating your first API or website
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" href="/api-factory">
              Generate API
            </Button>
            <Button variant="outlined" href="/website-builder">
              Build Website
            </Button>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(project.type)}
                      <Typography variant="h6" component="h2">
                        {project.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, project)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={project.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={project.status}
                      size="small"
                      color={getStatusColor(project.status) as any}
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<DownloadIcon />}>
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Project Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        href="/api-factory"
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Projects;