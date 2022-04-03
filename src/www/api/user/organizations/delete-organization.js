const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    await organizations.Storage.Organization.destroy({
      where: {
        organizationid: req.query.organizationid
      }
    })
    await dashboard.StorageCache.remove(req.query.organizationid)
    return true
  }
}
