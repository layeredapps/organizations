/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/organizations/edit-organization', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.organization.organizationid, owner.organization.organizationid)
    })
  })

  describe('view', () => {
    it('should present the form', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should apply organization update (screenshots)', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        email: owner.profile.displayEmail,
        name: 'Organization name'
      }
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/organizations' },
        { click: '/account/organizations/organizations' },
        { click: `/account/organizations/organization?organizationid=${owner.organization.organizationid}` },
        { click: `/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}` },
        { fill: '#submit-form' }
      ]
      global.pageSize = 50
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('invalid-pin', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'My organization',
        email: owner.profile.displayEmail,
        pin: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-pin')
    })

    it('duplicate-pin', async () => {
      const other = await TestHelper.createUser()
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(other, {
        'display-name': 'Person',
        'display-email': 'person@email.com'
      })
      await TestHelper.createOrganization(other, {
        email: other.profile.displayEmail,
        name: 'My organization',
        profileid: other.profile.profileid,
        pin: 'abcde'
      })
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'My organization',
        email: owner.profile.displayEmail,
        pin: 'abcde'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'duplicate-pin')
    })

    it('invalid-organization-name', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: '',
        email: owner.profile.displayEmail
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-organization-name')
    })

    it('invalid-organization-name-length', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: '1',
        email: owner.profile.contactEmail
      }
      global.minimumOrganizationNameLength = 2
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-organization-name-length')
      global.maximumOrganizationNameLength = 1
      const req2 = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req2.account = owner.account
      req2.session = owner.session
      req2.body = {
        name: '1234567890',
        email: owner.profile.contactEmail
      }
      const result2 = await req2.post(req2)
      const doc2 = TestHelper.extractDoc(result2.html)
      const message2 = doc2.getElementById('message-container').child[0]
      assert.strictEqual(message2.attr.template, 'invalid-organization-name-length')
    })

    it('invalid-organization-email', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.session = owner.session
      req.account = owner.account
      req.body = {
        name: 'org-name',
        email: ''
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'invalid-organization-email')
    })

    it('should require owner', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'Owner\'s organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.error, 'invalid-account')
    })

    it('invalid-xss-input', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        email: '<script>',
        name: 'Organization name'
      }
      const result = await req.post()
      const doc = TestHelper.extractDoc(result.html)
      const messageContainer = doc.getElementById('message-container')
      const message = messageContainer.child[0]
      assert.strictEqual(message.attr.template, 'invalid-xss-input')
    })

    it('invalid-csrf-token', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '1234'
      })
      const req = TestHelper.createRequest(`/account/organizations/edit-organization?organizationid=${owner.organization.organizationid}`)
      req.puppeteer = false
      req.account = owner.account
      req.session = owner.session
      req.body = {
        email: owner.profile.displayEmail,
        name: 'Organization name',
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
