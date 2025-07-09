describe('API Integration Tests', () => {
  const apiUrl = Cypress.env('apiUrl')

  beforeEach(() => {
    // Set up API interceptors for monitoring
    cy.intercept('GET', `${apiUrl}/**`).as('getRequests')
    cy.intercept('POST', `${apiUrl}/**`).as('postRequests')
    cy.intercept('PUT', `${apiUrl}/**`).as('putRequests')
    cy.intercept('DELETE', `${apiUrl}/**`).as('deleteRequests')
  })

  describe('Authentication API', () => {
    it('should authenticate user via API', { tags: ['@api', '@auth'] }, () => {
      const { email, password } = Cypress.env('testUser')

      cy.request({
        method: 'POST',
        url: `${apiUrl}/users/login`,
        body: {
          user: { email, password }
        }
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('user')
        expect(response.body.user).to.have.property('token')
        expect(response.body.user).to.have.property('username')
        expect(response.body.user).to.have.property('email', email)

        // Store token for subsequent requests
        cy.wrap(response.body.user.token).as('authToken')
      })
    })

    it('should handle invalid credentials', { tags: ['@api', '@auth', '@error'] }, () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/users/login`,
        body: {
          user: {
            email: 'invalid@example.com',
            password: 'wrongpassword'
          }
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(422)
        expect(response.body).to.have.property('errors')
      })
    })

    it('should register new user via API', { tags: ['@api', '@auth'] }, () => {
      const timestamp = Date.now()
      const userData = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'testpassword123'
      }

      cy.request({
        method: 'POST',
        url: `${apiUrl}/users`,
        body: { user: userData }
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.user).to.have.property('username', userData.username)
        expect(response.body.user).to.have.property('email', userData.email)
        expect(response.body.user).to.have.property('token')
      })
    })

    it('should get current user info', { tags: ['@api', '@auth'] }, () => {
      const { email, password } = Cypress.env('testUser')
      
      cy.loginAPI(email, password)
      cy.window().its('localStorage').invoke('getItem', 'jwt').then(token => {
        cy.request({
          method: 'GET',
          url: `${apiUrl}/user`,
          headers: {
            Authorization: `Token ${token}`
          }
        }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.user).to.have.property('email', email)
        })
      })
    })
  })

  describe('Articles API', () => {
    let authToken

    beforeEach(() => {
      const { email, password } = Cypress.env('testUser')
      cy.loginAPI(email, password)
      cy.window().its('localStorage').invoke('getItem', 'jwt').then(token => {
        authToken = token
      })
    })

    it('should fetch articles list', { tags: ['@api', '@articles'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/articles`
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('articles')
        expect(response.body).to.have.property('articlesCount')
        expect(response.body.articles).to.be.an('array')

        if (response.body.articles.length > 0) {
          const article = response.body.articles[0]
          expect(article).to.have.property('slug')
          expect(article).to.have.property('title')
          expect(article).to.have.property('description')
          expect(article).to.have.property('body')
          expect(article).to.have.property('tagList')
          expect(article).to.have.property('author')
        }
      })
    })

    it('should fetch articles with pagination', { tags: ['@api', '@articles'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/articles?limit=5&offset=0`
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.articles.length).to.be.at.most(5)
      })
    })

    it('should fetch articles filtered by tag', { tags: ['@api', '@articles'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/articles?tag=javascript`
      }).then(response => {
        expect(response.status).to.eq(200)
        response.body.articles.forEach(article => {
          expect(article.tagList).to.include('javascript')
        })
      })
    })

    it('should create new article', { tags: ['@api', '@articles'] }, () => {
      const articleData = {
        title: 'API Test Article',
        description: 'Created via API test',
        body: 'This article was created through Cypress API testing',
        tagList: ['api', 'testing', 'cypress']
      }

      cy.then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/articles`,
          headers: {
            Authorization: `Token ${authToken}`
          },
          body: { article: articleData }
        }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.article).to.have.property('slug')
          expect(response.body.article.title).to.eq(articleData.title)
          expect(response.body.article.description).to.eq(articleData.description)
          expect(response.body.article.body).to.eq(articleData.body)
          expect(response.body.article.tagList).to.deep.eq(articleData.tagList)

          cy.wrap(response.body.article.slug).as('createdArticleSlug')
        })
      })
    })

    it('should fetch single article', { tags: ['@api', '@articles'] }, () => {
      cy.get('@createdArticleSlug').then(slug => {
        cy.request({
          method: 'GET',
          url: `${apiUrl}/articles/${slug}`
        }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.article).to.have.property('slug', slug)
          expect(response.body.article).to.have.property('title')
          expect(response.body.article).to.have.property('author')
        })
      })
    })

    it('should update article', { tags: ['@api', '@articles'] }, () => {
      cy.get('@createdArticleSlug').then(slug => {
        const updateData = {
          title: 'Updated API Test Article',
          description: 'Updated via API test',
          body: 'This article was updated through Cypress API testing'
        }

        cy.then(() => {
          cy.request({
            method: 'PUT',
            url: `${apiUrl}/articles/${slug}`,
            headers: {
              Authorization: `Token ${authToken}`
            },
            body: { article: updateData }
          }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.article.title).to.eq(updateData.title)
            expect(response.body.article.description).to.eq(updateData.description)
            expect(response.body.article.body).to.eq(updateData.body)
          })
        })
      })
    })

    it('should delete article', { tags: ['@api', '@articles'] }, () => {
      cy.get('@createdArticleSlug').then(slug => {
        cy.then(() => {
          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/articles/${slug}`,
            headers: {
              Authorization: `Token ${authToken}`
            }
          }).then(response => {
            expect(response.status).to.eq(200)
          })

          // Verify article is deleted
          cy.request({
            method: 'GET',
            url: `${apiUrl}/articles/${slug}`,
            failOnStatusCode: false
          }).then(response => {
            expect(response.status).to.eq(404)
          })
        })
      })
    })

    it('should favorite/unfavorite article', { tags: ['@api', '@articles'] }, () => {
      // First create an article to favorite
      const articleData = {
        title: 'Article to Favorite',
        description: 'For testing favorites',
        body: 'Test content',
        tagList: ['test']
      }

      cy.then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/articles`,
          headers: {
            Authorization: `Token ${authToken}`
          },
          body: { article: articleData }
        }).then(response => {
          const slug = response.body.article.slug

          // Favorite the article
          cy.request({
            method: 'POST',
            url: `${apiUrl}/articles/${slug}/favorite`,
            headers: {
              Authorization: `Token ${authToken}`
            }
          }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.article.favorited).to.be.true
            expect(response.body.article.favoritesCount).to.be.greaterThan(0)
          })

          // Unfavorite the article
          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/articles/${slug}/favorite`,
            headers: {
              Authorization: `Token ${authToken}`
            }
          }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.article.favorited).to.be.false
          })
        })
      })
    })
  })

  describe('Comments API', () => {
    let authToken, articleSlug

    beforeEach(() => {
      const { email, password } = Cypress.env('testUser')
      cy.loginAPI(email, password)
      cy.window().its('localStorage').invoke('getItem', 'jwt').then(token => {
        authToken = token

        // Create an article for commenting
        const articleData = {
          title: 'Article for Comments',
          description: 'For testing comments',
          body: 'Test content for comments',
          tagList: ['comments', 'test']
        }

        cy.request({
          method: 'POST',
          url: `${apiUrl}/articles`,
          headers: {
            Authorization: `Token ${authToken}`
          },
          body: { article: articleData }
        }).then(response => {
          articleSlug = response.body.article.slug
        })
      })
    })

    it('should add comment to article', { tags: ['@api', '@comments'] }, () => {
      const commentData = {
        body: 'This is a test comment via API'
      }

      cy.then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/articles/${articleSlug}/comments`,
          headers: {
            Authorization: `Token ${authToken}`
          },
          body: { comment: commentData }
        }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.comment).to.have.property('id')
          expect(response.body.comment.body).to.eq(commentData.body)
          expect(response.body.comment).to.have.property('author')

          cy.wrap(response.body.comment.id).as('commentId')
        })
      })
    })

    it('should fetch article comments', { tags: ['@api', '@comments'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/articles/${articleSlug}/comments`
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('comments')
        expect(response.body.comments).to.be.an('array')
      })
    })

    it('should delete comment', { tags: ['@api', '@comments'] }, () => {
      cy.get('@commentId').then(commentId => {
        cy.then(() => {
          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/articles/${articleSlug}/comments/${commentId}`,
            headers: {
              Authorization: `Token ${authToken}`
            }
          }).then(response => {
            expect(response.status).to.eq(200)
          })
        })
      })
    })
  })

  describe('User Profiles API', () => {
    let authToken

    beforeEach(() => {
      const { email, password } = Cypress.env('testUser')
      cy.loginAPI(email, password)
      cy.window().its('localStorage').invoke('getItem', 'jwt').then(token => {
        authToken = token
      })
    })

    it('should fetch user profile', { tags: ['@api', '@profiles'] }, () => {
      const { username } = Cypress.env('testUser')

      cy.request({
        method: 'GET',
        url: `${apiUrl}/profiles/${username}`
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.profile).to.have.property('username', username)
        expect(response.body.profile).to.have.property('bio')
        expect(response.body.profile).to.have.property('image')
        expect(response.body.profile).to.have.property('following')
      })
    })

    it('should follow/unfollow user', { tags: ['@api', '@profiles'] }, () => {
      const targetUsername = 'someotheruser'

      // Follow user
      cy.then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/profiles/${targetUsername}/follow`,
          headers: {
            Authorization: `Token ${authToken}`
          },
          failOnStatusCode: false
        }).then(response => {
          if (response.status === 200) {
            expect(response.body.profile.following).to.be.true
          }
        })

        // Unfollow user
        cy.request({
          method: 'DELETE',
          url: `${apiUrl}/profiles/${targetUsername}/follow`,
          headers: {
            Authorization: `Token ${authToken}`
          },
          failOnStatusCode: false
        }).then(response => {
          if (response.status === 200) {
            expect(response.body.profile.following).to.be.false
          }
        })
      })
    })
  })

  describe('Tags API', () => {
    it('should fetch all tags', { tags: ['@api', '@tags'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/tags`
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('tags')
        expect(response.body.tags).to.be.an('array')
        
        if (response.body.tags.length > 0) {
          response.body.tags.forEach(tag => {
            expect(tag).to.be.a('string')
          })
        }
      })
    })
  })

  describe('API Error Handling', () => {
    it('should handle 401 unauthorized errors', { tags: ['@api', '@error'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/user`,
        headers: {
          Authorization: 'Token invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(401)
      })
    })

    it('should handle 404 not found errors', { tags: ['@api', '@error'] }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/articles/non-existent-slug`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
      })
    })

    it('should handle 422 validation errors', { tags: ['@api', '@error'] }, () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/users/login`,
        body: {
          user: {
            email: '',
            password: ''
          }
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(422)
        expect(response.body).to.have.property('errors')
      })
    })
  })

  describe('API Performance', () => {
    it('should respond to API calls within acceptable time', { tags: ['@api', '@performance'] }, () => {
      const startTime = Date.now()

      cy.request({
        method: 'GET',
        url: `${apiUrl}/articles`
      }).then(response => {
        const endTime = Date.now()
        const responseTime = endTime - startTime

        expect(response.status).to.eq(200)
        expect(responseTime).to.be.lessThan(2000) // Should respond within 2 seconds
      })
    })

    it('should handle concurrent API requests', { tags: ['@api', '@performance'] }, () => {
      const requests = []

      for (let i = 0; i < 5; i++) {
        requests.push(
          cy.request({
            method: 'GET',
            url: `${apiUrl}/articles?offset=${i * 10}&limit=10`
          })
        )
      }

      Promise.all(requests).then(responses => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })

  describe('API Security', () => {
    it('should require authentication for protected endpoints', { tags: ['@api', '@security'] }, () => {
      const protectedEndpoints = [
        { method: 'GET', url: `${apiUrl}/user` },
        { method: 'POST', url: `${apiUrl}/articles` },
        { method: 'PUT', url: `${apiUrl}/user` }
      ]

      protectedEndpoints.forEach(endpoint => {
        cy.request({
          method: endpoint.method,
          url: endpoint.url,
          failOnStatusCode: false
        }).then(response => {
          expect(response.status).to.eq(401)
        })
      })
    })

    it('should validate JWT tokens properly', { tags: ['@api', '@security'] }, () => {
      const invalidTokens = [
        'invalid-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        '',
        'Bearer token',
        'malformed.jwt.token'
      ]

      invalidTokens.forEach(token => {
        cy.request({
          method: 'GET',
          url: `${apiUrl}/user`,
          headers: {
            Authorization: `Token ${token}`
          },
          failOnStatusCode: false
        }).then(response => {
          expect(response.status).to.eq(401)
        })
      })
    })
  })
})