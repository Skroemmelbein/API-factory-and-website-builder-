const fs = require('fs').promises;
const path = require('path');

class WebsiteBuilder {
  constructor() {
    this.components = new Map();
    this.themes = new Map();
    this.templates = new Map();
    this.loadComponents();
    this.loadThemes();
    this.loadTemplates();
  }

  async loadComponents() {
    const componentsDir = path.join(__dirname, 'components');
    try {
      const files = await fs.readdir(componentsDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const componentName = path.basename(file, '.js');
          const component = require(path.join(componentsDir, file));
          this.components.set(componentName, component);
        }
      }
    } catch (error) {
      console.warn('No components directory found, using default components');
      this.loadDefaultComponents();
    }
  }

  loadDefaultComponents() {
    const defaultComponents = {
      'Header': {
        name: 'Header',
        type: 'layout',
        props: {
          title: { type: 'string', default: 'My Website' },
          logo: { type: 'string', default: '' },
          navigation: { type: 'array', default: [] }
        },
        template: `<header class="header">
  <div class="container">
    <div class="logo">
      <img src="{{logo}}" alt="{{title}}" />
      <h1>{{title}}</h1>
    </div>
    <nav class="navigation">
      {{#each navigation}}
      <a href="{{url}}" class="nav-link">{{label}}</a>
      {{/each}}
    </nav>
  </div>
</header>`,
        styles: `.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navigation {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #007bff;
}`
      },
      'Hero': {
        name: 'Hero',
        type: 'content',
        props: {
          title: { type: 'string', default: 'Welcome to Our Website' },
          subtitle: { type: 'string', default: 'We create amazing digital experiences' },
          buttonText: { type: 'string', default: 'Get Started' },
          buttonUrl: { type: 'string', default: '#' },
          backgroundImage: { type: 'string', default: '' }
        },
        template: `<section class="hero" style="background-image: url('{{backgroundImage}}')">
  <div class="hero-content">
    <h1>{{title}}</h1>
    <p>{{subtitle}}</p>
    <a href="{{buttonUrl}}" class="cta-button">{{buttonText}}</a>
  </div>
</section>`,
        styles: `.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 4rem 2rem;
  background-size: cover;
  background-position: center;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  background: #fff;
  color: #333;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: transform 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
}`
      },
      'Card': {
        name: 'Card',
        type: 'content',
        props: {
          title: { type: 'string', default: 'Card Title' },
          content: { type: 'string', default: 'Card content goes here' },
          image: { type: 'string', default: '' },
          buttonText: { type: 'string', default: 'Learn More' },
          buttonUrl: { type: 'string', default: '#' }
        },
        template: `<div class="card">
  {{#if image}}
  <img src="{{image}}" alt="{{title}}" class="card-image" />
  {{/if}}
  <div class="card-content">
    <h3>{{title}}</h3>
    <p>{{content}}</p>
    <a href="{{buttonUrl}}" class="card-button">{{buttonText}}</a>
  </div>
</div>`,
        styles: `.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-content h3 {
  margin-bottom: 1rem;
  color: #333;
}

.card-content p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.card-button {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.card-button:hover {
  background: #0056b3;
}`
      }
    };

    for (const [name, component] of Object.entries(defaultComponents)) {
      this.components.set(name, component);
    }
  }

  async loadThemes() {
    const themesDir = path.join(__dirname, 'themes');
    try {
      const files = await fs.readdir(themesDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const themeName = path.basename(file, '.js');
          const theme = require(path.join(themesDir, file));
          this.themes.set(themeName, theme);
        }
      }
    } catch (error) {
      console.warn('No themes directory found, using default themes');
      this.loadDefaultThemes();
    }
  }

  loadDefaultThemes() {
    const defaultThemes = {
      'modern': {
        name: 'Modern',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          danger: '#dc3545',
          warning: '#ffc107',
          info: '#17a2b8',
          light: '#f8f9fa',
          dark: '#343a40'
        },
        fonts: {
          primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          secondary: 'Georgia, serif'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '3rem'
        }
      },
      'minimal': {
        name: 'Minimal',
        colors: {
          primary: '#000000',
          secondary: '#666666',
          success: '#000000',
          danger: '#ff0000',
          warning: '#ffff00',
          info: '#0000ff',
          light: '#ffffff',
          dark: '#000000'
        },
        fonts: {
          primary: 'Helvetica, Arial, sans-serif',
          secondary: 'Times, serif'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '2rem',
          xl: '4rem'
        }
      },
      'liquid-glass': {
        name: 'Liquid Glass',
        colors: {
          primary: '#8EC5FC',
          secondary: '#E0C3FC',
          success: '#88d4ab',
          danger: '#ff6b6b',
          warning: '#ffd166',
          info: '#a0c4ff',
          light: 'rgba(255,255,255,0.6)',
          dark: 'rgba(0,0,0,0.6)'
        },
        fonts: {
          primary: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          secondary: 'Rubik, system-ui, sans-serif'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '2rem',
          xl: '3rem'
        }
      }
    };

    for (const [name, theme] of Object.entries(defaultThemes)) {
      this.themes.set(name, theme);
    }
  }

  async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    try {
      const files = await fs.readdir(templatesDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const templateName = path.basename(file, '.js');
          const template = require(path.join(templatesDir, file));
          this.templates.set(templateName, template);
        }
      }
    } catch (error) {
      console.warn('No templates directory found, using default templates');
      this.loadDefaultTemplates();
    }
  }

  loadDefaultTemplates() {
    // Seed core templates
    const baseTemplates = {
      'landing-page': {
        id: 'landing-page',
        name: 'Landing Page',
        description: 'A modern landing page with hero section and features',
        components: [
          { type: 'Header', props: { title: 'My Company', navigation: [
            { label: 'Home', url: '#' },
            { label: 'About', url: '#about' },
            { label: 'Contact', url: '#contact' }
          ]}},
          { type: 'Hero', props: { 
            title: 'Welcome to Our Company',
            subtitle: 'We create amazing digital experiences',
            buttonText: 'Get Started',
            buttonUrl: '#contact'
          }},
          { type: 'Card', props: { 
            title: 'Feature 1',
            content: 'This is a great feature that will help your business grow.',
            buttonText: 'Learn More',
            buttonUrl: '#'
          }}
        ],
        theme: 'modern'
      },
      'portfolio': {
        id: 'portfolio',
        name: 'Portfolio',
        description: 'A clean portfolio website to showcase your work',
        components: [
          { type: 'Header', props: { title: 'John Doe', navigation: [
            { label: 'Work', url: '#work' },
            { label: 'About', url: '#about' },
            { label: 'Contact', url: '#contact' }
          ]}},
          { type: 'Hero', props: { 
            title: 'Creative Designer',
            subtitle: 'I create beautiful and functional designs',
            buttonText: 'View My Work',
            buttonUrl: '#work'
          }}
        ],
        theme: 'minimal'
      }
    };

    for (const [name, template] of Object.entries(baseTemplates)) {
      this.templates.set(name, template);
    }

    // Programmatically generate 50 Liquid Glass templates
    const totalTemplates = 50;
    for (let i = 1; i <= totalTemplates; i++) {
      const id = `liquid-glass-${String(i).padStart(2, '0')}`;
      const template = {
        id,
        name: `Liquid Glass ${String(i).padStart(2, '0')}`,
        description: 'Liquid Glass aesthetic with frosted, blurred surfaces and soft gradients',
        components: [
          {
            type: 'Header',
            props: {
              title: `LG ${String(i).padStart(2, '0')} Brand`,
              navigation: [
                { label: 'Home', url: '#' },
                { label: 'Features', url: '#features' },
                { label: 'Contact', url: '#contact' }
              ]
            }
          },
          {
            type: 'Hero',
            props: {
              title: 'Next‑Gen Liquid Glass UI',
              subtitle: 'Elegant frosted surfaces • Depth • Soft shadows',
              buttonText: 'Get Started',
              buttonUrl: '#contact',
              backgroundImage: ''
            }
          },
          {
            type: 'Card',
            props: {
              title: 'Beautifully Minimal',
              content: 'Crisp typography and glassy panels focus attention.',
              buttonText: 'Learn More',
              buttonUrl: '#'
            }
          }
        ],
        theme: 'liquid-glass'
      };
      this.templates.set(id, template);
    }
  }

  getAvailableComponents() {
    return Array.from(this.components.values()).map(component => ({
      name: component.name,
      type: component.type,
      props: component.props
    }));
  }

  getAvailableThemes() {
    return Array.from(this.themes.values());
  }

  getAvailableTemplates() {
    // Include template IDs to allow the UI to reference precise selections
    return Array.from(this.templates.entries()).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      theme: template.theme
    }));
  }

  async createFromTemplate(templateId, options = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    const { projectId, customizations = {} } = options;
    const design = {
      id: `design-${Date.now()}`,
      projectId,
      template: templateId,
      theme: template.theme,
      components: template.components.map(comp => ({
        ...comp,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      customizations,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save design (in a real implementation, this would be saved to a database)
    await this.saveDesign(design);

    return {
      success: true,
      design,
      preview: await this.generatePreview(design)
    };
  }

  async updateDesign(projectId, design) {
    design.updatedAt = new Date();
    await this.saveDesign(design);
    
    return {
      success: true,
      design,
      preview: await this.generatePreview(design)
    };
  }

  async generatePreview(design) {
    const html = await this.generateHTML(design);
    const css = await this.generateCSS(design);
    
    return {
      html,
      css,
      previewUrl: `/preview/${design.id}`
    };
  }

  async generateHTML(design) {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>`;

    for (const componentData of design.components) {
      const component = this.components.get(componentData.type);
      if (component) {
        let componentHTML = component.template;
        
        // Replace placeholders with actual values
        for (const [key, value] of Object.entries(componentData.props)) {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          componentHTML = componentHTML.replace(placeholder, value || '');
        }
        
        // Handle loops (simplified)
        componentHTML = componentHTML.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
          const array = componentData.props[arrayName] || [];
          return array.map(item => {
            let itemContent = content;
            for (const [key, value] of Object.entries(item)) {
              const placeholder = new RegExp(`{{${key}}}`, 'g');
              itemContent = itemContent.replace(placeholder, value || '');
            }
            return itemContent;
          }).join('');
        });
        
        html += `\n    ${componentHTML}`;
      }
    }

    html += `
</body>
</html>`;

    return html;
  }

  async generateCSS(design) {
    const theme = this.themes.get(design.theme);
    let css = `/* Generated CSS for ${design.theme} theme */\n\n`;

    // Add theme variables
    if (theme) {
      css += `:root {\n`;
      for (const [key, value] of Object.entries(theme.colors)) {
        css += `  --color-${key}: ${value};\n`;
      }
      for (const [key, value] of Object.entries(theme.fonts)) {
        css += `  --font-${key}: ${value};\n`;
      }
      for (const [key, value] of Object.entries(theme.spacing)) {
        css += `  --spacing-${key}: ${value};\n`;
      }
      css += `}\n\n`;
    }

    // Add component styles
    for (const componentData of design.components) {
      const component = this.components.get(componentData.type);
      if (component && component.styles) {
        css += `/* ${component.name} styles */\n`;
        css += component.styles;
        css += `\n\n`;
      }
    }

    // Liquid Glass global styles
    if (design.theme === 'liquid-glass') {
      css += `/* Liquid Glass utility styles */\n`;
      css += `.glass {\n`;
      css += `  background: rgba(255, 255, 255, 0.08);\n`;
      css += `  border-radius: 16px;\n`;
      css += `  border: 1px solid rgba(255, 255, 255, 0.18);\n`;
      css += `  backdrop-filter: blur(12px);\n`;
      css += `  -webkit-backdrop-filter: blur(12px);\n`;
      css += `  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);\n`;
      css += `}\n\n`;

      // Apply glass effect to core components by default
      css += `.header, .hero, .card {\n`;
      css += `  background: rgba(255,255,255,0.08);\n`;
      css += `  border: 1px solid rgba(255,255,255,0.18);\n`;
      css += `  backdrop-filter: blur(10px);\n`;
      css += `  -webkit-backdrop-filter: blur(10px);\n`;
      css += `}\n\n`;

      // Soft gradient background for the page
      css += `body {\n`;
      css += `  background: radial-gradient(1200px circle at 10% 10%, #8EC5FC 0%, rgba(142,197,252,0) 40%),\n`;
      css += `              radial-gradient(1200px circle at 90% 20%, #E0C3FC 0%, rgba(224,195,252,0) 40%),\n`;
      css += `              linear-gradient(135deg, #0f172a 0%, #111827 100%);\n`;
      css += `  min-height: 100vh;\n`;
      css += `}\n\n`;
    }

    // Add responsive styles
    css += `/* Responsive styles */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
}`;

    return css;
  }

  async exportWebsite(projectId, format, options = {}) {
    const design = await this.getDesign(projectId);
    if (!design) {
      throw new Error(`Design for project ${projectId} not found`);
    }

    const html = await this.generateHTML(design);
    const css = await this.generateCSS(design);

    switch (format) {
      case 'html':
        return await this.exportAsHTML(html, css, options);
      case 'react':
        return await this.exportAsReact(design, options);
      case 'vue':
        return await this.exportAsVue(design, options);
      case 'static':
        return await this.exportAsStatic(html, css, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async exportAsHTML(html, css, options) {
    const outputDir = options.outputDir || `./exported-html-${Date.now()}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    await fs.writeFile(path.join(outputDir, 'index.html'), html);
    await fs.writeFile(path.join(outputDir, 'styles.css'), css);
    
    return {
      format: 'html',
      outputDir,
      files: ['index.html', 'styles.css']
    };
  }

  async exportAsReact(design, options) {
    // This would generate React components
    return {
      format: 'react',
      message: 'React export not yet implemented'
    };
  }

  async exportAsVue(design, options) {
    // This would generate Vue components
    return {
      format: 'vue',
      message: 'Vue export not yet implemented'
    };
  }

  async exportAsStatic(html, css, options) {
    const outputDir = options.outputDir || `./static-site-${Date.now()}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    await fs.writeFile(path.join(outputDir, 'index.html'), html);
    await fs.writeFile(path.join(outputDir, 'styles.css'), css);
    
    // Add package.json for easy deployment
    const packageJson = {
      name: 'generated-website',
      version: '1.0.0',
      scripts: {
        start: 'npx serve .',
        build: 'echo "Static site ready for deployment"'
      }
    };
    
    await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    return {
      format: 'static',
      outputDir,
      files: ['index.html', 'styles.css', 'package.json']
    };
  }

  async saveDesign(design) {
    // In a real implementation, this would save to a database
    // For now, we'll just log it
    console.log('Saving design:', design.id);
  }

  async getDesign(projectId) {
    // In a real implementation, this would fetch from a database
    // For now, return a mock design
    return {
      id: `design-${projectId}`,
      projectId,
      template: 'landing-page',
      theme: 'modern',
      components: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

module.exports = WebsiteBuilder;