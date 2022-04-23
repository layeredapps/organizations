/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/organizations/secret-invitation', () => {
  describe('exceptions', () => {
    describe('invalid-secret-code', () => {
      it('missing querystring secret-code', async () => {
        const owner = await TestHelper.createUser()
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.firstName,
          'display-email': owner.profile.contactEmail
        })
        await TestHelper.createOrganization(owner, {
          email: owner.profile.displayEmail,
          name: 'My organization',
          profileid: owner.profile.profileid,
          pin: '12345'
        })
        const req = TestHelper.createRequest(`/api/user/organizations/secret-invitation?organization-pin=${owner.organization.pin}`)
        req.account = owner.account
        req.session = owner.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })

      it('invalid querystring secret-code', async () => {
        const owner = await TestHelper.createUser()
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.firstName,
          'display-email': owner.profile.contactEmail
        })
        await TestHelper.createOrganization(owner, {
          email: owner.profile.displayEmail,
          name: 'My organization',
          profileid: owner.profile.profileid,
          pin: '12345'
        })
        const req = TestHelper.createRequest(`/api/user/organizations/secret-invitation?secret-code=invalid&organization-pin=${owner.organization.pin}`)
        req.account = owner.account
        req.session = owner.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })
    })

    describe('invalid-organization-pin', () => {
      it('missing querystring organization-pin', async () => {
        const owner = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/secret-invitation?secret-code=13245')
        req.account = owner.account
        req.session = owner.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-organization-pin')
      })

      it('invalid querystring organization-pin', async () => {
        const owner = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/secret-invitation?secret-code=12345&organization-pin=invalid')
        req.account = owner.account
        req.session = owner.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-organization-pin')
      })
    })

    describe('invalid-invitation', () => {
      it('querystring invitationid is used', async () => {
        const owner = await TestHelper.createUser()
        const user = await TestHelper.createUser()
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.firstName,
          'display-email': owner.profile.contactEmail
        })
        await TestHelper.createProfile(user, {
          'display-name': user.profile.firstName,
          'display-email': user.profile.contactEmail
        })
        await TestHelper.createOrganization(owner, {
          email: owner.profile.displayEmail,
          name: 'My organization',
          profileid: owner.profile.profileid,
          pin: '12345'
        })
        await TestHelper.createInvitation(owner, {
          lifespan: 'single'
        })
        await TestHelper.acceptInvitation(user, owner)
        const req = TestHelper.createRequest(`/api/user/organizations/secret-invitation?secret-code=${owner.invitation.secretCode}&organization-pin=${owner.organization.pin}`)
        req.account = user.account
        req.session = user.session
        let errorMessage
        try {
          await req.get()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invitation')
      })
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const owner = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(owner, {
        'display-name': owner.profile.firstName,
        'display-email': owner.profile.contactEmail
      })
      await TestHelper.createOrganization(owner, {
        email: owner.profile.displayEmail,
        name: 'My organization',
        profileid: owner.profile.profileid,
        pin: '12345'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/organizations/secret-invitation?secret-code=${owner.invitation.secretCode}&organization-pin=${owner.organization.pin}`)
      req.account = user.account
      req.session = user.session
      req.filename = __filename
      req.saveResponse = true
      const invitation = await req.get()
      assert.strictEqual(invitation.object, 'invitation')
    })
  })
})
