/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/organizations/create-organization', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const owner = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should have elements for full-name', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('full-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for display-name', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['display-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('display-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for contact-email', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('contact-email-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for display-email', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('display-email-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for dob', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('dob-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for phone', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('phone-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for occupation', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['occupation']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('occupation-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for location', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['location']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('location-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for company-name', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('company-name-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })

    it('should have elements for website', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['website']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const inputContainer = doc.getElementById('website-container')
      assert.strictEqual(inputContainer.tag, 'div')
    })
  })

  describe('submit', () => {
    it('should accept valid existing profile', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = global.membershipProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        profileid: owner.profile.profileid,
        pin: '1234'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile (screenshots)', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['display-name', 'display-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        'display-name': owner.profile.firstName,
        'display-email': owner.profile.contactEmail,
        pin: '12344'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/organizations' },
        { click: '/account/organizations/create-organization' },
        { fill: '#submit-form' }
      ]
      global.pageSize = 50
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with full-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': owner.profile.firstName,
        'last-name': owner.profile.lastName
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with display name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['display-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-name': owner.profile.lastName
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with contact-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'contact-email': owner.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with display-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-email': owner.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with dob in YYYY-MM-DD', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        dob: '1970-12-31'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with dob in MM-DD-YYYY', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        dob: '12-31-1970'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with phone', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        phone: '456-789-0123'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with occupation', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['occupation']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        occupation: 'Associate'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with location', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['location']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        location: 'Toronto'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with company-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'company-name': 'ACME INC'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should create organization and new profile with website', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['website']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        website: 'https://company-website.com'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('invalid-pin', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(user, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      req.body = {
        name: 'My organization',
        profileid: user.profile.profileid,
        email: 'org@email.com',
        pin: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-pin')
    })

    it('duplicate-pin', async () => {
      const user = await TestHelper.createUser()
      const other = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(other, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      await TestHelper.createOrganization(other, {
        email: other.profile.displayEmail,
        name: 'My organization',
        profileid: other.profile.profileid,
        pin: '12344'
      })
      await TestHelper.createProfile(user, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      req.body = {
        name: 'oooo',
        email: 'org@email.com',
        profileid: user.profile.profileid,
        pin: '12344'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'duplicate-pin')
    })

    it('invalid-organization-name', async () => {
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(user, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      req.body = {
        name: '',
        email: 'org@email.com',
        profileid: user.profile.profileid,
        pin: '12344'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-organization-name')
    })

    it('invalid-organization-name-length', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = user.account
      req.session = user.session
      req.body = {
        name: '1',
        email: 'org@email.com',
        'display-name': 'administrator',
        'display-email': 'org-admin@email.com',
        pin: '12344'
      }
      global.minimumOrganizationNameLength = 2
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-organization-name-length')
      const req2 = TestHelper.createRequest('/account/organizations/create-organization')
      req2.account = user.account
      req2.session = user.session
      req2.body = {
        name: '1234567890',
        email: 'org@email.com',
        pin: '12344'
      }
      global.maximumOrganizationNameLength = 1
      const result2 = await req2.post(req2)
      const doc2 = TestHelper.extractDoc(result2.html)
      const message2 = doc2.getElementById('message-container').child[0]
      assert.strictEqual(message2.attr.template, 'invalid-organization-name-length')
    })

    it('invalid-organization-email', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.session = user.session
      req.account = user.account
      req.body = {
        name: 'org-name',
        email: '',
        'display-name': 'administrator',
        'display-email': 'org-admin@email.com',
        pin: '12344'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-organization-email')
    })

    it('invalid-first-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': '',
        'last-name': owner.profile.lastName
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name')
    })

    it('invalid-first-name-length', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': '1',
        'last-name': owner.profile.lastName
      }
      global.minimumProfileFirstNameLength = 10
      global.maximumProfileFirstNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-first-name-length')
      global.minimumProfileFirstNameLength = 1
      global.maximumProfileFirstNameLength = 10
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': '1000000000000000000000000000',
        'last-name': owner.profile.lastName
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-first-name-length')
    })

    it('invalid-last-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': owner.profile.firstName,
        'last-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-last-name')
    })

    it('invalid-last-name-length', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': owner.profile.firstName,
        'last-name': '1'
      }
      global.minimumProfileLastNameLength = 10
      global.maximumProfileLastNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-last-name-length')
      global.minimumProfileLastNameLength = 1
      global.maximumProfileLastNameLength = 10
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'first-name': owner.profile.firstName,
        'last-name': '1000000000000000000'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-last-name-length')
    })

    it('invalid-contact-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['contact-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'contact-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'contact-email': 'invalid'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-contact-email')
    })

    it('invalid-display-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['display-email']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-email': 'invalid'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-email')
    })

    it('invalid-display-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['display-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name')
    })

    it('invalid-display-name-length', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['display-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-name': '1'
      }
      global.minimumProfileDisplayNameLength = 10
      global.maximumProfileDisplayNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-name-length')
      global.minimumProfileDisplayNameLength = 1
      global.maximumProfileDisplayNameLength = 10
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'display-name': '100000000000000000000'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-name-length')
    })

    it('invalid-dob', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['dob']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        dob: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        dob: '2017-32-49'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-dob')
    })

    it('invalid-phone', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['phone']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        phone: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-phone')
    })

    it('invalid-occupation', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['occupation']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        occupation: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-occupation')
    })

    it('invalid-location', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['location']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        location: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-location')
    })

    it('invalid-company-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['company-name']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        'company-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-company-name')
    })

    it('invalid-website', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = ['website']
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        pin: '1230',
        website: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-website')
    })

    it('invalid-xss-input', async () => {
      const owner = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: '<script>',
        email: 'test@test.com',
        'display-name': owner.profile.firstName,
        'display-email': owner.profile.contactEmail,
        pin: '12344'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-xss-input')
    })

    it('invalid-csrf-token', async () => {
      const owner = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/create-organization')
      req.puppeteer = false
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'org-name',
        email: 'test@test.com',
        'display-name': owner.profile.firstName,
        'display-email': owner.profile.contactEmail,
        pin: '12344',
        'csrf-token': 'invalid'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-csrf-token')
    })
  })
})
