/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/organizations/invitations-count', () => {
  describe('returns', () => {
    it('integer', async () => {
      const administrator = await TestHelper.createOwner()
      for (let i = 0, len = global.pageSize + 1; i < len; i++) {
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
          pin: `1234${i}`
        })
        await TestHelper.createInvitation(owner)
      }
      const req = TestHelper.createRequest('/api/administrator/organizations/invitations-count')
      req.account = administrator.account
      req.session = administrator.session
      req.filename = __filename
      req.saveResponse = true
      const result = await req.get()
      assert.strictEqual(result, global.pageSize + 1)
    })
  })
})
