const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invitationid) {
      throw new Error('invalid-invitationid')
    }
    let invitation = await dashboard.StorageCache.get(req.query.invitationid)
    if (!invitation) {
      const invitationInfo = await organizations.Storage.Invitation.findOne({
        where: {
          invitationid: req.query.invitationid
        }
      })
      if (!invitationInfo) {
        throw new Error('invalid-invitationid')
      }
      invitation = {}
      for (const field of invitationInfo._options.attributes) {
        invitation[field] = invitationInfo.get(field)
      }
      await dashboard.StorageCache.set(req.query.invitationid, invitation)
    }
    if (invitation.acceptedAt) {
      throw new Error('invalid-invitation')
    }
    delete (invitation.secretCodeHash)
    return invitation
  }
}
