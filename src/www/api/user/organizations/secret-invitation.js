const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query['secret-code']) {
      throw new Error('invalid-secret-code')
    }
    let invitation = await dashboard.StorageCache.get(req.query['secret-code'])
    if (!invitation) {
      const invitationInfo = await organizations.Storage.Invitation.findOne({
        where: {
          secretCode: req.query['secret-code']
        }
      })
      if (!invitationInfo) {
        throw new Error('invalid-secret-code')
      }
      invitation = {}
      for (const field of invitationInfo._options.attributes) {
        invitation[field] = invitationInfo.get(field)
      }
      await dashboard.StorageCache.set(req.query['secret-code'], invitation)
    }
    if (invitation.acceptedAt || invitation.terminatedAt) {
      throw new Error('invalid-invitation')
    }
    return invitation
  }
}