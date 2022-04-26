const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.invitationid) {
      throw new Error('invalid-invitationid')
    }
    const invitation = await global.api.user.organizations.Invitation.get(req)
    if (!invitation) {
      throw new Error('invalid-invitationid')
    }
    if (invitation.acceptedAt) {
      throw new Error('invalid-invitation')
    }
    const memberships = await global.api.user.organizations.InvitationMembershipsCount.get(req)
    if (memberships > 0) {
      throw new Error('invalid-invitation')
    }
    req.query.organizationid = invitation.organizationid
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    await organizations.Storage.Invitation.destroy({
      where: {
        invitationid: req.query.invitationid,
        appid: req.appid || global.appid
      }
    })
    await dashboard.StorageCache.remove(req.query.invitationid)
    return true
  }
}
