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
    if (!req.body.pin || !req.body.pin.length) {
      throw new Error('invalid-pin')
    }
    if (req.body.pin.match(/^[a-z0-9]+$/i) === null) {
      throw new Error('invalid-pin')
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
      const displayName = global.profileFieldMap[field]
      if (!profile[displayName]) {
        throw new Error('invalid-profile')
      }
    }
    if (global.minimumOrganizationNameLength > req.body.name.length ||
      global.maximumOrganizationNameLength < req.body.name.length) {
      throw new Error('invalid-organization-name-length')
    }
    if (global.minimumOrganizationPINLength > req.body.pin.length ||
      global.maximumOrganizationPINLength < req.body.pin.length) {
      throw new Error('invalid-pin-length')
    }
    if (!req.body.email || !req.body.email.length || req.body.email.indexOf('@') < 1) {
      throw new Error('invalid-organization-email')
    }
    const organizationInfo = {
      appid: req.appid || global.appid,
      ownerid: req.query.accountid,
      name: req.body.name,
      pin: req.body.pin,
      email: req.body.email
    }
    try {
      const organization = await organizations.Storage.Organization.create(organizationInfo)
      const membershipInfo = {
        appid: req.appid || global.appid,
        organizationid: organization.dataValues.organizationid,
        accountid: req.query.accountid,
        profileid: req.body.profileid
      }
      await organizations.Storage.Membership.create(membershipInfo)
      req.query.organizationid = organization.dataValues.organizationid
      return global.api.user.organizations.Organization.get(req)
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('duplicate-pin')
      }
      throw new Error('unknown-error')
    }
  }
}
