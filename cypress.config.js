const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4100',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,
    experimentalStudio: true,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      // Test users credentials - using demo credentials
      testUser: {
        email: 'demo@demo.com',
        password: 'demopassword',
        username: 'demo'
      },
      testUser2: {
        email: 'demo2@demo.com',
        password: 'demopassword',
        username: 'demo2'
      },
      // API configuration
      apiUrl: 'https://conduit.productionready.io/api',
      // Test data
      testArticle: {
        title: 'Test Article for Cypress',
        description: 'This is a test article created by Cypress',
        body: '# Test Article\n\nThis is the **body** of the test article with *markdown* formatting.\n\n- List item 1\n- List item 2\n- List item 3',
        tags: ['cypress', 'testing', 'automation']
      }
    },
    setupNodeEvents(on, config) {
      // Load plugins with error handling
      try {
        require('cypress-terminal-report/src/installLogsPrinter')(on);
      } catch (e) {
        console.log('Terminal report plugin not available');
      }
      
      try {
        require('cypress-mochawesome-reporter/plugin')(on);
      } catch (e) {
        console.log('Mochawesome reporter plugin not available');
      }
      
      try {
        require('@cypress/grep/src/plugin')(config);
      } catch (e) {
        console.log('Grep plugin not available');
      }
      
      // Custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      return config;
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  },

  // Reporter configuration
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'RealWorld App - Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mmddyyyy_HHMMss'
  }
});