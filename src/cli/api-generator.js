#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const ApiGenerator = require('../api-factory/generators/ApiGenerator');
const path = require('path');

const program = new Command();

program
  .name('api-generator')
  .description('Generate REST APIs from various sources')
  .version('1.0.0');

program
  .command('from-database')
  .description('Generate API from database schema')
  .option('-d, --database <url>', 'Database connection URL')
  .option('-o, --output <dir>', 'Output directory')
  .option('-n, --name <name>', 'Project name')
  .action(async (options) => {
    const spinner = ora('Generating API from database...').start();
    
    try {
      const generator = new ApiGenerator();
      const result = await generator.generateFromDatabase(options.database, {
        projectName: options.name,
        outputDir: options.output
      });
      
      spinner.succeed('API generated successfully!');
      console.log(chalk.green(`\nGenerated files:`));
      result.generatedFiles.forEach(file => {
        console.log(chalk.blue(`  - ${file}`));
      });
      
      console.log(chalk.green(`\nEndpoints:`));
      result.endpoints.forEach(endpoint => {
        console.log(chalk.blue(`  ${endpoint.method} ${endpoint.path} - ${endpoint.description}`));
      });
      
      console.log(chalk.yellow(`\nNext steps:`));
      console.log(`1. cd ${options.output || 'generated-api'}`);
      console.log(`2. npm install`);
      console.log(`3. Set up your .env file with database URL and JWT secret`);
      console.log(`4. npm start`);
      
    } catch (error) {
      spinner.fail('Failed to generate API');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('from-openapi')
  .description('Generate API from OpenAPI specification')
  .option('-f, --file <path>', 'OpenAPI specification file')
  .option('-o, --output <dir>', 'Output directory')
  .option('-n, --name <name>', 'Project name')
  .action(async (options) => {
    const spinner = ora('Generating API from OpenAPI spec...').start();
    
    try {
      const fs = require('fs');
      const openApiSpec = JSON.parse(fs.readFileSync(options.file, 'utf8'));
      
      const generator = new ApiGenerator();
      const result = await generator.generateFromOpenAPI(openApiSpec, {
        projectName: options.name,
        outputDir: options.output
      });
      
      spinner.succeed('API generated successfully!');
      console.log(chalk.green(`\nGenerated files:`));
      result.generatedFiles.forEach(file => {
        console.log(chalk.blue(`  - ${file}`));
      });
      
    } catch (error) {
      spinner.fail('Failed to generate API');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('interactive')
  .description('Interactive API generation')
  .action(async () => {
    console.log(chalk.blue('🚀 Welcome to the API Generator!'));
    console.log(chalk.gray('Let\'s create your API step by step.\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'source',
        message: 'What would you like to generate an API from?',
        choices: [
          { name: 'Database Schema', value: 'database' },
          { name: 'OpenAPI Specification', value: 'openapi' },
          { name: 'Configuration File', value: 'config' }
        ]
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'What should we call your project?',
        default: 'my-api'
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Where should we save the generated files?',
        default: './generated-api'
      }
    ]);
    
    if (answers.source === 'database') {
      const dbAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'databaseType',
          message: 'What type of database are you using?',
          choices: [
            { name: 'PostgreSQL', value: 'postgresql' },
            { name: 'MySQL', value: 'mysql' },
            { name: 'SQLite', value: 'sqlite' },
            { name: 'MongoDB', value: 'mongodb' }
          ]
        },
        {
          type: 'input',
          name: 'host',
          message: 'Database host:',
          default: 'localhost'
        },
        {
          type: 'input',
          name: 'port',
          message: 'Database port:',
          default: (answers) => {
            const defaults = {
              postgresql: '5432',
              mysql: '3306',
              sqlite: '',
              mongodb: '27017'
            };
            return defaults[answers.databaseType];
          }
        },
        {
          type: 'input',
          name: 'database',
          message: 'Database name:',
          default: 'my_database'
        },
        {
          type: 'input',
          name: 'username',
          message: 'Username:',
          default: 'root'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          mask: '*'
        }
      ]);
      
      let databaseUrl;
      if (dbAnswers.databaseType === 'sqlite') {
        databaseUrl = `sqlite:./${dbAnswers.database}.db`;
      } else {
        databaseUrl = `${dbAnswers.databaseType}://${dbAnswers.username}:${dbAnswers.password}@${dbAnswers.host}:${dbAnswers.port}/${dbAnswers.database}`;
      }
      
      const spinner = ora('Generating API from database...').start();
      
      try {
        const generator = new ApiGenerator();
        const result = await generator.generateFromDatabase(databaseUrl, {
          projectName: answers.projectName,
          outputDir: answers.outputDir
        });
        
        spinner.succeed('API generated successfully!');
        console.log(chalk.green(`\nGenerated files:`));
        result.generatedFiles.forEach(file => {
          console.log(chalk.blue(`  - ${file}`));
        });
        
        console.log(chalk.yellow(`\nNext steps:`));
        console.log(`1. cd ${answers.outputDir}`);
        console.log(`2. npm install`);
        console.log(`3. Set up your .env file with database URL and JWT secret`);
        console.log(`4. npm start`);
        
      } catch (error) {
        spinner.fail('Failed to generate API');
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    }
  });

program.parse();