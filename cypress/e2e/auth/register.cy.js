import AuthPage from '../../page-objects/AuthPage'
import HomePage from '../../page-objects/HomePage'

describe('Registration Functionality', () => {
  const authPage = new AuthPage()
  const homePage = new HomePage()

  beforeEach(() => {
    cy.visit('/')
  })

  describe('Registration Form UI', () => {
    it('should display registration form with correct elements', { tags: ['@smoke', '@ui'] }, () => {
      authPage.visitRegister()
        .shouldBeOnRegisterPage()
        .shouldHaveRequiredFields()
        .shouldHaveCorrectInputTypes()
        .shouldHaveCorrectPlaceholders()
        .shouldHaveAccessibleLabels()
    })

    it('should allow navigation to login page', { tags: ['@navigation'] }, () => {
      authPage.visitRegister()
        .goToLoginFromRegister()
        .shouldBeOnLoginPage()
    })
  })

  describe('Registration Validation', () => {
    it('should show validation errors for empty form', { tags: ['@validation'] }, () => {
      authPage.submitEmptyRegister()
        .shouldShowErrorMessage('username can\'t be blank')
        .shouldShowErrorMessage('email can\'t be blank')
        .shouldShowErrorMessage('password can\'t be blank')
    })

    it('should validate email format', { tags: ['@validation'] }, () => {
      authPage.visitRegister()
      authPage.usernameInput.type('testuser')
      authPage.emailInput.type('invalid-email')
      authPage.passwordInput.type('password123')
      authPage.registerButton.click()
      authPage.shouldShowErrorMessage('email is invalid')
    })

    it('should validate username requirements', { tags: ['@validation'] }, () => {
      authPage.visitRegister()
      authPage.usernameInput.type('ab') // Too short
      authPage.emailInput.type('test@example.com')
      authPage.passwordInput.type('password123')
      authPage.registerButton.click()
      authPage.shouldShowErrorMessage('username is too short (minimum is 3 characters)')
    })

    it('should validate password strength', { tags: ['@validation'] }, () => {
      authPage.visitRegister()
      authPage.usernameInput.type('testuser')
      authPage.emailInput.type('test@example.com')
      authPage.passwordInput.type('123') // Too short
      authPage.registerButton.click()
      authPage.shouldShowErrorMessage('password is too short (minimum is 8 characters)')
    })
  })

  describe('Successful Registration', () => {
    it('should register with valid credentials', { tags: ['@smoke', '@auth'] }, () => {
      const timestamp = Date.now()
      const userData = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'testpassword123'
      }

      authPage.shouldMakeRegisterRequest()
      authPage.register(userData.username, userData.email, userData.password)
        .shouldReceiveRegisterResponse()
        .shouldRedirectToHome()
        .shouldHaveToken()

      cy.get('[data-cy="user-nav"]').should('contain', userData.username)
    })

    it('should register using Enter key', { tags: ['@auth', '@keyboard'] }, () => {
      const timestamp = Date.now()
      const userData = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'testpassword123'
      }

      authPage.registerWithEnter(userData.username, userData.email, userData.password)
        .shouldRedirectToHome()
        .shouldHaveToken()
    })
  })

  describe('Failed Registration', () => {
    it('should show error for duplicate username', { tags: ['@auth', '@error'] }, () => {
      authPage.register('existinguser', 'new@example.com', 'password123')
        .shouldShowErrorMessage('username has already been taken')
    })

    it('should show error for duplicate email', { tags: ['@auth', '@error'] }, () => {
      authPage.register('newuser', 'existing@example.com', 'password123')
        .shouldShowErrorMessage('email has already been taken')
    })

    it('should not store token on failed registration', { tags: ['@auth', '@security'] }, () => {
      authPage.register('existinguser', 'existing@example.com', 'password123')
        .shouldNotHaveToken()
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in username', { tags: ['@edge-case'] }, () => {
      const timestamp = Date.now()
      authPage.register(`test-user_${timestamp}`, `test${timestamp}@example.com`, 'password123')
        .shouldRedirectToHome()
    })

    it('should handle international characters in username', { tags: ['@edge-case'] }, () => {
      const timestamp = Date.now()
      authPage.register(`tëst${timestamp}`, `test${timestamp}@example.com`, 'password123')
        .shouldRedirectToHome()
    })
  })

  describe('Security', () => {
    it('should mask password input', { tags: ['@security'] }, () => {
      authPage.visitRegister()
      authPage.passwordInput.should('have.attr', 'type', 'password')
    })

    it('should not expose password in DOM', { tags: ['@security'] }, () => {
      authPage.visitRegister()
      authPage.passwordInput.type('secretpassword')
      cy.get('body').should('not.contain', 'secretpassword')
    })
  })
})