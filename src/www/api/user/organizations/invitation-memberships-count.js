const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invitationid) {
      throw new Error('invalid-invitationid')
    }
    const invitation = await global.api.user.organizations.Invitation.get(req)
    if (!invitation) {
      throw new Error('invalid-invitationid')
    }
    req.query.organizationid = invitation.organizationid
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-invitationid')
    }
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    return organizations.Storage.Membership.count({
      where: {
        invitationid: req.query.invitationid
      }
    })
  }
}
