const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    let organization = await dashboard.StorageCache.get(req.query.organizationid)
    if (!organization) {
      const organizationInfo = await organizations.Storage.Organization.findOne({
        where: {
          organizationid: req.query.organizationid
        }
      })
      if (!organizationInfo) {
        throw new Error('invalid-organizationid')
      }
      organization = {}
      for (const field of organizationInfo._options.attributes) {
        organization[field] = organizationInfo.get(field)
      }
      await dashboard.StorageCache.set(req.query.organizationid, organization)
    }
    if (organization.ownerid !== req.account.accountid) {
      let membership = await dashboard.StorageCache.get(`membership_${req.account.accountid}_${req.query.membershipid}`)
      if (!membership) {
        const membershipInfo = await organizations.Storage.Membership.findOne({
          where: {
            organizationid: req.query.organizationid,
            accountid: req.account.accountid
          }
        })
        if (!membershipInfo) {
          throw new Error('invalid-account')
        }
        membership = {}
        for (const field of membershipInfo._options.attributes) {
          membership[field] = membershipInfo.get(field)
        }
        await dashboard.StorageCache.get(`membership_${req.account.accountid}_${req.query.membershipid}`, membership)
      }
    }
    return organization
  }
}
