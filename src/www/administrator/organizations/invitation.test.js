/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const ScreenshotData = require('../../../../screenshot-data.js')

describe('/administrator/organizations/invitation', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const administrator = await TestHelper.createOwner()
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
      const req = TestHelper.createRequest(`/administrator/organizations/invitation?invitationid=${owner.invitation.invitationid}`)
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.invitation.invitationid, owner.invitation.invitationid)
    })
  })

  describe('view', () => {
    it('should have row for invitation (screenshots)', async () => {
      const administrator = await TestHelper.createOwner()
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
      const req = TestHelper.createRequest(`/administrator/organizations/invitation?invitationid=${owner.invitation.invitationid}`)
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/organizations' },
        { click: '/administrator/organizations/invitations' },
        { click: `/administrator/organizations/invitation?invitationid=${owner.invitation.invitationid}` }
      ]
      global.pageSize = 50
      global.packageJSON.dashboard.server.push(ScreenshotData.administratorIndex)
      global.packageJSON.dashboard.server.push(ScreenshotData.administratorInvitations)
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const tbody = doc.getElementById(owner.invitation.invitationid)
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })
})
