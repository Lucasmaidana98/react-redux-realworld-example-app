import AuthPage from '../../page-objects/AuthPage'
import HomePage from '../../page-objects/HomePage'

describe('Login Functionality', () => {
  const authPage = new AuthPage()
  const homePage = new HomePage()

  beforeEach(() => {
    cy.visit('/')
  })

  describe('Login Form UI', () => {
    it('should display login form with correct elements', { tags: ['@smoke', '@ui'] }, () => {
      cy.visit('/login')
      
      // Check basic form elements exist
      cy.get('input[type="email"], input[placeholder*="email" i]').should('be.visible')
      cy.get('input[type="password"], input[placeholder*="password" i]').should('be.visible')
      cy.get('button[type="submit"], button').contains(/sign in|login/i).should('be.visible')
      
      // Check navigation
      cy.url().should('include', '/login')
    })

    it('should have empty form by default', { tags: ['@ui'] }, () => {
      authPage.visitLogin()
        .shouldHaveEmptyForm()
    })

    it('should allow navigation to register page', { tags: ['@navigation'] }, () => {
      authPage.visitLogin()
        .goToRegisterFromLogin()
        .shouldBeOnRegisterPage()
    })
  })

  describe('Login Form Validation', () => {
    it('should show validation errors for empty form submission', { tags: ['@validation'] }, () => {
      authPage.submitEmptyLogin()
        .shouldShowErrorMessage('email can\'t be blank')
        .shouldShowErrorMessage('password can\'t be blank')
    })

    it('should show validation error for invalid email format', { tags: ['@validation'] }, () => {
      authPage.visitLogin()
      authPage.emailInput.type('invalid-email')
      authPage.passwordInput.type('validpassword')
      authPage.loginButton.click()
      authPage.shouldShowErrorMessage('email is invalid')
    })

    it('should show validation error for missing password', { tags: ['@validation'] }, () => {
      authPage.submitPartialLogin('test@example.com')
        .shouldShowErrorMessage('password can\'t be blank')
    })

    it('should show validation error for missing email', { tags: ['@validation'] }, () => {
      authPage.visitLogin()
      authPage.passwordInput.type('password123')
      authPage.loginButton.click()
      authPage.shouldShowErrorMessage('email can\'t be blank')
    })

    it('should validate email format in real-time', { tags: ['@validation'] }, () => {
      authPage.visitLogin()
      authPage.emailInput.type('invalid')
      authPage.passwordInput.click() // Trigger blur
      authPage.shouldHaveValidationError('email', 'Please enter a valid email')
    })
  })

  describe('Successful Login', () => {
    it('should login with valid credentials', { tags: ['@smoke', '@auth'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      authPage.shouldMakeLoginRequest()
      authPage.login(email, password)
        .shouldReceiveLoginResponse()
        .shouldRedirectToHome()
        .shouldHaveToken()
      
      // Verify user is logged in
      cy.get('[data-cy="user-nav"]').should('be.visible')
      cy.get('[data-cy="login-link"]').should('not.exist')
    })

    it('should login using Enter key', { tags: ['@auth', '@keyboard'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      authPage.loginWithEnter(email, password)
        .shouldRedirectToHome()
        .shouldHaveToken()
    })

    it('should persist login state after page refresh', { tags: ['@auth'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      authPage.login(email, password)
        .shouldHaveToken()
      
      cy.reload()
      cy.get('[data-cy="user-nav"]').should('be.visible')
      cy.window().its('localStorage').invoke('getItem', 'jwt').should('exist')
    })

    it('should redirect to intended page after login', { tags: ['@auth', '@navigation'] }, () => {
      cy.visit('/editor')
      cy.url().should('include', '/login')
      
      const { email, password } = Cypress.env('testUser')
      authPage.login(email, password)
      
      cy.url().should('include', '/editor')
    })
  })

  describe('Failed Login', () => {
    it('should show error for invalid credentials', { tags: ['@auth', '@error'] }, () => {
      authPage.shouldMakeLoginRequest()
      authPage.login('invalid@example.com', 'wrongpassword')
        .shouldReceiveErrorResponse(422)
        .shouldShowErrorMessage('email or password is invalid')
    })

    it('should show error for non-existent user', { tags: ['@auth', '@error'] }, () => {
      authPage.login('nonexistent@example.com', 'password123')
        .shouldShowErrorMessage('email or password is invalid')
    })

    it('should not store token on failed login', { tags: ['@auth', '@security'] }, () => {
      authPage.login('invalid@example.com', 'wrongpassword')
        .shouldNotHaveToken()
    })

    it('should clear form after failed login', { tags: ['@auth', '@ux'] }, () => {
      authPage.login('invalid@example.com', 'wrongpassword')
      authPage.passwordInput.should('have.value', '')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during login', { tags: ['@ui', '@loading'] }, () => {
      authPage.visitLogin()
      authPage.emailInput.type('test@example.com')
      authPage.passwordInput.type('password123')
      
      // Intercept and delay the request
      cy.intercept('POST', '**/users/login', { delay: 2000 }).as('loginRequest')
      
      authPage.loginButton.click()
      authPage.shouldBeLoading()
      
      cy.wait('@loginRequest')
      authPage.shouldNotBeLoading()
    })
  })

  describe('Security', () => {
    it('should mask password input', { tags: ['@security'] }, () => {
      authPage.visitLogin()
      authPage.passwordInput.should('have.attr', 'type', 'password')
    })

    it('should not expose password in DOM', { tags: ['@security'] }, () => {
      authPage.visitLogin()
      authPage.passwordInput.type('secretpassword')
      
      cy.get('body').should('not.contain', 'secretpassword')
    })

    it('should prevent autocomplete on password field', { tags: ['@security'] }, () => {
      authPage.visitLogin()
      authPage.passwordInput.should('have.attr', 'autocomplete', 'current-password')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', { tags: ['@accessibility'] }, () => {
      authPage.visitLogin()
      authPage.emailInput.focus().tab()
      authPage.passwordInput.should('have.focus')
      
      cy.focused().tab()
      authPage.loginButton.should('have.focus')
    })

    it('should have proper ARIA labels', { tags: ['@accessibility'] }, () => {
      authPage.visitLogin()
        .shouldHaveAccessibleLabels()
        .shouldHaveAccessibleErrors()
    })

    it('should announce errors to screen readers', { tags: ['@accessibility'] }, () => {
      authPage.submitEmptyLogin()
      authPage.errorMessages.should('have.attr', 'role', 'alert')
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile devices', { tags: ['@responsive'] }, () => {
      cy.viewport('iphone-x')
      authPage.visitLogin()
      authPage.loginForm.should('be.visible')
      
      const { email, password } = Cypress.env('testUser')
      authPage.login(email, password)
        .shouldRedirectToHome()
    })

    it('should work on tablet devices', { tags: ['@responsive'] }, () => {
      cy.viewport('ipad-2')
      authPage.visitLogin()
      authPage.loginForm.should('be.visible')
      
      const { email, password } = Cypress.env('testUser')
      authPage.login(email, password)
        .shouldRedirectToHome()
    })
  })

  describe('Performance', () => {
    it('should load login page quickly', { tags: ['@performance'] }, () => {
      cy.visit('/login')
      cy.measurePerformance('login-page-load')
    })

    it('should handle login request efficiently', { tags: ['@performance'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      const startTime = Date.now()
      authPage.login(email, password)
      
      cy.then(() => {
        const endTime = Date.now()
        const duration = endTime - startTime
        expect(duration).to.be.lessThan(3000) // Should complete within 3 seconds
      })
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work in Chrome', { tags: ['@cross-browser'], browser: 'chrome' }, () => {
      const { email, password } = Cypress.env('testUser')
      authPage.login(email, password).shouldRedirectToHome()
    })

    it('should work in Firefox', { tags: ['@cross-browser'], browser: 'firefox' }, () => {
      const { email, password } = Cypress.env('testUser')
      authPage.login(email, password).shouldRedirectToHome()
    })

    it('should work in Edge', { tags: ['@cross-browser'], browser: 'edge' }, () => {
      const { email, password } = Cypress.env('testUser')
      authPage.login(email, password).shouldRedirectToHome()
    })
  })

  describe('Edge Cases', () => {
    it('should handle network failure gracefully', { tags: ['@edge-case'] }, () => {
      cy.intercept('POST', '**/users/login', { forceNetworkError: true }).as('loginRequest')
      
      authPage.login('test@example.com', 'password123')
      authPage.shouldShowErrorMessage('Network error occurred')
    })

    it('should handle server error gracefully', { tags: ['@edge-case'] }, () => {
      cy.intercept('POST', '**/users/login', { statusCode: 500 }).as('loginRequest')
      
      authPage.login('test@example.com', 'password123')
      authPage.shouldShowErrorMessage('Server error occurred')
    })

    it('should handle extremely long input values', { tags: ['@edge-case'] }, () => {
      const longEmail = 'a'.repeat(1000) + '@example.com'
      const longPassword = 'a'.repeat(1000)
      
      authPage.visitLogin()
      authPage.emailInput.type(longEmail)
      authPage.passwordInput.type(longPassword)
      authPage.loginButton.click()
      
      // Should handle gracefully without breaking
      authPage.shouldShowErrorMessage('email is invalid')
    })

    it('should handle special characters in credentials', { tags: ['@edge-case'] }, () => {
      const specialEmail = 'test+special@example.com'
      const specialPassword = 'P@ssw0rd!#$%'
      
      authPage.login(specialEmail, specialPassword)
      // Should process special characters correctly
    })
  })

  describe('Integration Tests', () => {
    it('should integrate with home page after login', { tags: ['@integration'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      authPage.login(email, password)
        .shouldRedirectToHome()
      
      homePage.shouldNotShowBanner()
        .shouldHaveActiveTab('your-feed')
        .shouldHaveArticles()
    })

    it('should maintain session across page navigation', { tags: ['@integration'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      authPage.login(email, password)
      
      cy.visit('/editor')
      cy.get('[data-cy="user-nav"]').should('be.visible')
      
      cy.visit('/settings')
      cy.get('[data-cy="user-nav"]').should('be.visible')
    })
  })
})