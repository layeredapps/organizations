const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    let where
    if (req.query.organizationid) {
      const organization = await global.api.user.organizations.Organization.get(req)
      if (!organization) {
        throw new Error('invalid-organizationid')
      }
      if (organization.ownerid !== req.account.accountid) {
        throw new Error('invalid-account')
      }
      where = {
        organizationid: req.query.organizationid
      }
    } else {
      where = {
        accountid: req.query.accountid
      }
    }
    return organizations.Storage.Invitation.count({ where })
  }
}
