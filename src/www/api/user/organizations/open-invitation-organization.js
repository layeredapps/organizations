const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invitationid) {
      throw new Error('invalid-invitationid')
    }
    const invitation = await global.api.user.organizations.OpenInvitation.get(req)
    let organization = await dashboard.StorageCache.get(invitation.organizationid)
    if (!organization) {
      const organizationInfo = await organizations.Storage.Organization.findOne({
        where: {
          organizationid: invitation.organizationid
        }
      })
      if (!organizationInfo) {
        throw new Error('invalid-organizationid')
      }
      organization = {}
      for (const field of organizationInfo._options.attributes) {
        organization[field] = organizationInfo.get(field)
      }
      await dashboard.StorageCache.set(invitation.organizationid, organization)
    }
    return organization
  }
}
