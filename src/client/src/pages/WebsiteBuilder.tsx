import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Palette as PaletteIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const WebsiteBuilder: React.FC = () => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [components, setComponents] = useState<any[]>([]);

  const templates = [
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'Modern landing page with hero section',
      preview: '/api/placeholder/400/300'
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Clean portfolio website',
      preview: '/api/placeholder/400/300'
    },
    {
      id: 'blog',
      name: 'Blog',
      description: 'Professional blog layout',
      preview: '/api/placeholder/400/300'
    }
  ];

  const availableComponents = [
    { type: 'Header', name: 'Header', icon: '🏠' },
    { type: 'Hero', name: 'Hero Section', icon: '🎯' },
    { type: 'Card', name: 'Card', icon: '📄' },
    { type: 'Footer', name: 'Footer', icon: '🔗' },
    { type: 'Button', name: 'Button', icon: '🔘' },
    { type: 'Text', name: 'Text Block', icon: '📝' }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsDrawerOpen(false);
  };

  const handleAddComponent = (componentType: string) => {
    const newComponent = {
      id: Date.now(),
      type: componentType,
      props: {}
    };
    setComponents([...components, newComponent]);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to use the Website Builder
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to build websites and manage your projects.
          </Typography>
          <Button variant="contained" href="/login">
            Log In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Website Builder
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                sx={{ mr: 1 }}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ mr: 1 }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsDrawerOpen(true)}
              >
                Add Component
              </Button>
            </Box>
          </Box>

          {/* Canvas Area */}
          <Paper
            sx={{
              minHeight: '70vh',
              border: '2px dashed #ccc',
              p: 2,
              position: 'relative'
            }}
          >
            {components.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '60vh',
                  color: 'text.secondary'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Start Building Your Website
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Choose a template or add components to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Add Your First Component
                </Button>
              </Box>
            ) : (
              <Box>
                {components.map((component) => (
                  <Card
                    key={component.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Typography variant="h6">
                      {component.type} Component
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Component content will be rendered here
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Component Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Add Components</Typography>
          <IconButton onClick={() => setIsDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Choose a Template
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {templates.map((template) => (
            <Grid item xs={12} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedTemplate === template.id ? 2 : 1,
                  borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider'
                }}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle1" gutterBottom>
          Add Components
        </Typography>
        <List>
          {availableComponents.map((component) => (
            <ListItem
              key={component.type}
              button
              onClick={() => handleAddComponent(component.type)}
              sx={{ borderRadius: 1, mb: 1 }}
            >
              <ListItemIcon>
                <Typography sx={{ fontSize: '1.5rem' }}>
                  {component.icon}
                </Typography>
              </ListItemIcon>
              <ListItemText primary={component.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default WebsiteBuilder;