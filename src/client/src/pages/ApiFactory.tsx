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
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  Description as OpenAPIIcon,
  Settings as ConfigIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ApiFactory: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [sourceType, setSourceType] = useState('');
  const [formData, setFormData] = useState({
    projectName: '',
    databaseUrl: '',
    openApiFile: null,
    config: ''
  });

  const steps = ['Choose Source', 'Configure', 'Generate', 'Deploy'];

  const sourceTypes = [
    {
      type: 'database',
      title: 'Database Schema',
      description: 'Generate API from existing database',
      icon: <DatabaseIcon sx={{ fontSize: 40 }} />,
      fields: [
        { name: 'databaseUrl', label: 'Database URL', type: 'text', placeholder: 'postgresql://user:pass@localhost:5432/db' }
      ]
    },
    {
      type: 'openapi',
      title: 'OpenAPI Specification',
      description: 'Generate API from OpenAPI spec file',
      icon: <OpenAPIIcon sx={{ fontSize: 40 }} />,
      fields: [
        { name: 'openApiFile', label: 'OpenAPI File', type: 'file', accept: '.json,.yaml' }
      ]
    },
    {
      type: 'config',
      title: 'Configuration',
      description: 'Generate API from configuration',
      icon: <ConfigIcon sx={{ fontSize: 40 }} />,
      fields: [
        { name: 'config', label: 'Configuration JSON', type: 'textarea', placeholder: '{"models": [...]}' }
      ]
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerate = () => {
    // API generation logic would go here
    console.log('Generating API with:', { sourceType, formData });
    handleNext();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {sourceTypes.map((source) => (
              <Grid item xs={12} md={4} key={source.type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: sourceType === source.type ? 2 : 1,
                    borderColor: sourceType === source.type ? 'primary.main' : 'divider'
                  }}
                  onClick={() => setSourceType(source.type)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {source.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {source.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {source.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        const selectedSource = sourceTypes.find(s => s.type === sourceType);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure {selectedSource?.title}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </Grid>
              {selectedSource?.fields.map((field) => (
                <Grid item xs={12} key={field.name}>
                  {field.type === 'textarea' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  ) : field.type === 'file' ? (
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ height: 56, justifyContent: 'flex-start' }}
                    >
                      {formData[field.name as keyof typeof formData] ? 'File Selected' : 'Select File'}
                      <input
                        type="file"
                        hidden
                        accept={field.accept}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.files?.[0] })}
                      />
                    </Button>
                  ) : (
                    <TextField
                      fullWidth
                      label={field.label}
                      placeholder={field.placeholder}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              API Generated Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your API has been generated with the following endpoints:
            </Typography>
            <Paper sx={{ p: 2, textAlign: 'left', mb: 3 }}>
              <Typography variant="body2" component="pre">
{`GET    /api/users     - Get all users
POST   /api/users     - Create user
GET    /api/users/:id - Get user by ID
PUT    /api/users/:id - Update user
DELETE /api/users/:id - Delete user`}
              </Typography>
            </Paper>
            <Button variant="contained" onClick={handleNext}>
              Download API
            </Button>
          </Box>
        );

      case 3:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Deploy Your API
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Choose how you'd like to deploy your generated API:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button variant="outlined" fullWidth>
                  Deploy to Heroku
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button variant="outlined" fullWidth>
                  Deploy to AWS
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button variant="outlined" fullWidth>
                  Deploy to Vercel
                </Button>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to use the API Factory
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to generate APIs and manage your projects.
          </Typography>
          <Button variant="contained" href="/login">
            Log In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        API Factory
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Generate complete REST APIs from various sources
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={() => setActiveStep(0)}>
                Start Over
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={activeStep === 1 ? handleGenerate : handleNext}
                disabled={activeStep === 0 && !sourceType}
              >
                {activeStep === 1 ? 'Generate API' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApiFactory;