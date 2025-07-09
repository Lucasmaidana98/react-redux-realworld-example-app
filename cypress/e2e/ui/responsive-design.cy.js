import HomePage from '../../page-objects/HomePage'
import AuthPage from '../../page-objects/AuthPage'
import ArticlePage from '../../page-objects/ArticlePage'

describe('Responsive Design Tests', () => {
  const homePage = new HomePage()
  const authPage = new AuthPage()
  const articlePage = new ArticlePage()

  const viewports = [
    { device: 'mobile', width: 375, height: 667 },
    { device: 'tablet', width: 768, height: 1024 },
    { device: 'laptop', width: 1366, height: 768 },
    { device: 'desktop', width: 1920, height: 1080 }
  ]

  describe('Homepage Responsive Behavior', () => {
    viewports.forEach(viewport => {
      it(`should display correctly on ${viewport.device} (${viewport.width}x${viewport.height})`, 
        { tags: ['@responsive', '@ui'] }, () => {
        cy.viewport(viewport.width, viewport.height)
        homePage.visit()
          .shouldHaveArticles()
          .shouldHaveTags()

        // Take screenshot for visual regression testing
        cy.screenshot(`homepage-${viewport.device}`)

        // Verify key elements are visible and properly sized
        cy.get('[data-cy="article-list"]').should('be.visible')
        cy.get('[data-cy="tag-list"]').should('be.visible')

        if (viewport.width >= 768) {
          // Tablet and desktop should show sidebar
          cy.get('[data-cy="sidebar"]').should('be.visible')
        } else {
          // Mobile might have collapsible sidebar
          cy.get('[data-cy="sidebar"]').should('exist')
        }
      })
    })

    it('should handle navigation menu on mobile devices', { tags: ['@responsive', '@navigation'] }, () => {
      cy.viewport('iphone-x')
      homePage.visit()

      // Check if mobile menu toggle exists
      cy.get('[data-cy="mobile-menu-toggle"]').should('be.visible').click()
      cy.get('[data-cy="mobile-menu"]').should('be.visible')

      // Test navigation items
      cy.get('[data-cy="mobile-menu"]').within(() => {
        cy.get('[data-cy="home-link"]').should('be.visible')
        cy.get('[data-cy="login-link"]').should('be.visible')
        cy.get('[data-cy="register-link"]').should('be.visible')
      })
    })
  })

  describe('Authentication Forms Responsive Behavior', () => {
    viewports.forEach(viewport => {
      it(`should display login form correctly on ${viewport.device}`, 
        { tags: ['@responsive', '@auth'] }, () => {
        cy.viewport(viewport.width, viewport.height)
        authPage.visitLogin()

        // Form should be visible and properly sized
        authPage.loginForm.should('be.visible')
        authPage.emailInput.should('be.visible')
        authPage.passwordInput.should('be.visible')
        authPage.loginButton.should('be.visible')

        // Form should be usable
        authPage.emailInput.type('test@example.com')
        authPage.passwordInput.type('password123')

        cy.screenshot(`login-form-${viewport.device}`)
      })

      it(`should display register form correctly on ${viewport.device}`, 
        { tags: ['@responsive', '@auth'] }, () => {
        cy.viewport(viewport.width, viewport.height)
        authPage.visitRegister()

        authPage.registerForm.should('be.visible')
        authPage.usernameInput.should('be.visible')
        authPage.emailInput.should('be.visible')
        authPage.passwordInput.should('be.visible')
        authPage.registerButton.should('be.visible')

        cy.screenshot(`register-form-${viewport.device}`)
      })
    })
  })

  describe('Article Page Responsive Behavior', () => {
    beforeEach(() => {
      const { email, password } = Cypress.env('testUser')
      cy.loginAPI(email, password)
    })

    viewports.forEach(viewport => {
      it(`should display article content correctly on ${viewport.device}`, 
        { tags: ['@responsive', '@articles'] }, () => {
        cy.viewport(viewport.width, viewport.height)
        
        // Create and visit an article
        const articleData = Cypress.env('testArticle')
        cy.createArticle(articleData.title, articleData.description, articleData.body, articleData.tags)

        articlePage.shouldHaveTitle(articleData.title)
          .shouldHaveBody(articleData.body)
          .shouldHaveValidMetadata()

        // Check responsive layout
        articlePage.articleMeta.should('be.visible')
        articlePage.commentSection.should('be.visible')

        if (viewport.width >= 768) {
          // Larger screens should show action buttons inline
          articlePage.favoriteButton.should('be.visible')
          articlePage.followButton.should('be.visible')
        }

        cy.screenshot(`article-page-${viewport.device}`)
      })
    })
  })

  describe('Touch and Mobile Interactions', () => {
    it('should support touch interactions on mobile', { tags: ['@responsive', '@mobile'] }, () => {
      cy.viewport('iphone-x')
      homePage.visit()

      // Test swipe gestures (if implemented)
      cy.get('[data-cy="article-list"]').trigger('touchstart', { which: 1 })
      cy.get('[data-cy="article-list"]').trigger('touchend')

      // Test tap interactions
      cy.get('[data-cy="article-preview"]').first().trigger('touchstart').trigger('touchend')
    })

    it('should handle long press on mobile devices', { tags: ['@responsive', '@mobile'] }, () => {
      cy.viewport('iphone-x')
      homePage.visit()

      cy.get('[data-cy="article-preview"]').first()
        .trigger('touchstart')
        .wait(1000)
        .trigger('touchend')

      // Should show context menu or additional options
      cy.get('[data-cy="context-menu"]').should('exist')
    })
  })

  describe('Responsive Images and Media', () => {
    it('should load appropriate image sizes for different viewports', { tags: ['@responsive', '@images'] }, () => {
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        homePage.visit()

        cy.get('[data-cy="author-avatar"]').each($img => {
          cy.wrap($img).should('be.visible')
          cy.wrap($img).should('have.attr', 'src')
          
          // Check if image loads properly
          cy.wrap($img).should($el => {
            expect($el[0].naturalWidth).to.be.greaterThan(0)
          })
        })
      })
    })
  })

  describe('Responsive Typography', () => {
    it('should have readable font sizes across all devices', { tags: ['@responsive', '@typography'] }, () => {
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        homePage.visit()

        // Check article titles are readable
        cy.get('[data-cy="article-title"]').each($title => {
          cy.wrap($title).should('be.visible')
          cy.wrap($title).should($el => {
            const fontSize = window.getComputedStyle($el[0]).fontSize
            const fontSizePx = parseInt(fontSize.replace('px', ''))
            expect(fontSizePx).to.be.at.least(14) // Minimum readable size
          })
        })

        // Check body text is readable
        cy.get('[data-cy="article-description"]').each($desc => {
          cy.wrap($desc).should('be.visible')
          cy.wrap($desc).should($el => {
            const fontSize = window.getComputedStyle($el[0]).fontSize
            const fontSizePx = parseInt(fontSize.replace('px', ''))
            expect(fontSizePx).to.be.at.least(12)
          })
        })
      })
    })
  })

  describe('Responsive Layout Shifts', () => {
    it('should not have significant layout shifts during loading', { tags: ['@responsive', '@performance'] }, () => {
      cy.viewport('iphone-x')
      
      // Monitor for layout shifts
      cy.window().then(win => {
        let cumulativeLayoutShift = 0
        
        const observer = new win.PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              cumulativeLayoutShift += entry.value
            }
          }
        })
        
        observer.observe({ entryTypes: ['layout-shift'] })
        
        homePage.visit()
        
        cy.wait(3000) // Wait for page to fully load
        
        cy.then(() => {
          expect(cumulativeLayoutShift).to.be.lessThan(0.1) // Good CLS score
        })
      })
    })
  })

  describe('Responsive Form Inputs', () => {
    it('should have properly sized form inputs on mobile', { tags: ['@responsive', '@forms'] }, () => {
      cy.viewport('iphone-x')
      authPage.visitLogin()

      // Form inputs should be at least 44px tall for touch targets
      authPage.emailInput.should($el => {
        const height = $el[0].offsetHeight
        expect(height).to.be.at.least(44)
      })

      authPage.passwordInput.should($el => {
        const height = $el[0].offsetHeight
        expect(height).to.be.at.least(44)
      })

      authPage.loginButton.should($el => {
        const height = $el[0].offsetHeight
        expect(height).to.be.at.least(44)
      })
    })

    it('should prevent zoom on input focus on iOS', { tags: ['@responsive', '@mobile'] }, () => {
      cy.viewport('iphone-x')
      authPage.visitLogin()

      // Check viewport meta tag prevents zoom
      cy.get('meta[name="viewport"]')
        .should('have.attr', 'content')
        .and('include', 'user-scalable=no')
    })
  })

  describe('Responsive Navigation', () => {
    it('should adapt navigation for different screen sizes', { tags: ['@responsive', '@navigation'] }, () => {
      // Desktop navigation
      cy.viewport(1920, 1080)
      homePage.visit()
      cy.get('[data-cy="desktop-nav"]').should('be.visible')
      cy.get('[data-cy="mobile-menu-toggle"]').should('not.be.visible')

      // Tablet navigation
      cy.viewport(768, 1024)
      homePage.visit()
      cy.get('[data-cy="desktop-nav"]').should('be.visible')

      // Mobile navigation
      cy.viewport(375, 667)
      homePage.visit()
      cy.get('[data-cy="mobile-menu-toggle"]').should('be.visible')
      cy.get('[data-cy="desktop-nav"]').should('not.be.visible')
    })
  })

  describe('Performance on Different Devices', () => {
    it('should load quickly on mobile devices', { tags: ['@responsive', '@performance'] }, () => {
      cy.viewport('iphone-x')
      
      const startTime = Date.now()
      homePage.visit()
      
      cy.get('[data-cy="article-list"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // Should load within 3 seconds on mobile
      })
    })
  })

  describe('Accessibility on Mobile', () => {
    it('should maintain accessibility standards on mobile', { tags: ['@responsive', '@accessibility'] }, () => {
      cy.viewport('iphone-x')
      homePage.visit()

      // Check that interactive elements are large enough
      cy.get('[data-cy="article-preview"]').each($el => {
        cy.wrap($el).should($element => {
          const rect = $element[0].getBoundingClientRect()
          expect(rect.height).to.be.at.least(44) // Minimum touch target size
        })
      })

      // Check focus indicators are visible
      cy.get('[data-cy="article-preview"]').first().focus()
      cy.get('[data-cy="article-preview"]').first().should('have.css', 'outline-width')
    })
  })
})