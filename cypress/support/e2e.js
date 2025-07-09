// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import plugins - with error handling
try {
  require('cypress-mochawesome-reporter/register')
} catch (e) {
  console.log('Mochawesome reporter not available')
}

try {
  require('cypress-terminal-report/src/installLogsCollector')
} catch (e) {
  console.log('Terminal report not available')
}

try {
  require('@cypress/grep/src/support')
} catch (e) {
  console.log('Grep plugin not available')
}

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // We allow certain expected errors to not fail the test
  if (err.message.includes('Request failed with status code 422')) {
    return false
  }
  if (err.message.includes('Request failed with status code 401')) {
    return false
  }
  return true
})

// Global hooks
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage()
  
  // Set up network interceptors for API calls
  cy.intercept('GET', `${Cypress.env('apiUrl')}/articles*`, { fixture: 'articles.json' }).as('getArticles')
  cy.intercept('GET', `${Cypress.env('apiUrl')}/tags`, { fixture: 'tags.json' }).as('getTags')
  cy.intercept('GET', `${Cypress.env('apiUrl')}/user`, { fixture: 'user.json' }).as('getCurrentUser')
  
  // Visit the base URL
  cy.visit('/')
})

afterEach(() => {
  // Clean up after each test
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom assertions
Cypress.Commands.add('shouldBeVisible', (selector) => {
  cy.get(selector).should('be.visible')
})

Cypress.Commands.add('shouldContainText', (selector, text) => {
  cy.get(selector).should('contain', text)
})

Cypress.Commands.add('shouldHaveLength', (selector, length) => {
  cy.get(selector).should('have.length', length)
})

// Performance monitoring
Cypress.Commands.add('performanceCheck', () => {
  cy.window().then((win) => {
    const performanceEntries = win.performance.getEntriesByType('navigation')
    if (performanceEntries.length > 0) {
      const loadTime = performanceEntries[0].loadEventEnd - performanceEntries[0].navigationStart
      cy.log(`Page load time: ${loadTime}ms`)
      expect(loadTime).to.be.lessThan(5000) // 5 second threshold
    }
  })
})

// Accessibility checks
Cypress.Commands.add('checkA11y', () => {
  cy.get('[data-cy]').each(($el) => {
    cy.wrap($el).should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby')
  })
})

// Network monitoring
Cypress.Commands.add('waitForNetworkIdle', () => {
  cy.intercept('**/*').as('allRequests')
  cy.wait('@allRequests')
  cy.wait(1000) // Wait additional 1 second for network to settle
})