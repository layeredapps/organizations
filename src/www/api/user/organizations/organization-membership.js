const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    let membership = await dashboard.StorageCache.get(`membership_${req.account.accountid}_${req.query.organizationid}`)
    if (!membership) {
      const membershipInfo = await organizations.Storage.Membership.findOne({
        where: {
          organizationid: req.query.organizationid,
          accountid: req.account.accountid,
          appid: req.appid || global.appid
        }
      })
      if (!membershipInfo) {
        throw new Error('invalid-membershipid')
      }
      membership = {}
      for (const field of membershipInfo._options.attributes) {
        membership[field] = membershipInfo.get(field)
      }
      await dashboard.StorageCache.set(`membership_${req.account.accountid}_${req.query.organizationid}`, membership)
    }
    return membership
  }
}
