/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const ScreenshotData = require('../../../../screenshot-data.js')

describe('/administrator/organizations/index', () => {
  describe('before', () => {
    it('should bind data to req', async () => {
      const administrator = await TestHelper.createAdministrator()
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
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      global.userProfileFields = ['contact-email', 'full-name']
      const user2 = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(user2, {
        'display-name': user2.profile.firstName,
        'display-email': user2.profile.contactEmail
      })
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user2, owner)
      const req = TestHelper.createRequest('/administrator/organizations')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.strictEqual(req.data.membershipsChartHighlights.total, global.pageSize + 1)
      assert.strictEqual(req.data.organizationsChartHighlights.total, 1)
    })
  })

  describe('view', () => {
    it('should show organizations created chart (screenshots)', async () => {
      const administrator = await TestHelper.createAdministrator()
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
      const req = TestHelper.createRequest('/administrator/organizations')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.screenshots = [
        { hover: '#administrator-menu-container' },
        { click: '/administrator/organizations' }
      ]
      global.pageSize = 50
      global.packageJSON.dashboard.server.push(ScreenshotData.administratorIndex)
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const container = doc.getElementById('organizations-chart-container')
      assert.strictEqual(container.tag, 'div')
    })

    it('should show membership chart', async () => {
      const administrator = await TestHelper.createAdministrator()
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
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      const req = TestHelper.createRequest('/administrator/organizations')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const container = doc.getElementById('memberships-chart-container')
      assert.strictEqual(container.tag, 'div')
    })

    it('should show invitations chart', async () => {
      const administrator = await TestHelper.createAdministrator()
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
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      const req = TestHelper.createRequest('/administrator/organizations')
      req.account = administrator.account
      req.session = administrator.session
      const result = await req.get()
      const doc = TestHelper.extractDoc(result.html)
      const container = doc.getElementById('invitations-chart-container')
      assert.strictEqual(container.tag, 'div')
    })
  })
})
