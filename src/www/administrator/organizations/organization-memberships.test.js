/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')
const DashboardTestHelper = require('@layeredapps/dashboard/test-helper.js')
const ScreenshotData = require('../../../../screenshot-data.js')

describe('/administrator/organizations/organization-memberships', function () {
  const cachedResponses = {}
  const cachedMemberships = []
  before(async () => {
    await DashboardTestHelper.setupBeforeEach()
    await TestHelper.setupBeforeEach()
    const administrator = await TestHelper.createOwner()
    const user = await TestHelper.createUser()
    global.userProfileFields = ['display-email', 'display-name']
    await TestHelper.createProfile(user, {
      'display-name': user.profile.fullName,
      'display-email': user.profile.contactEmail
    })
    await TestHelper.createOrganization(user, {
      email: user.profile.displayEmail,
      name: 'My organization',
      profileid: user.profile.profileid,
      pin: '12345'
    })
    cachedMemberships.unshift(user.membership.membershipid)
    global.pageSize = 2
    for (let i = 0, len = global.pageSize + 2; i < len; i++) {
      const member = await TestHelper.createUser()
      global.userProfileFields = ['display-name', 'display-email']
      await TestHelper.createProfile(member, {
        'display-name': member.profile.fullName,
        'display-email': member.profile.contactEmail
      })
      await TestHelper.createInvitation(user)
      await TestHelper.acceptInvitation(member, user)
      cachedMemberships.unshift(member.membership.membershipid)
    }
    const req1 = TestHelper.createRequest(`/administrator/organizations/organization-memberships?organizationid=${user.organization.organizationid}`)
    req1.account = administrator.account
    req1.session = administrator.session
    req1.filename = __filename
    req1.screenshots = [
      { hover: '#administrator-menu-container' },
      { click: '/administrator/organizations' },
      { click: '/administrator/organizations/organizations' },
      { click: `/administrator/organizations/organization?organizationid=${user.organization.organizationid}` },
      { click: `/administrator/organizations/organization-memberships?organizationid=${user.organization.organizationid}` }
    ]
    await req1.route.api.before(req1)
    cachedResponses.before = req1.data
    global.pageSize = 50
    global.packageJSON.dashboard.server.push(ScreenshotData.administratorIndex)
    global.packageJSON.dashboard.server.push(ScreenshotData.administratorOrganizations)
    cachedResponses.returns = await req1.get()
    global.pageSize = 3
    delete (req1.screenshots)
    cachedResponses.pageSize = await req1.get()
    const req2 = TestHelper.createRequest(`/administrator/organizations/organization-memberships?organizationid=${user.organization.organizationid}&offset=1`)
    req2.account = administrator.account
    req2.session = administrator.session
    cachedResponses.offset = await req2.get()
  })
  describe('before', () => {
    it('should bind data to req', async () => {
      const data = cachedResponses.before
      assert.strictEqual(data.memberships.length, global.pageSize)
      assert.strictEqual(data.memberships[0].membershipid, cachedMemberships[0])
      assert.strictEqual(data.memberships[1].membershipid, cachedMemberships[1])
    })
  })

  describe('view', () => {
    it('should return one page (screenshots)', async () => {
      global.pageSize = 3
      const result = cachedResponses.returns
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('memberships-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 3)
    })

    it('should change page size', async () => {
      global.pageSize = 3
      const result = cachedResponses.pageSize
      const doc = TestHelper.extractDoc(result.html)
      const table = doc.getElementById('memberships-table')
      const rows = table.getElementsByTagName('tr')
      assert.strictEqual(rows.length, global.pageSize + 1)
    })

    it('should change offset', async () => {
      const offset = 1
      const result = cachedResponses.offset
      const doc = TestHelper.extractDoc(result.html)
      for (let i = 0, len = global.pageSize; i < len; i++) {
        assert.strictEqual(doc.getElementById(cachedMemberships[offset + i]).tag, 'tr')
      }
    })
  })
})
