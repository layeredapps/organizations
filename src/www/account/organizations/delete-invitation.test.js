/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/account/organizations/delete-invitation', () => {
  describe('before', () => {
    it('should bind data', async () => {
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
        pin: '12344'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest(`/account/organizations/delete-invitation?invitationid=${owner.invitation.invitationid}`)
      req.account = owner.account
      req.session = owner.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.invitation.invitationid, owner.invitation.invitationid)
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
        pin: '12344'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest(`/account/organizations/delete-invitation?invitationid=${owner.invitation.invitationid}`)
      req.account = owner.account
      req.session = owner.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      assert.strictEqual(doc.getElementById('submit-form').tag, 'form')
      assert.strictEqual(doc.getElementById('submit-button').tag, 'button')
    })
  })

  describe('submit', () => {
    it('should delete invitation (screenshots)', async () => {
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
        pin: '12344'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest(`/account/organizations/delete-invitation?invitationid=${owner.invitation.invitationid}`)
      req.account = owner.account
      req.session = owner.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#account-menu-container' },
        { click: '/account/organizations' },
        { click: `/account/organizations/organization?organizationid=${owner.organization.organizationid}` },
        { click: `/account/organizations/organization-invitations?organizationid=${owner.organization.organizationid}` },
        { click: `/account/organizations/invitation?invitationid=${owner.invitation.invitationid}` },
        { click: `/account/organizations/delete-invitation?invitationid=${owner.invitation.invitationid}` },
        { fill: '#submit-form' }
      ]
      global.pageSize = 50
      const result = await req.post(req)
      const doc = TestHelper.extractDoc(result.html)
      const message = doc.getElementById('message-container').child[0]
      assert.strictEqual(message.attr.template, 'success')
    })
  })

  describe('errors', () => {
    it('invalid-account', async () => {
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
        pin: '12344'
      })
      await TestHelper.createInvitation(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/organizations/delete-invitation?invitationid=${owner.invitation.invitationid}`)
      req.account = user.account
      req.session = user.session
      await req.route.api.before(req)
      assert.strictEqual(req.error, 'invalid-account')
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
        pin: '12344'
      })
      await TestHelper.createInvitation(owner)
      const req = TestHelper.createRequest(`/account/organizations/delete-invitation?invitationid=${owner.invitation.invitationid}`)
      req.puppeteer = false
      req.account = owner.account
      req.session = owner.session
      req.body = {
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
