class AuthPage {
  // Common selectors
  get emailInput() { return cy.get('[data-cy="email-input"]') }
  get passwordInput() { return cy.get('[data-cy="password-input"]') }
  get errorMessages() { return cy.get('[data-cy="error-messages"]') }
  get submitButton() { return cy.get('[data-cy="submit-button"]') }
  get loadingSpinner() { return cy.get('[data-cy="loading"]') }

  // Login specific selectors
  get loginButton() { return cy.get('[data-cy="login-button"]') }
  get loginForm() { return cy.get('[data-cy="login-form"]') }
  get loginTitle() { return cy.get('[data-cy="login-title"]') }
  get signUpLink() { return cy.get('[data-cy="signup-link"]') }

  // Register specific selectors
  get usernameInput() { return cy.get('[data-cy="username-input"]') }
  get registerButton() { return cy.get('[data-cy="register-button"]') }
  get registerForm() { return cy.get('[data-cy="register-form"]') }
  get registerTitle() { return cy.get('[data-cy="register-title"]') }
  get signInLink() { return cy.get('[data-cy="signin-link"]') }

  // Navigation methods
  visitLogin() {
    cy.visit('/login')
    return this
  }

  visitRegister() {
    cy.visit('/register')
    return this
  }

  // Login actions
  login(email, password) {
    this.visitLogin()
    this.emailInput.type(email)
    this.passwordInput.type(password)
    this.loginButton.click()
    return this
  }

  loginWithEnter(email, password) {
    this.visitLogin()
    this.emailInput.type(email)
    this.passwordInput.type(password + '{enter}')
    return this
  }

  // Register actions
  register(username, email, password) {
    this.visitRegister()
    this.usernameInput.type(username)
    this.emailInput.type(email)
    this.passwordInput.type(password)
    this.registerButton.click()
    return this
  }

  registerWithEnter(username, email, password) {
    this.visitRegister()
    this.usernameInput.type(username)
    this.emailInput.type(email)
    this.passwordInput.type(password + '{enter}')
    return this
  }

  // Form validation actions
  submitEmptyLogin() {
    this.visitLogin()
    this.loginButton.click()
    return this
  }

  submitEmptyRegister() {
    this.visitRegister()
    this.registerButton.click()
    return this
  }

  submitPartialLogin(email) {
    this.visitLogin()
    this.emailInput.type(email)
    this.loginButton.click()
    return this
  }

  submitPartialRegister(username, email) {
    this.visitRegister()
    this.usernameInput.type(username)
    this.emailInput.type(email)
    this.registerButton.click()
    return this
  }

  // Navigation between forms
  goToRegisterFromLogin() {
    this.signUpLink.click()
    return this
  }

  goToLoginFromRegister() {
    this.signInLink.click()
    return this
  }

  // Clear form actions
  clearLoginForm() {
    this.emailInput.clear()
    this.passwordInput.clear()
    return this
  }

  clearRegisterForm() {
    this.usernameInput.clear()
    this.emailInput.clear()
    this.passwordInput.clear()
    return this
  }

  // Assertions
  shouldBeOnLoginPage() {
    cy.url().should('include', '/login')
    this.loginTitle.should('be.visible')
    return this
  }

  shouldBeOnRegisterPage() {
    cy.url().should('include', '/register')
    this.registerTitle.should('be.visible')
    return this
  }

  shouldRedirectToHome() {
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    return this
  }

  shouldHaveToken() {
    cy.window().its('localStorage').invoke('getItem', 'jwt').should('exist')
    return this
  }

  shouldNotHaveToken() {
    cy.window().its('localStorage').invoke('getItem', 'jwt').should('not.exist')
    return this
  }

  shouldShowErrorMessage(message) {
    this.errorMessages.should('be.visible').and('contain', message)
    return this
  }

  shouldNotShowErrorMessage() {
    this.errorMessages.should('not.exist')
    return this
  }

  shouldHaveValidationError(fieldName, message) {
    cy.get(`[data-cy="${fieldName}-error"]`).should('contain', message)
    return this
  }

  shouldBeLoading() {
    this.loadingSpinner.should('be.visible')
    this.submitButton.should('be.disabled')
    return this
  }

  shouldNotBeLoading() {
    this.loadingSpinner.should('not.exist')
    this.submitButton.should('not.be.disabled')
    return this
  }

  shouldHaveRequiredFields() {
    this.emailInput.should('have.attr', 'required')
    this.passwordInput.should('have.attr', 'required')
    return this
  }

  shouldHaveCorrectInputTypes() {
    this.emailInput.should('have.attr', 'type', 'email')
    this.passwordInput.should('have.attr', 'type', 'password')
    return this
  }

  shouldHaveCorrectPlaceholders() {
    this.emailInput.should('have.attr', 'placeholder', 'Email')
    this.passwordInput.should('have.attr', 'placeholder', 'Password')
    return this
  }

  shouldHaveWorkingLinks() {
    this.signUpLink.should('have.attr', 'href', '#/register')
    this.signInLink.should('have.attr', 'href', '#/login')
    return this
  }

  // Form state validations
  shouldHaveEmptyForm() {
    this.emailInput.should('have.value', '')
    this.passwordInput.should('have.value', '')
    return this
  }

  shouldHaveFilledForm(email, password) {
    this.emailInput.should('have.value', email)
    this.passwordInput.should('have.value', password)
    return this
  }

  shouldHaveFilledRegisterForm(username, email, password) {
    this.usernameInput.should('have.value', username)
    this.emailInput.should('have.value', email)
    this.passwordInput.should('have.value', password)
    return this
  }

  // Accessibility checks
  shouldHaveAccessibleLabels() {
    this.emailInput.should('have.attr', 'aria-label').or('have.attr', 'id')
    this.passwordInput.should('have.attr', 'aria-label').or('have.attr', 'id')
    return this
  }

  shouldHaveAccessibleErrors() {
    this.errorMessages.should('have.attr', 'role', 'alert')
    return this
  }

  // API interaction checks
  shouldMakeLoginRequest() {
    cy.intercept('POST', '**/users/login').as('loginRequest')
    return this
  }

  shouldMakeRegisterRequest() {
    cy.intercept('POST', '**/users').as('registerRequest')
    return this
  }

  shouldReceiveLoginResponse() {
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveRegisterResponse() {
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveErrorResponse(statusCode) {
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(statusCode)
    })
    return this
  }
}

export default AuthPage