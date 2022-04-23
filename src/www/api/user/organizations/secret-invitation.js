const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query['secret-code']) {
      throw new Error('invalid-secret-code')
    }
    if (!req.query['organization-pin']) {
      throw new Error('invalid-organization-pin')
    }
    const cacheKey = `org${req.query['organization-pin']}_inv${req.query['secret-code']}`
    let invitation = await dashboard.StorageCache.get(cacheKey)
    if (!invitation) {
      const organizationInfo = await organizations.Storage.Organization.findOne({
        attributes: ['organizationid'],
        where: {
          pin: req.query['organization-pin']
        }
      })
      if (!organizationInfo) {
        throw new Error('invalid-organization-pin')
      }
      const invitationInfo = await organizations.Storage.Invitation.findOne({
        where: {
          secretCode: req.query['secret-code'],
          organizationid:  organizationInfo.dataValues.organizationid
        }
      })
      if (!invitationInfo) {
        throw new Error('invalid-secret-code')
      }
      invitation = {}
      for (const field of invitationInfo._options.attributes) {
        invitation[field] = invitationInfo.get(field)
      }
      await dashboard.StorageCache.set(cacheKey, invitation)
    }
    if (invitation.acceptedAt || invitation.terminatedAt) {
      throw new Error('invalid-invitation')
    }
    return invitation
  }
}
