/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/organizations/create-organization', () => {
  describe('exceptions', () => {
    describe('invalid-organization-name', () => {
      it('missing posted name', async () => {
        const owner = await TestHelper.createUser()
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.fullName,
          'display-email': owner.profile.contactEmail
        })
        const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
        req.account = owner.account
        req.session = owner.session
        req.body = {
          name: '',
          email: owner.profile.contactEmail,
          profileid: owner.profile.profileid,
          pin: '12345'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-organization-name')
      })
    })
  })

  describe('invalid-organization-name-length', () => {
    it('posted name too short', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'Sales',
        email: owner.profile.contactEmail,
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      global.minimumOrganizationNameLength = 100
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-organization-name-length')
      global.maximumOrganizationNameLength = 1
      errorMessage = null
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-organization-name-length')
    })

    it('posted name too long', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'Sales',
        email: owner.profile.contactEmail,
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      global.maximumOrganizationNameLength = 1
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-organization-name-length')
      global.maximumOrganizationNameLength = 1
      errorMessage = null
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-organization-name-length')
    })
  })

  describe('invalid-organization-email', () => {
    it('missing posted email', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail,
        profileid: owner.profile.profileid
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'Family',
        email: '',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-organization-email')
    })

    it('invalid posted email', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail,
        profileid: owner.profile.profileid
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'Family',
        email: 'invalid',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-organization-email')
    })
  })

  describe('invalid-profile', () => {
    it('missing posted profileid', async () => {
      const owner = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: '',
        pin: '12345'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profileid')
    })

    it('invalid posted profileid', async () => {
      const owner = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: 'invalid',
        pin: '12345'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profileid')
    })

    it('ineligible posted profileid missing fields', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = global.membershipProfileFields = ['display-email']
      await TestHelper.createProfile(owner, {
        'display-email': owner.profile.contactEmail
      })
      global.userProfileFields = global.membershipProfileFields = ['display-name', 'display-email']
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      let errorMessage
      try {
        await req.post()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-profile')
    })
  })

  describe('receives', () => {
    it('required posted organization-email', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      const organization = await req.post()
      assert.strictEqual(organization.email, 'this@address.com')
    })

    it('required posted organization-name', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      const organization = await req.post()
      assert.strictEqual(organization.name, 'this is the name')
    })

    it('required posted profileid', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      const organization = await req.post()
      const req2 = TestHelper.createRequest(`/api/user/organizations/organization-membership?organizationid=${organization.organizationid}`)
      req2.account = owner.account
      req2.session = owner.session
      const membership = await req2.get()
      assert.strictEqual(membership.profileid, owner.profile.profileid)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.fullName,
        'display-email': owner.profile.contactEmail
      })
      const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${owner.account.accountid}`)
      req.account = owner.account
      req.session = owner.session
      req.body = {
        name: 'this is the name',
        email: 'this@address.com',
        profileid: owner.profile.profileid,
        pin: '12345'
      }
      req.filename = __filename
      req.saveResponse = true
      const organization = await req.post()
      assert.strictEqual(organization.object, 'organization')
    })
  })
})
