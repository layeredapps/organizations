const organizations = require('../../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    if (!req.body || !req.body.name || !req.body.name.length) {
      throw new Error('invalid-organization-name')
    }
    if (!req.body.profileid || !req.body.profileid.length) {
      throw new Error('invalid-profileid')
    }
    req.query.profileid = req.body.profileid
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    const requireProfileFields = global.membershipProfileFields
    for (const field of requireProfileFields) {
      if (field === 'full-name') {
        if (!profile.firstName || !profile.lastName) {
          throw new Error('invalid-profile')
        }
        continue
      }
      const displayName = global.profileFieldMap[field]
      if (!profile[displayName]) {
        throw new Error('invalid-profile')
      }
    }
    if (global.minimumOrganizationNameLength > req.body.name.length ||
      global.maximumOrganizationNameLength < req.body.name.length) {
      throw new Error('invalid-organization-name-length')
    }
    if (!req.body.email || !req.body.email.length || req.body.email.indexOf('@') < 1) {
      throw new Error('invalid-organization-email')
    }
    const organizationInfo = {
      ownerid: req.query.accountid,
      name: req.body.name,
      email: req.body.email
    }
    const organization = await organizations.Storage.Organization.create(organizationInfo)
    const membershipInfo = {
      organizationid: organization.dataValues.organizationid,
      accountid: req.query.accountid,
      profileid: req.body.profileid
    }
    await organizations.Storage.Membership.create(membershipInfo)
    req.query.organizationid = organization.dataValues.organizationid
    return global.api.user.organizations.Organization.get(req)
  }
}
