const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.membershipid) {
      throw new Error('invalid-membershipid')
    }
    const membership = await global.api.administrator.organizations.Membership.get(req)
    if (!membership) {
      throw new Error('invalid-membershipid')
    }
    req.query.organizationid = membership.organizationid
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (membership.accountid !== req.account.accountid && organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    await organizations.Storage.Membership.destroy({
      where: {
        membershipid: req.query.membershipid
      }
    })
    await dashboard.StorageCache.remove(req.query.membershipid)
    return true
  }
}
