const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.membershipid) {
      throw new Error('invalid-membershipid')
    }
    let membership = await dashboard.StorageCache.get(req.query.membershipid)
    if (!membership) {
      const membershipInfo = await organizations.Storage.Membership.findOne({
        where: {
          membershipid: req.query.membershipid
        }
      })
      if (!membershipInfo) {
        throw new Error('invalid-membershipid')
      }
      membership = {}
      for (const field of membershipInfo._options.attributes) {
        membership[field] = membershipInfo.get(field)
      }
      await dashboard.StorageCache.set(req.query.membershipid, membership)
    }
    if (membership.accountid !== req.account.accountid) {
      req.query.organizationid = membership.organizationid
      const organization = await global.api.user.organizations.Organization.get(req)
      if (!organization) {
        throw new Error('invalid-membershipid')
      }
      if (organization.ownerid !== req.account.accountid) {
        req.query.organizationid = organization.organizationid
        const membership = await global.api.user.organizations.OrganizationMembership.get(req)
        if (!membership) {
          throw new Error('invalid-account')
        }
      }
    }
    req.query.profileid = membership.profileid
    const profile = await global.api.administrator.Profile.get(req)
    const requireProfileFields = global.membershipProfileFields
    for (const field of requireProfileFields) {
      if (field === 'full-name') {
        membership.firstName = profile.firstName
        membership.lastName = profile.lastName
      } else {
        const displayName = global.profileFieldMap[field]
        membership[displayName] = profile[displayName]
      }
    }
    return membership
  }
}
