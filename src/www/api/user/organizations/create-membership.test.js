/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/organizations/create-membership', () => {
  describe('exceptions', () => {
    describe('invalid-invitation', () => {
      it('invitation has been used', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner, {
          lifespan: 'single'
        })
        const user = await TestHelper.createUser()
        await TestHelper.createProfile(user, {
          'display-name': user.profile.fullName,
          'display-email': user.profile.contactEmail
        })
        await TestHelper.acceptInvitation(user, owner)
        const user2 = await TestHelper.createUser()
        await TestHelper.createProfile(user2, {
          'display-name': user2.profile.fullName,
          'display-email': user2.profile.contactEmail
        })
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user2.account
        req.session = user2.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: user2.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invitation')
      })

      it('invitation has been terminated', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner, {
          lifespan: 'multi'
        })
        await TestHelper.terminateInvitation(owner)
        const user = await TestHelper.createUser()
        await TestHelper.createProfile(user, {
          'display-name': user.profile.fullName,
          'display-email': user.profile.contactEmail
        })
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invitation')
      })
    })

    describe('invalid-organization-pin', () => {
      it('missing posted organization-pin', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '',
          'secret-code': owner.invitation.secretCode,
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-organization-pin')
      })

      it('invalid posted organization-pin', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': 'invalid',
          'secret-code': owner.invitation.secretCode,
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-organization-pin')
      })
    })

    describe('invalid-secret-code', () => {
      it('missing posted secret-code', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': '',
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })

      it('invalid posted secret-code', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': 'invalid',
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-secret-code')
      })
    })

    describe('invalid-account', () => {
      it('accessing account is organization owner', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = owner.account
        req.session = owner.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: owner.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })

      it('accessing account is organization member', async () => {
        const owner = await TestHelper.createUser()
        const user = await TestHelper.createUser()
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.fullName,
          'display-email': owner.profile.contactEmail
        })
        await TestHelper.createProfile(user, {
          'display-name': user.profile.fullName,
          'display-email': user.profile.contactEmail
        })
        global.userProfileFields = ['display-email', 'display-name']
        await TestHelper.createOrganization(owner, {
          email: owner.profile.displayEmail,
          name: 'My organization',
          profileid: owner.profile.profileid,
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        await TestHelper.acceptInvitation(user, owner)
        await TestHelper.createInvitation(owner)
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-account')
      })
    })

    describe('invalid-profileid', () => {
      it('missing posted profileid', async () => {
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
          pin: '12345'
        })
        await TestHelper.createInvitation(owner)
        const user = await TestHelper.createUser()
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: ''
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
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.fullName,
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
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: 'invalid'
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-profileid')
      })
    })

    describe('invalid-profile', () => {
      it('ineligible posted profileid is missing fields', async () => {
        const owner = await TestHelper.createUser()
        global.userProfileFields = global.membershipProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.fullName,
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
        global.userProfileFields = global.membershipProfileFields = ['display-email']
        await TestHelper.createProfile(user, {
          'display-email': user.profile.contactEmail
        })
        global.userProfileFields = global.membershipProfileFields = ['display-name', 'display-email']
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: user.profile.profileid
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

    describe('invalid-invitation', () => {
      it('querystring invitationid is not open invitation', async () => {
        const owner = await TestHelper.createUser()
        const user = await TestHelper.createUser()
        const user2 = await TestHelper.createUser()
        global.userProfileFields = ['display-name', 'display-email']
        await TestHelper.createProfile(owner, {
          'display-name': owner.profile.fullName,
          'display-email': owner.profile.contactEmail
        })
        await TestHelper.createProfile(user, {
          'display-name': user.profile.fullName,
          'display-email': user.profile.contactEmail
        })
        await TestHelper.createProfile(user2, {
          'display-name': user2.profile.fullName,
          'display-email': user2.profile.contactEmail
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
        await TestHelper.acceptInvitation(user2, owner)
        const req = TestHelper.createRequest('/api/user/organizations/create-membership')
        req.account = user.account
        req.session = user.session
        req.body = {
          'organization-pin': '12345',
          'secret-code': owner.invitation.secretCode,
          profileid: user.profile.profileid
        }
        let errorMessage
        try {
          await req.post()
        } catch (error) {
          errorMessage = error.message
        }
        assert.strictEqual(errorMessage, 'invalid-invitation')
      })
    })
  })

  describe('receives', () => {
    it('required posted secret-code', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
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
        pin: '12345'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/api/user/organizations/create-membership')
      req.account = user.account
      req.session = user.session
      req.body = {
        'organization-pin': '12345',
        'secret-code': owner.invitation.secretCode,
        profileid: user.profile.profileid
      }
      const membership = await req.post()
      assert.strictEqual(membership.object, 'membership')
    })

    it('required posted profileid', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
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
        pin: '12345'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/api/user/organizations/create-membership')
      req.account = user.account
      req.session = user.session
      req.body = {
        'organization-pin': '12345',
        'secret-code': owner.invitation.secretCode,
        profileid: user.profile.profileid
      }
      const membership = await req.post()
      assert.strictEqual(membership.profileid, user.profile.profileid)
    })
  })

  describe('returns', () => {
    it('object', async () => {
      const owner = await TestHelper.createUser()
      const user = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
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
        pin: '12345'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest('/api/user/organizations/create-membership')
      req.account = user.account
      req.session = user.session
      req.body = {
        'organization-pin': '12345',
        'secret-code': owner.invitation.secretCode,
        profileid: user.profile.profileid
      }
      req.filename = __filename
      req.saveResponse = true
      const membership = await req.post()
      assert.strictEqual(membership.object, 'membership')
    })
  })
})
