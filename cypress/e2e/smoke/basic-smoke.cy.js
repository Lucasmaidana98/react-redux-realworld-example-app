describe('Basic Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', { tags: ['@smoke', '@basic'] }, () => {
    // Check if the page loads
    cy.get('body').should('be.visible')
    
    // Check for key elements
    cy.contains('conduit', { matchCase: false }).should('be.visible')
    
    // Check if articles container exists (may be empty)
    cy.get('.article-preview, .article-list, [data-cy="article-list"], .container').should('exist')
  })

  it('should navigate to login page', { tags: ['@smoke', '@navigation'] }, () => {
    // Click on sign in link
    cy.contains('Sign in').click()
    
    // Should be on login page
    cy.url().should('include', '/login')
    
    // Check for login form elements
    cy.get('input[type="email"], input[placeholder*="email" i]').should('be.visible')
    cy.get('input[type="password"], input[placeholder*="password" i]').should('be.visible')
  })

  it('should navigate to register page', { tags: ['@smoke', '@navigation'] }, () => {
    // Click on sign up link
    cy.contains('Sign up').click()
    
    // Should be on register page
    cy.url().should('include', '/register')
    
    // Check for register form elements
    cy.get('input').should('have.length.at.least', 3)
  })

  it('should display navigation menu', { tags: ['@smoke', '@ui'] }, () => {
    // Check for navigation elements
    cy.get('nav, .navbar, header').should('exist')
    
    // Check for key navigation links
    cy.contains('Home').should('be.visible')
    cy.contains('Sign in').should('be.visible')
    cy.contains('Sign up').should('be.visible')
  })

  it('should handle responsive design on mobile', { tags: ['@smoke', '@responsive'] }, () => {
    cy.viewport('iphone-x')
    
    // Page should still be functional
    cy.get('body').should('be.visible')
    cy.contains('conduit', { matchCase: false }).should('be.visible')
  })
})