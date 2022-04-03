const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    if (!req.body || !req.body['secret-code']) {
      throw new Error('invalid-secret-code')
    }
    if (global.minimumInvitationCodeLength > req.body['secret-code'].length ||
      global.maximumInvitationCodeLength < req.body['secret-code'].length) {
      throw new Error('invalid-secret-code-length')
    }
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    const secretCodeHash = await dashboard.Hash.sha512Hash(req.body['secret-code'], req.alternativesha512, req.alternativeDashboardEncryptionKey)
    const invitationInfo = {
      accountid: req.account.accountid,
      organizationid: req.query.organizationid,
      secretCodeHash
    }
    const invitation = await organizations.Storage.Invitation.create(invitationInfo)
    req.query.invitationid = invitation.dataValues.invitationid
    return global.api.user.organizations.Invitation.get(req)
  }
}
