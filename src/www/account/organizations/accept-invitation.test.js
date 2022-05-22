/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/organizations/accept-invitation', () => {
  describe('view', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })

    it('should exclude invalid profiles', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        name: 'org-name',
        email: 'test@test.com',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      global.membershipProfileFields = ['display-name', 'display-email']
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.toString().indexOf(user.profile.profileid), -1)
    })

    it('should have elements for full-name', async () => {
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
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
      const user = await TestHelper.createUser()
      global.userProfileFields = global.membershipProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createProfile(user, {
        'display-name': user.profile.fullName,
        'display-email': user.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        profileid: user.profile.profileid
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile (screenshots)', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.userProfileFields = global.membershipProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'display-name': user.profile.fullName,
        'display-email': user.profile.contactEmail
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/organizations' },
        { click: '/account/organizations/accept-invitation' },
        { fill: '#submit-form' }
      ]
      global.pageSize = 50
      global.membershipProfileFields = ['display-name', 'display-email']
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with full-name', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.membershipProfileFields = ['full-name']
      await TestHelper.createOrganization(owner, {
        email: owner.profile.contactEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'full-name': user.profile.fullName
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with display-name', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['display-name']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'display-name': user.profile.fullName
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with contact-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['contact-email']
      await TestHelper.createProfile(owner, {
        'contact-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'contact-email': user.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with display-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['display-email']
      await TestHelper.createProfile(owner, {
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'display-email': user.profile.contactEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with dob in YYYY-MM-DD', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['dob']
      await TestHelper.createProfile(owner, {
        dob: '10-28-2000'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        dob: '2017-11-01'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with dob in MM-DD-YYYY', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['dob']
      await TestHelper.createProfile(owner, {
        dob: '12-25-2000'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        dob: '12-23-2000'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with phone', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['phone']
      await TestHelper.createProfile(owner, {
        phone: '456-789-0123'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        phone: '456-789-0123'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with occupation', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['occupation']
      await TestHelper.createProfile(owner, {
        occupation: 'Worker'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        occupation: 'worker',
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with location', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['location']
      await TestHelper.createProfile(owner, {
        location: 'Location 1'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        location: 'Oslo'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with company-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['company-name']
      await TestHelper.createProfile(owner, {
        'company-name': 'Company 1'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'company-name': 'ACME INC'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })

    it('should accept invitation and create profile with website', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['website']
      await TestHelper.createProfile(owner, {
        website: 'http://website.com'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        website: 'https://website.com'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('invalid-account', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      // owner cannot accept invitation
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-account')
      // invalid account because existing member
      const member = await TestHelper.createUser()
      await TestHelper.createProfile(member, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(member, owner)
      await TestHelper.createInvitation(owner)
      req.account = member.account
      req.session = member.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        profileid: member.profile.profileid
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-account')
    })

    it('invalid-full-name', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['full-name']
      await TestHelper.createProfile(owner, {
        'full-name': owner.profile.fullName
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'full-name': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-full-name')
    })

    it('invalid-full-name-length', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['full-name']
      await TestHelper.createProfile(owner, {
        'full-name': owner.profile.fullName
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'full-name': '1'
      }
      global.minimumProfileFullNameLength = 10
      global.maximumProfileFullNameLength = 100
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-full-name-length')
      global.minimumProfileFullNameLength = 1
      global.maximumProfileFullNameLength = 1
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'full-name': '123456789'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-full-name-length')
    })

    it('invalid-contact-email', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['contact-email']
      await TestHelper.createProfile(owner, {
        'contact-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'contact-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-contact-email')
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['display-email']
      await TestHelper.createProfile(owner, {
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'display-email': ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-display-email')
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['display-name']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['display-name']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.maximumProfileDisplayNameLength = 1
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        'display-name': '123456789'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-display-name-length')
    })

    it('invalid-dob', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['dob']
      await TestHelper.createProfile(owner, {
        dob: '10-28-2000'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        dob: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-dob')
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
        dob: '2017-13-52'
      }
      const result2 = await req.post()
      const doc2 = TestHelper.extractDoc(result2.html)
      const messageContainer2 = doc2.getElementById('message-container')
      const message2 = messageContainer2.child[0]
      assert.strictEqual(message2.attr.template, 'invalid-dob')
    })

    it('invalid-phone', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['phone']
      await TestHelper.createProfile(owner, {
        phone: '456-789-0123'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['occupation']
      await TestHelper.createProfile(owner, {
        occupation: 'Worker'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['location']
      await TestHelper.createProfile(owner, {
        location: 'Location 1'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['company-name']
      await TestHelper.createProfile(owner, {
        'company-name': 'Company 1'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['website']
      await TestHelper.createProfile(owner, {
        website: 'http://website.com'
      })
      await TestHelper.createOrganization(owner, {
        email: 'test@email.com',
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
      global.membershipProfileFields = global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': '<script>',
        'organization-pin': '1230'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-xss-input')
    })

    it('invalid-csrf-token', async () => {
      const owner = await TestHelper.createUser()
      global.membershipProfileFields = global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1230'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/organizations/accept-invitation')
      req.puppeteer = false
      req.account = user.account
      req.session = user.session
      req.body = {
        'secret-code': owner.invitation.secretCode,
        'organization-pin': '1230',
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
