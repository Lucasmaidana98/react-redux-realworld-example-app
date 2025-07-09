import ArticlePage from '../../page-objects/ArticlePage'
import EditorPage from '../../page-objects/EditorPage'
import HomePage from '../../page-objects/HomePage'

describe('Article CRUD Operations', () => {
  const articlePage = new ArticlePage()
  const editorPage = new EditorPage()
  const homePage = new HomePage()

  beforeEach(() => {
    // Login before each test
    const { email, password } = Cypress.env('testUser')
    cy.loginAPI(email, password)
  })

  describe('Create Article', () => {
    it('should create a new article successfully', { tags: ['@smoke', '@crud'] }, () => {
      const articleData = {
        title: 'Test Article Title',
        description: 'This is a test article description',
        body: '# Test Article\n\nThis is the **content** of the test article.',
        tags: ['test', 'cypress', 'automation']
      }

      editorPage.visit()
        .shouldBeOnEditorPage()
        .fillCompleteForm(articleData.title, articleData.description, articleData.body, articleData.tags)
        .shouldMakeCreateRequest()
        .publish()
        .shouldReceiveCreateResponse()

      articlePage.shouldHaveTitle(articleData.title)
        .shouldHaveBody(articleData.body)
        .shouldHaveTags(articleData.tags)
        .shouldHaveMarkdownRendered()
    })

    it('should validate required fields when creating article', { tags: ['@validation', '@crud'] }, () => {
      editorPage.visit()
        .submitEmptyForm()
        .shouldShowErrorMessage('title can\'t be blank')
        .shouldShowErrorMessage('description can\'t be blank')
        .shouldShowErrorMessage('body can\'t be blank')
    })

    it('should handle markdown rendering in article body', { tags: ['@markdown', '@crud'] }, () => {
      const markdownContent = `# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2

\`\`\`javascript
console.log('Hello World');
\`\`\`

> This is a blockquote

[Link text](https://example.com)`

      editorPage.visit()
        .fillCompleteForm('Markdown Test', 'Testing markdown rendering', markdownContent, ['markdown'])
        .publish()

      articlePage.shouldHaveValidMarkdown()
    })

    it('should add and remove tags dynamically', { tags: ['@tags', '@crud'] }, () => {
      editorPage.visit()
        .fillTitle('Test Article')
        .fillDescription('Test Description')
        .fillBody('Test Body')
        .addTag('tag1')
        .addTag('tag2')
        .addTag('tag3')
        .shouldHaveTagCount(3)
        .removeTag('tag2')
        .shouldHaveTagCount(2)
        .shouldHaveTag('tag1')
        .shouldHaveTag('tag3')
        .shouldNotHaveTag('tag2')
    })
  })

  describe('Read Article', () => {
    it('should display article details correctly', { tags: ['@smoke', '@read'] }, () => {
      // First create an article
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

      articlePage.shouldHaveTitle(articleData.title)
        .shouldHaveBody(articleData.body)
        .shouldHaveTags(articleData.tags)
        .shouldHaveAuthor(Cypress.env('testUser').username)
        .shouldHaveDate()
        .shouldHaveValidMetadata()
    })

    it('should show edit and delete buttons for article author', { tags: ['@authorization', '@read'] }, () => {
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

      articlePage.shouldShowEditButton()
        .shouldShowDeleteButton()
    })

    it('should not show edit and delete buttons for non-author', { tags: ['@authorization', '@read'] }, () => {
      // Visit an article created by another user
      articlePage.visit('sample-article-slug')
        .shouldNotShowEditButton()
        .shouldNotShowDeleteButton()
    })
  })

  describe('Update Article', () => {
    let articleSlug

    beforeEach(() => {
      // Create an article for editing
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)
        .then(() => {
          cy.url().then((url) => {
            articleSlug = url.split('/article/')[1]
          })
        })
    })

    it('should update article successfully', { tags: ['@smoke', '@crud'] }, () => {
      const updatedData = {
        title: 'Updated Article Title',
        description: 'Updated description',
        body: 'Updated body content'
      }

      articlePage.editArticle()
      
      editorPage.shouldBeOnEditPage(articleSlug)
        .clearForm()
        .fillCompleteForm(updatedData.title, updatedData.description, updatedData.body)
        .shouldMakeUpdateRequest()
        .publish()
        .shouldReceiveUpdateResponse()

      articlePage.shouldHaveTitle(updatedData.title)
        .shouldHaveBody(updatedData.body)
    })

    it('should preserve existing data when editing', { tags: ['@edit', '@crud'] }, () => {
      const originalData = Cypress.env('testArticle')
      
      articlePage.editArticle()
      
      editorPage.shouldHaveTitle(originalData.title)
        .shouldHaveDescription(originalData.description)
        .shouldHaveBody(originalData.body)
        .shouldHaveTags(originalData.tags)
    })

    it('should validate updated fields', { tags: ['@validation', '@crud'] }, () => {
      articlePage.editArticle()
      
      editorPage.clearForm()
        .submitEmptyForm()
        .shouldShowErrorMessage('title can\'t be blank')
        .shouldShowErrorMessage('description can\'t be blank')
        .shouldShowErrorMessage('body can\'t be blank')
    })
  })

  describe('Delete Article', () => {
    it('should delete article successfully', { tags: ['@smoke', '@crud'] }, () => {
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

      articlePage.deleteArticle()
        .shouldRedirectToHome()

      homePage.shouldHaveArticles()
      // Article should no longer exist in the list
      cy.get('[data-cy="article-list"]').should('not.contain', articleData.title)
    })

    it('should show confirmation before deletion', { tags: ['@confirmation', '@crud'] }, () => {
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

      articlePage.deleteButton.click()
      
      // Should show confirmation dialog
      cy.get('[data-cy="delete-confirmation"]').should('be.visible')
      cy.get('[data-cy="confirm-delete"]').click()
      
      articlePage.shouldRedirectToHome()
    })

    it('should cancel deletion when user cancels', { tags: ['@confirmation', '@crud'] }, () => {
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

      articlePage.deleteButton.click()
      
      cy.get('[data-cy="delete-confirmation"]').should('be.visible')
      cy.get('[data-cy="cancel-delete"]').click()
      
      // Should stay on article page
      articlePage.shouldHaveTitle(articleData.title)
    })
  })

  describe('Article Permissions', () => {
    it('should only allow author to edit their own articles', { tags: ['@authorization', '@security'] }, () => {
      // Login as different user
      const { email, password } = Cypress.env('testUser2')
      cy.loginAPI(email, password)

      // Try to access edit page for another user's article
      cy.visit('/editor/sample-article-slug')
      cy.url().should('include', '/login')
    })

    it('should only allow author to delete their own articles', { tags: ['@authorization', '@security'] }, () => {
      // Login as different user
      const { email, password } = Cypress.env('testUser2')
      cy.loginAPI(email, password)

      articlePage.visit('sample-article-slug')
        .shouldNotShowEditButton()
        .shouldNotShowDeleteButton()
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors gracefully during creation', { tags: ['@error-handling'] }, () => {
      cy.intercept('POST', '**/articles', { statusCode: 500 }).as('createError')

      editorPage.visit()
        .fillCompleteForm('Test Title', 'Test Description', 'Test Body')
        .publish()

      cy.wait('@createError')
      editorPage.shouldShowErrorMessage('Server error occurred')
    })

    it('should handle network errors during creation', { tags: ['@error-handling'] }, () => {
      cy.intercept('POST', '**/articles', { forceNetworkError: true }).as('networkError')

      editorPage.visit()
        .fillCompleteForm('Test Title', 'Test Description', 'Test Body')
        .publish()

      cy.wait('@networkError')
      editorPage.shouldShowErrorMessage('Network error occurred')
    })

    it('should handle 404 errors when viewing non-existent article', { tags: ['@error-handling'] }, () => {
      cy.intercept('GET', '**/articles/non-existent-slug', { statusCode: 404 }).as('notFound')

      articlePage.visit('non-existent-slug')
      
      cy.wait('@notFound')
      articlePage.shouldShowError('Article not found')
    })
  })

  describe('Performance', () => {
    it('should load article quickly', { tags: ['@performance'] }, () => {
      const articleData = Cypress.env('testArticle')
      cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

      cy.measurePerformance('article-load')
    })

    it('should save article efficiently', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      editorPage.visit()
        .fillCompleteForm('Performance Test', 'Performance Description', 'Performance Body')
        .publish()

      cy.then(() => {
        const endTime = Date.now()
        const duration = endTime - startTime
        expect(duration).to.be.lessThan(5000)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should create article and view it from home page', { tags: ['@integration'] }, () => {
      const articleData = {
        title: 'Integration Test Article',
        description: 'Integration test description',
        body: 'Integration test body',
        tags: ['integration', 'test']
      }

      editorPage.visit()
        .fillCompleteForm(articleData.title, articleData.description, articleData.body, articleData.tags)
        .publish()

      cy.visit('/')
      homePage.shouldHaveArticles()
      cy.get('[data-cy="article-list"]').should('contain', articleData.title)
      
      homePage.clickArticle(articleData.title)
      articlePage.shouldHaveTitle(articleData.title)
    })

    it('should update article and verify changes are reflected', { tags: ['@integration'] }, () => {
      const originalData = Cypress.env('testArticle')
      const updatedData = {
        title: 'Updated Integration Test',
        description: 'Updated description',
        body: 'Updated body content'
      }

      cy.createArticle(originalData.title, originalData.description, originalData.body, originalData.tags)
      
      articlePage.editArticle()
      
      editorPage.clearForm()
        .fillCompleteForm(updatedData.title, updatedData.description, updatedData.body)
        .publish()

      // Verify changes
      articlePage.shouldHaveTitle(updatedData.title)
        .shouldHaveBody(updatedData.body)

      // Verify changes are reflected on home page
      cy.visit('/')
      homePage.shouldHaveArticles()
      cy.get('[data-cy="article-list"]').should('contain', updatedData.title)
      cy.get('[data-cy="article-list"]').should('not.contain', originalData.title)
    })
  })
})