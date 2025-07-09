class ArticlePage {
  // Selectors
  get articleTitle() { return cy.get('[data-cy="article-title"]') }
  get articleBody() { return cy.get('[data-cy="article-body"]') }
  get articleMeta() { return cy.get('[data-cy="article-meta"]') }
  get articleAuthor() { return cy.get('[data-cy="article-author"]') }
  get articleDate() { return cy.get('[data-cy="article-date"]') }
  get articleTags() { return cy.get('[data-cy="article-tags"]') }
  get favoriteButton() { return cy.get('[data-cy="favorite-button"]') }
  get favoriteCount() { return cy.get('[data-cy="favorite-count"]') }
  get followButton() { return cy.get('[data-cy="follow-button"]') }
  get editButton() { return cy.get('[data-cy="edit-article-button"]') }
  get deleteButton() { return cy.get('[data-cy="delete-article-button"]') }
  get commentSection() { return cy.get('[data-cy="comment-section"]') }
  get commentInput() { return cy.get('[data-cy="comment-input"]') }
  get commentSubmitButton() { return cy.get('[data-cy="comment-submit-button"]') }
  get commentList() { return cy.get('[data-cy="comment-list"]') }
  get authorAvatar() { return cy.get('[data-cy="author-avatar"]') }
  get authorName() { return cy.get('[data-cy="author-name"]') }
  get loadingSpinner() { return cy.get('[data-cy="loading"]') }
  get errorMessage() { return cy.get('[data-cy="error-message"]') }
  get markdown() { return cy.get('[data-cy="markdown-content"]') }

  // Navigation
  visit(slug) {
    cy.visit(`/article/${slug}`)
    return this
  }

  // Article actions
  favoriteArticle() {
    this.favoriteButton.click()
    return this
  }

  unfavoriteArticle() {
    this.favoriteButton.click()
    return this
  }

  followAuthor() {
    this.followButton.click()
    return this
  }

  unfollowAuthor() {
    this.followButton.click()
    return this
  }

  editArticle() {
    this.editButton.click()
    return this
  }

  deleteArticle() {
    this.deleteButton.click()
    return this
  }

  clickAuthor() {
    this.authorName.click()
    return this
  }

  clickTag(tagName) {
    cy.get(`[data-cy="tag-${tagName}"]`).click()
    return this
  }

  // Comment actions
  addComment(commentText) {
    this.commentInput.type(commentText)
    this.commentSubmitButton.click()
    return this
  }

  deleteComment(commentText) {
    this.commentList
      .contains(commentText)
      .parent()
      .within(() => {
        cy.get('[data-cy="delete-comment-button"]').click()
      })
    return this
  }

  // Assertions
  shouldHaveTitle(title) {
    this.articleTitle.should('contain', title)
    return this
  }

  shouldHaveBody(body) {
    this.articleBody.should('contain', body)
    return this
  }

  shouldHaveAuthor(author) {
    this.articleAuthor.should('contain', author)
    return this
  }

  shouldHaveDate() {
    this.articleDate.should('be.visible')
    return this
  }

  shouldHaveTags(tags) {
    tags.forEach(tag => {
      cy.get(`[data-cy="tag-${tag}"]`).should('exist')
    })
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

  shouldBeFavorited() {
    this.favoriteButton.should('contain', 'Unfavorite')
    return this
  }

  shouldNotBeFavorited() {
    this.favoriteButton.should('contain', 'Favorite')
    return this
  }

  shouldHaveFavoriteCount(count) {
    this.favoriteCount.should('contain', count)
    return this
  }

  shouldBeFollowing() {
    this.followButton.should('contain', 'Unfollow')
    return this
  }

  shouldNotBeFollowing() {
    this.followButton.should('contain', 'Follow')
    return this
  }

  shouldShowEditButton() {
    this.editButton.should('be.visible')
    return this
  }

  shouldNotShowEditButton() {
    this.editButton.should('not.exist')
    return this
  }

  shouldShowDeleteButton() {
    this.deleteButton.should('be.visible')
    return this
  }

  shouldNotShowDeleteButton() {
    this.deleteButton.should('not.exist')
    return this
  }

  shouldHaveComment(commentText) {
    this.commentList.should('contain', commentText)
    return this
  }

  shouldNotHaveComment(commentText) {
    this.commentList.should('not.contain', commentText)
    return this
  }

  shouldHaveCommentCount(count) {
    this.commentList.find('[data-cy="comment-item"]').should('have.length', count)
    return this
  }

  shouldShowCommentSection() {
    this.commentSection.should('be.visible')
    return this
  }

  shouldNotShowCommentSection() {
    this.commentSection.should('not.exist')
    return this
  }

  shouldHaveMarkdownRendered() {
    this.markdown.find('h1, h2, h3, strong, em, ul, ol').should('exist')
    return this
  }

  shouldNotBeLoading() {
    this.loadingSpinner.should('not.exist')
    return this
  }

  shouldShowError(message) {
    this.errorMessage.should('be.visible').and('contain', message)
    return this
  }

  shouldHaveAuthorAvatar() {
    this.authorAvatar.should('be.visible')
    return this
  }

  shouldRedirectToProfile() {
    cy.url().should('include', '/@')
    return this
  }

  shouldRedirectToEditor() {
    cy.url().should('include', '/editor')
    return this
  }

  shouldRedirectToHome() {
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    return this
  }

  shouldRedirectToLogin() {
    cy.url().should('include', '/login')
    return this
  }

  // Advanced assertions
  shouldHaveValidMarkdown() {
    this.articleBody.within(() => {
      cy.get('h1').should('exist')
      cy.get('strong').should('exist')
      cy.get('em').should('exist')
      cy.get('ul').should('exist')
    })
    return this
  }

  shouldHaveValidMetadata() {
    this.articleMeta.within(() => {
      this.authorAvatar.should('have.attr', 'src')
      this.authorName.should('not.be.empty')
      this.articleDate.should('not.be.empty')
    })
    return this
  }

  shouldHaveValidCommentStructure() {
    this.commentList.find('[data-cy="comment-item"]').each($comment => {
      cy.wrap($comment).within(() => {
        cy.get('[data-cy="comment-author"]').should('exist')
        cy.get('[data-cy="comment-date"]').should('exist')
        cy.get('[data-cy="comment-body"]').should('exist')
      })
    })
    return this
  }

  shouldHaveAccessibleContent() {
    this.articleTitle.should('have.attr', 'role', 'heading')
    this.favoriteButton.should('have.attr', 'aria-label')
    this.followButton.should('have.attr', 'aria-label')
    return this
  }

  // Comment-specific assertions
  shouldHaveCommentByAuthor(author, commentText) {
    this.commentList.within(() => {
      cy.contains(commentText)
        .parent()
        .within(() => {
          cy.get('[data-cy="comment-author"]').should('contain', author)
        })
    })
    return this
  }

  shouldHaveCommentDeleteButton(commentText) {
    this.commentList
      .contains(commentText)
      .parent()
      .within(() => {
        cy.get('[data-cy="delete-comment-button"]').should('exist')
      })
    return this
  }

  shouldNotHaveCommentDeleteButton(commentText) {
    this.commentList
      .contains(commentText)
      .parent()
      .within(() => {
        cy.get('[data-cy="delete-comment-button"]').should('not.exist')
      })
    return this
  }

  // API interaction checks
  shouldMakeFavoriteRequest() {
    cy.intercept('POST', '**/articles/*/favorite').as('favoriteRequest')
    return this
  }

  shouldMakeUnfavoriteRequest() {
    cy.intercept('DELETE', '**/articles/*/favorite').as('unfavoriteRequest')
    return this
  }

  shouldMakeFollowRequest() {
    cy.intercept('POST', '**/profiles/*/follow').as('followRequest')
    return this
  }

  shouldMakeUnfollowRequest() {
    cy.intercept('DELETE', '**/profiles/*/follow').as('unfollowRequest')
    return this
  }

  shouldMakeCommentRequest() {
    cy.intercept('POST', '**/articles/*/comments').as('commentRequest')
    return this
  }

  shouldMakeDeleteCommentRequest() {
    cy.intercept('DELETE', '**/articles/*/comments/*').as('deleteCommentRequest')
    return this
  }

  shouldReceiveFavoriteResponse() {
    cy.wait('@favoriteRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveUnfavoriteResponse() {
    cy.wait('@unfavoriteRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveFollowResponse() {
    cy.wait('@followRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveUnfollowResponse() {
    cy.wait('@unfollowRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveCommentResponse() {
    cy.wait('@commentRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }

  shouldReceiveDeleteCommentResponse() {
    cy.wait('@deleteCommentRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    return this
  }
}

export default ArticlePage