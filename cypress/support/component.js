// ***********************************************************
// This example support/component.js is processed and
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

// Mount component helper
import { mount } from 'cypress/react'

Cypress.Commands.add('mount', mount)

// Component testing utilities
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  const { reduxStore, routerHistory, ...mountOptions } = options
  
  // This would wrap the component with necessary providers
  // For now, we'll just mount the component directly
  cy.mount(component, mountOptions)
})