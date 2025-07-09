class EditorPage {
  // Selectors
  get titleInput() { return cy.get('[data-cy="article-title-input"]') }
  get descriptionInput() { return cy.get('[data-cy="article-description-input"]') }
  get bodyInput() { return cy.get('[data-cy="article-body-input"]') }
  get tagInput() { return cy.get('[data-cy="tag-input"]') }
  get tagList() { return cy.get('[data-cy="tag-list"]') }
  get publishButton() { return cy.get('[data-cy="publish-button"]') }
  get form() { return cy.get('[data-cy="editor-form"]') }
  get errorMessages() { return cy.get('[data-cy="error-messages"]') }
  get loadingSpinner() { return cy.get('[data-cy="loading"]') }
  get previewButton() { return cy.get('[data-cy="preview-button"]') }
  get previewContent() { return cy.get('[data-cy="preview-content"]') }
  get editButton() { return cy.get('[data-cy="edit-button"]') }
  get characterCount() { return cy.get('[data-cy="character-count"]') }
  get wordCount() { return cy.get('[data-cy="word-count"]') }

  // Navigation
  visit() {
    cy.visit('/editor')
    return this
  }

  visitEdit(slug) {
    cy.visit(`/editor/${slug}`)
    return this
  }

  // Form actions
  fillTitle(title) {
    this.titleInput.clear().type(title)
    return this
  }

  fillDescription(description) {
    this.descriptionInput.clear().type(description)
    return this
  }

  fillBody(body) {
    this.bodyInput.clear().type(body)
    return this
  }

  addTag(tag) {
    this.tagInput.type(`${tag}{enter}`)
    return this
  }

  addTags(tags) {
    tags.forEach(tag => {
      this.addTag(tag)
    })
    return this
  }

  removeTag(tag) {
    cy.get(`[data-cy="tag-${tag}"]`).find('[data-cy="remove-tag"]').click()
    return this
  }

  clearForm() {
    this.titleInput.clear()
    this.descriptionInput.clear()
    this.bodyInput.clear()
    this.tagInput.clear()
    return this
  }

  fillCompleteForm(title, description, body, tags = []) {
    this.fillTitle(title)
    this.fillDescription(description)
    this.fillBody(body)
    this.addTags(tags)
    return this
  }

  publish() {
    this.publishButton.click()
    return this
  }

  publishWithKeyboard() {
    this.bodyInput.type('{ctrl+enter}')
    return this
  }

  preview() {
    this.previewButton.click()
    return this
  }

  backToEdit() {
    this.editButton.click()
    return this
  }

  // Validation actions
  submitEmptyForm() {
    this.publishButton.click()
    return this
  }

  submitPartialForm(title, description) {
    this.fillTitle(title)
    this.fillDescription(description)
    this.publishButton.click()
    return this
  }

  // Assertions
  shouldBeOnEditorPage() {
    cy.url().should('include', '/editor')
    return this
  }

  shouldBeOnEditPage(slug) {
    cy.url().should('include', `/editor/${slug}`)
    return this
  }

  shouldHaveEmptyForm() {
    this.titleInput.should('have.value', '')
    this.descriptionInput.should('have.value', '')
    this.bodyInput.should('have.value', '')
    this.tagInput.should('have.value', '')
    return this
  }

  shouldHaveFilledForm(title, description, body) {
    this.titleInput.should('have.value', title)
    this.descriptionInput.should('have.value', description)
    this.bodyInput.should('have.value', body)
    return this
  }

  shouldHaveTitle(title) {
    this.titleInput.should('have.value', title)
    return this
  }

  shouldHaveDescription(description) {
    this.descriptionInput.should('have.value', description)
    return this
  }

  shouldHaveBody(body) {
    this.bodyInput.should('have.value', body)
    return this
  }

  shouldHaveTag(tag) {
    cy.get(`[data-cy="tag-${tag}"]`).should('exist')
    return this
  }

  shouldNotHaveTag(tag) {
    cy.get(`[data-cy="tag-${tag}"]`).should('not.exist')
    return this
  }

  shouldHaveTags(tags) {
    tags.forEach(tag => {
      this.shouldHaveTag(tag)
    })
    return this
  }

  shouldHaveTagCount(count) {
    this.tagList.find('[data-cy^="tag-"]').should('have.length', count)
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

  shouldHaveValidationError(field, message) {
    cy.get(`[data-cy="${field}-error"]`).should('contain', message)
    return this
  }

  shouldBeLoading() {
    this.loadingSpinner.should('be.visible')
    this.publishButton.should('be.disabled')
    return this
  }

  shouldNotBeLoading() {
    this.loadingSpinner.should('not.exist')
    this.publishButton.should('not.be.disabled')
    return this
  }

  shouldRedirectToArticle(slug) {
    cy.url().should('include', `/article/${slug}`)
    return this
  }

  shouldHaveCharacterCount(count) {
    this.characterCount.should('contain', count)
    return this
  }

  shouldHaveWordCount(count) {
    this.wordCount.should('contain', count)
    return this
  }

  shouldHavePreview() {
    this.previewContent.should('be.visible')
    return this
  }

  shouldNotHavePreview() {
    this.previewContent.should('not.exist')
    return this
  }

  shouldHavePreviewContent(content) {
    this.previewContent.should('contain', content)
    return this
  }

  shouldHaveMarkdownPreview() {
    this.previewContent.find('h1, h2, h3, strong, em, ul, ol').should('exist')
    return this
  }

  // Form validation assertions
  shouldHaveRequiredFields() {
    this.titleInput.should('have.attr', 'required')
    this.descriptionInput.should('have.attr', 'required')
    this.bodyInput.should('have.attr', 'required')
    return this
  }

  shouldHaveCorrectPlaceholders() {
    this.titleInput.should('have.attr', 'placeholder', 'Article Title')
    this.descriptionInput.should('have.attr', 'placeholder', 'What\'s this article about?')
    this.bodyInput.should('have.attr', 'placeholder', 'Write your article (in markdown)')
    this.tagInput.should('have.attr', 'placeholder', 'Enter tags')
    return this
  }

  shouldHaveCorrectInputTypes() {
    this.titleInput.should('have.attr', 'type', 'text')
    this.descriptionInput.should('have.attr', 'type', 'text')
    this.bodyInput.should('have.prop', 'tagName', 'TEXTAREA')
    this.tagInput.should('have.attr', 'type', 'text')
    return this
  }

  shouldHaveMaxLength(field, maxLength) {
    cy.get(`[data-cy="${field}-input"]`).should('have.attr', 'maxlength', maxLength.toString())
    return this
  }

  shouldHaveMinLength(field, minLength) {
    cy.get(`[data-cy="${field}-input"]`).should('have.attr', 'minlength', minLength.toString())
    return this
  }

  // Advanced assertions
  shouldHaveValidFormStructure() {
    this.form.within(() => {
      this.titleInput.should('exist')
      this.descriptionInput.should('exist')
      this.bodyInput.should('exist')
      this.tagInput.should('exist')
      this.publishButton.should('exist')
    })
    return this
  }

  shouldHaveAccessibleLabels() {
    this.titleInput.should('have.attr', 'aria-label').or('have.attr', 'id')
    this.descriptionInput.should('have.attr', 'aria-label').or('have.attr', 'id')
    this.bodyInput.should('have.attr', 'aria-label').or('have.attr', 'id')
    this.tagInput.should('have.attr', 'aria-label').or('have.attr', 'id')
    return this
  }

  shouldHaveAccessibleErrors() {
    this.errorMessages.should('have.attr', 'role', 'alert')
    return this
  }

  shouldSaveFormData() {
    // Check if form data persists on page refresh
    const testData = {
      title: 'Test Title',
      description: 'Test Description',
      body: 'Test Body'
    }
    
    this.fillCompleteForm(testData.title, testData.description, testData.body)
    cy.reload()
    this.shouldHaveFilledForm(testData.title, testData.description, testData.body)
    return this
  }

  shouldPreventDuplicateTags() {
    this.addTag('test')
    this.addTag('test')
    this.shouldHaveTagCount(1)
    return this
  }

  shouldLimitTagCount(maxTags) {
    for (let i = 0; i <= maxTags; i++) {
      this.addTag(`tag${i}`)
    }
    this.shouldHaveTagCount(maxTags)
    return this
  }

  // API interaction checks
  shouldMakeCreateRequest() {
    cy.intercept('POST', '**/articles').as('createRequest')
    return this
  }

  shouldMakeUpdateRequest() {
    cy.intercept('PUT', '**/articles/*').as('updateRequest')
    return this
  }

  shouldReceiveCreateResponse() {
    cy.wait('@createRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveUpdateResponse() {
    cy.wait('@updateRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveErrorResponse(statusCode) {
    cy.wait('@createRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(statusCode)
    })
    return this
  }

  // Keyboard shortcuts
  shouldSupportKeyboardShortcuts() {
    this.titleInput.type('{ctrl+a}')
    this.titleInput.should('have.value', '')
    return this
  }

  shouldSupportTabNavigation() {
    this.titleInput.focus().tab()
    this.descriptionInput.should('have.focus')
    return this
  }

  // Auto-save functionality
  shouldAutoSave() {
    this.fillTitle('Auto-save test')
    cy.wait(3000) // Wait for auto-save
    cy.reload()
    this.shouldHaveTitle('Auto-save test')
    return this
  }

  shouldShowAutoSaveIndicator() {
    this.fillTitle('Auto-save test')
    cy.get('[data-cy="auto-save-indicator"]').should('be.visible')
    return this
  }
}

export default EditorPage