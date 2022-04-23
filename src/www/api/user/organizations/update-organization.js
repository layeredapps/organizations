const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  patch: async (req) => {
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
    if (!req.body || !req.body.name || !req.body.name.length) {
      throw new Error('invalid-organization-name')
    }
    if (global.minimumOrganizationNameLength > req.body.name.length ||
      global.maximumOrganizationNameLength < req.body.name.length) {
      throw new Error('invalid-organization-name-length')
    }
    if (!req.body.email || !req.body.email.length || req.body.email.indexOf('@') < 1) {
      throw new Error('invalid-organization-email')
    }
    if (!req.body.pin || !req.body.pin.length) {
      throw new Error('invalid-pin')
    }
    if (req.body.pin.match(/^[a-z0-9]+$/i) === null) {
      throw new Error('invalid-pin')
    }
    if (global.minimumOrganizationPINLength > req.body.pin.length ||
      global.maximumOrganizationPINLength < req.body.pin.length) {
      throw new Error('invalid-pin-length')
    }
    if (req.body.pin !== organization.pin) {
      const existing = await organizations.Storage.Organization.findOne({
        where: {
          pin: req.body.pin
        }
      })
      if (existing && existing.dataValues && existing.dataValues.organizationid) {
        throw new Error('duplicate-pin')
      }
    }
    try {
      await organizations.Storage.Organization.update({
        name: req.body.name,
        email: req.body.email,
        pin: req.body.pin
      }, {
        where: {
          organizationid: req.query.organizationid
        }
      })
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('duplicate-pin')
      }
      throw new Error('unknown-error')
    }
    await dashboard.StorageCache.remove(req.query.organizationid)
    return global.api.user.organizations.Organization.get(req)
    
  }
}
