// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// import 'cypress-file-upload' // Commented out to avoid dependency issues

// Authentication Commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy="email-input"]').type(email)
  cy.get('[data-cy="password-input"]').type(password)
  cy.get('[data-cy="login-button"]').click()
  cy.url().should('eq', Cypress.config('baseUrl') + '/')
  cy.window().its('localStorage').invoke('getItem', 'jwt').should('exist')
})

Cypress.Commands.add('loginAPI', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/login`,
    body: {
      user: {
        email,
        password
      }
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    window.localStorage.setItem('jwt', response.body.user.token)
    cy.visit('/')
  })
})

Cypress.Commands.add('register', (username, email, password) => {
  cy.visit('/register')
  cy.get('[data-cy="username-input"]').type(username)
  cy.get('[data-cy="email-input"]').type(email)
  cy.get('[data-cy="password-input"]').type(password)
  cy.get('[data-cy="register-button"]').click()
  cy.url().should('eq', Cypress.config('baseUrl') + '/')
  cy.window().its('localStorage').invoke('getItem', 'jwt').should('exist')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="settings-link"]').click()
  cy.get('[data-cy="logout-button"]').click()
  cy.url().should('eq', Cypress.config('baseUrl') + '/')
  cy.window().its('localStorage').invoke('getItem', 'jwt').should('not.exist')
})

// Article Management Commands
Cypress.Commands.add('createArticle', (title, description, body, tags = []) => {
  cy.get('[data-cy="new-post-link"]').click()
  cy.get('[data-cy="article-title-input"]').type(title)
  cy.get('[data-cy="article-description-input"]').type(description)
  cy.get('[data-cy="article-body-input"]').type(body)
  
  tags.forEach(tag => {
    cy.get('[data-cy="tag-input"]').type(`${tag}{enter}`)
  })
  
  cy.get('[data-cy="publish-button"]').click()
  cy.url().should('include', '/article/')
})

Cypress.Commands.add('editArticle', (title, description, body) => {
  cy.get('[data-cy="edit-article-button"]').click()
  cy.get('[data-cy="article-title-input"]').clear().type(title)
  cy.get('[data-cy="article-description-input"]').clear().type(description)
  cy.get('[data-cy="article-body-input"]').clear().type(body)
  cy.get('[data-cy="publish-button"]').click()
})

Cypress.Commands.add('deleteArticle', () => {
  cy.get('[data-cy="delete-article-button"]').click()
  cy.url().should('eq', Cypress.config('baseUrl') + '/')
})

Cypress.Commands.add('favoriteArticle', () => {
  cy.get('[data-cy="favorite-button"]').click()
  cy.get('[data-cy="favorite-button"]').should('contain', 'Unfavorite')
})

Cypress.Commands.add('unfavoriteArticle', () => {
  cy.get('[data-cy="favorite-button"]').click()
  cy.get('[data-cy="favorite-button"]').should('contain', 'Favorite')
})

// Comment Management Commands
Cypress.Commands.add('addComment', (comment) => {
  cy.get('[data-cy="comment-input"]').type(comment)
  cy.get('[data-cy="comment-submit-button"]').click()
  cy.get('[data-cy="comment-list"]').should('contain', comment)
})

Cypress.Commands.add('deleteComment', (commentText) => {
  cy.get('[data-cy="comment-list"]')
    .contains(commentText)
    .parent()
    .within(() => {
      cy.get('[data-cy="delete-comment-button"]').click()
    })
  cy.get('[data-cy="comment-list"]').should('not.contain', commentText)
})

// User Profile Commands
Cypress.Commands.add('visitProfile', (username) => {
  cy.visit(`/@${username}`)
  cy.get('[data-cy="profile-username"]').should('contain', username)
})

Cypress.Commands.add('followUser', (username) => {
  cy.visitProfile(username)
  cy.get('[data-cy="follow-button"]').click()
  cy.get('[data-cy="follow-button"]').should('contain', 'Unfollow')
})

Cypress.Commands.add('unfollowUser', (username) => {
  cy.visitProfile(username)
  cy.get('[data-cy="follow-button"]').click()
  cy.get('[data-cy="follow-button"]').should('contain', 'Follow')
})

// Navigation Commands
Cypress.Commands.add('navigateToHome', () => {
  cy.get('[data-cy="home-link"]').click()
  cy.url().should('eq', Cypress.config('baseUrl') + '/')
})

Cypress.Commands.add('navigateToEditor', () => {
  cy.get('[data-cy="new-post-link"]').click()
  cy.url().should('include', '/editor')
})

Cypress.Commands.add('navigateToSettings', () => {
  cy.get('[data-cy="settings-link"]').click()
  cy.url().should('include', '/settings')
})

Cypress.Commands.add('navigateToProfile', () => {
  cy.get('[data-cy="profile-link"]').click()
  cy.url().should('include', '/@')
})

// Form Validation Commands
Cypress.Commands.add('checkFormValidation', (selector, errorMessage) => {
  cy.get(selector).should('contain', errorMessage)
})

Cypress.Commands.add('checkRequiredField', (selector) => {
  cy.get(selector).should('have.attr', 'required')
})

// API Commands
Cypress.Commands.add('apiRequest', (method, endpoint, body = null) => {
  const token = window.localStorage.getItem('jwt')
  const headers = token ? { Authorization: `Token ${token}` } : {}
  
  cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    headers,
    body,
    failOnStatusCode: false
  })
})

// Data Attributes Commands
Cypress.Commands.add('getByDataCy', (selector) => {
  return cy.get(`[data-cy="${selector}"]`)
})

Cypress.Commands.add('containsDataCy', (selector) => {
  return cy.contains(`[data-cy="${selector}"]`)
})

// Utility Commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-cy="loading"]').should('not.exist')
  cy.get('body').should('be.visible')
})

Cypress.Commands.add('clearForm', (formSelector) => {
  cy.get(formSelector).within(() => {
    cy.get('input, textarea').clear()
  })
})

Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach(key => {
    cy.get(`[data-cy="${key}"]`).type(formData[key])
  })
})

// Screenshot Commands
Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name, { capture: 'fullPage' })
})

// Responsive Testing Commands
Cypress.Commands.add('checkResponsive', (breakpoints = [320, 768, 1024, 1920]) => {
  breakpoints.forEach(breakpoint => {
    cy.viewport(breakpoint, 720)
    cy.wait(500)
    cy.takeScreenshot(`responsive-${breakpoint}`)
  })
})

// Performance Commands
Cypress.Commands.add('measurePerformance', (testName) => {
  cy.window().then((win) => {
    const performanceEntries = win.performance.getEntriesByType('navigation')
    if (performanceEntries.length > 0) {
      const entry = performanceEntries[0]
      const metrics = {
        testName,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart,
        totalTime: entry.loadEventEnd - entry.navigationStart
      }
      cy.task('table', metrics)
    }
  })
})

// Database Commands (for test data setup)
Cypress.Commands.add('seedDatabase', () => {
  // This would typically reset and seed the database
  // For now, we'll just clear localStorage
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom Matchers
Cypress.Commands.add('shouldBeLoading', (selector) => {
  cy.get(selector).should('have.class', 'loading')
})

Cypress.Commands.add('shouldNotBeLoading', (selector) => {
  cy.get(selector).should('not.have.class', 'loading')
})

Cypress.Commands.add('shouldHaveValidationError', (selector, message) => {
  cy.get(selector).should('contain', message).and('have.class', 'error')
})