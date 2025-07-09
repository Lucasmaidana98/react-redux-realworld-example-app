describe('Real App Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', { tags: ['@smoke', '@basic'] }, () => {
    // Check if the page loads
    cy.get('body').should('be.visible')
    
    // Check for conduit branding (case insensitive)
    cy.get('.navbar-brand, .brand, h1').should('contain.text', 'conduit')
    
    // Check for navigation
    cy.get('.nav, .navbar, nav').should('exist')
    
    // Check for main content area
    cy.get('.container, .main, main, .content').should('exist')
  })

  it('should navigate to login page', { tags: ['@smoke', '@navigation'] }, () => {
    // Look for sign in link (multiple possible selectors)
    cy.get('a').contains(/sign in/i).click()
    
    // Should be on login page
    cy.url().should('include', '/login')
    
    // Check for login form
    cy.get('form').should('exist')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should navigate to register page', { tags: ['@smoke', '@navigation'] }, () => {
    // Look for sign up link
    cy.get('a').contains(/sign up/i).click()
    
    // Should be on register page
    cy.url().should('include', '/register')
    
    // Check for register form (should have 3 inputs: username, email, password)
    cy.get('form').should('exist')
    cy.get('input').should('have.length.at.least', 3)
  })

  it('should display banner for non-authenticated users', { tags: ['@smoke', '@ui'] }, () => {
    // Check for banner/hero section
    cy.get('.banner, .hero, .jumbotron').should('exist')
    
    // Should contain conduit branding
    cy.get('.banner, .hero, .jumbotron').should('contain.text', 'conduit')
  })

  it('should display popular tags', { tags: ['@smoke', '@ui'] }, () => {
    // Check for tags sidebar or section
    cy.get('.sidebar, .tags, .tag-list').should('exist')
    
    // Should have some tags
    cy.get('.tag-default, .tag-pill, .tag').should('exist')
  })

  it('should display article feed', { tags: ['@smoke', '@articles'] }, () => {
    // Check for article feed
    cy.get('.article-preview, .article-list, .feed').should('exist')
    
    // Should have feed tabs
    cy.get('.feed-toggle, .nav-tabs').should('exist')
    cy.get('a').contains(/global feed/i).should('exist')
  })

  it('should be responsive on mobile', { tags: ['@smoke', '@responsive'] }, () => {
    cy.viewport('iphone-x')
    
    // Page should still be functional
    cy.get('body').should('be.visible')
    cy.get('.navbar-brand, .brand').should('be.visible')
    
    // Navigation should exist (might be collapsed)
    cy.get('.navbar, nav').should('exist')
  })

  it('should handle navigation menu', { tags: ['@smoke', '@navigation'] }, () => {
    // Check all main navigation items for non-authenticated user
    cy.get('nav, .navbar').within(() => {
      cy.get('a').contains(/home/i).should('exist')
      cy.get('a').contains(/sign in/i).should('exist')
      cy.get('a').contains(/sign up/i).should('exist')
    })
  })

  it('should load external CSS and fonts', { tags: ['@smoke', '@assets'] }, () => {
    // Check that external stylesheets are loaded
    cy.get('link[rel="stylesheet"]').should('exist')
    
    // Check that the page has basic styling
    cy.get('body').should('not.have.css', 'font-family', 'initial')
  })

  it('should handle article preview interactions', { tags: ['@smoke', '@articles'] }, () => {
    // Check if articles are loaded
    cy.get('.article-preview, .article-list').should('exist')
    
    // If articles exist, check their structure
    cy.get('.article-preview').then($articles => {
      if ($articles.length > 0) {
        cy.get('.article-preview').first().within(() => {
          cy.get('h1, .preview-link').should('exist')
          cy.get('.article-meta, .info').should('exist')
        })
      }
    })
  })
})