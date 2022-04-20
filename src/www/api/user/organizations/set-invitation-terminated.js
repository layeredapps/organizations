const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.invitationid) {
      throw new Error('invalid-invitationid')
    }
    const invitation = await global.api.user.organizations.Invitation.get(req)
    if (!invitation) {
      throw new Error('invalid-invitationid')
    }
    if (!invitation.multi || invitation.terminatedAt) {
      throw new Error('invalid-invitation')
    }
    req.query.organizationid = invitation.organizationid
    const organization = await global.api.user.organizations.Organization.get(req)
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    await organizations.Storage.Invitation.update({
      terminatedAt: new Date()
    }, {
      where: {
        invitationid: req.query.invitationid
      }
    })
    await dashboard.StorageCache.remove(req.query.invitationid)
    await dashboard.StorageCache.remove(invitation.secretCode)
    return global.api.user.organizations.Invitation.get(req)
  }
}
