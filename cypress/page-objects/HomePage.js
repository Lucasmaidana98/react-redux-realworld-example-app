class HomePage {
  // Selectors
  get banner() { return cy.get('[data-cy="banner"]') }
  get tagList() { return cy.get('[data-cy="tag-list"]') }
  get articleList() { return cy.get('[data-cy="article-list"]') }
  get articlePreview() { return cy.get('[data-cy="article-preview"]') }
  get pagination() { return cy.get('[data-cy="pagination"]') }
  get globalFeedTab() { return cy.get('[data-cy="global-feed-tab"]') }
  get yourFeedTab() { return cy.get('[data-cy="your-feed-tab"]') }
  get feedToggle() { return cy.get('[data-cy="feed-toggle"]') }
  get popularTags() { return cy.get('[data-cy="popular-tags"]') }
  get loadingSpinner() { return cy.get('[data-cy="loading"]') }
  get noArticlesMessage() { return cy.get('[data-cy="no-articles"]') }

  // Actions
  visit() {
    cy.visit('/')
    return this
  }

  clickGlobalFeed() {
    this.globalFeedTab.click()
    return this
  }

  clickYourFeed() {
    this.yourFeedTab.click()
    return this
  }

  clickTag(tagName) {
    cy.get(`[data-cy="tag-${tagName}"]`).click()
    return this
  }

  clickArticle(articleTitle) {
    this.articleList.contains(articleTitle).click()
    return this
  }

  favoriteArticle(articleTitle) {
    this.articleList
      .contains(articleTitle)
      .parent()
      .within(() => {
        cy.get('[data-cy="favorite-button"]').click()
      })
    return this
  }

  clickPagination(pageNumber) {
    cy.get(`[data-cy="page-${pageNumber}"]`).click()
    return this
  }

  // Assertions
  shouldHaveArticles() {
    this.articleList.should('exist')
    this.articlePreview.should('have.length.greaterThan', 0)
    return this
  }

  shouldHaveNoArticles() {
    this.noArticlesMessage.should('be.visible')
    return this
  }

  shouldHaveTags() {
    this.popularTags.should('exist')
    this.tagList.should('have.length.greaterThan', 0)
    return this
  }

  shouldShowBanner() {
    this.banner.should('be.visible')
    return this
  }

  shouldNotShowBanner() {
    this.banner.should('not.exist')
    return this
  }

  shouldHaveActiveTab(tabName) {
    cy.get(`[data-cy="${tabName}-tab"]`).should('have.class', 'active')
    return this
  }

  shouldHaveArticleCount(count) {
    this.articlePreview.should('have.length', count)
    return this
  }

  shouldHaveTag(tagName) {
    cy.get(`[data-cy="tag-${tagName}"]`).should('exist')
    return this
  }

  shouldNotBeLoading() {
    this.loadingSpinner.should('not.exist')
    return this
  }

  shouldHaveFilteredArticles(tagName) {
    cy.get(`[data-cy="tag-filter-${tagName}"]`).should('be.visible')
    return this
  }

  shouldHavePagination() {
    this.pagination.should('exist')
    return this
  }

  shouldHaveActivePage(pageNumber) {
    cy.get(`[data-cy="page-${pageNumber}"]`).should('have.class', 'active')
    return this
  }

  // Getters for article data
  getArticleTitle(index = 0) {
    return this.articlePreview.eq(index).find('[data-cy="article-title"]')
  }

  getArticleDescription(index = 0) {
    return this.articlePreview.eq(index).find('[data-cy="article-description"]')
  }

  getArticleAuthor(index = 0) {
    return this.articlePreview.eq(index).find('[data-cy="article-author"]')
  }

  getArticleDate(index = 0) {
    return this.articlePreview.eq(index).find('[data-cy="article-date"]')
  }

  getArticleTags(index = 0) {
    return this.articlePreview.eq(index).find('[data-cy="article-tags"]')
  }

  getFavoriteCount(index = 0) {
    return this.articlePreview.eq(index).find('[data-cy="favorite-count"]')
  }
}

export default HomePage