const organizations = require('../../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    if (!req.body || !req.body['secret-code']) {
      throw new Error('invalid-secret-code')
    }
    if (req.body['secret-code'].match(/^[a-z0-9]+$/i) === null) {
      throw new Error('invalid-secret-code')
    }
    if (global.minimumInvitationCodeLength > req.body['secret-code'].length ||
      global.maximumInvitationCodeLength < req.body['secret-code'].length) {
      throw new Error('invalid-secret-code-length')
    }
    if (req.body.lifespan !== 'single' && req.body.lifespan !== 'multi') {
      throw new Error('invalid-lifespan')
    }
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    const secretCode = req.body['secret-code']
    const invitationInfo = {
      appid: req.appid || global.appid,
      accountid: req.account.accountid,
      organizationid: req.query.organizationid,
      secretCode,
      multi: req.body.lifespan === 'multi'
    }
    const existing = await organizations.Storage.Invitation.findOne({
      where: {
        secretCode,
        organizationid: req.query.organizationid,
        appid: req.appid || global.appid
      }
    })
    if (existing && existing.dataValues && existing.dataValues.invitationid) {
      throw new Error('duplicate-secret-code')
    }
    const invitation = await organizations.Storage.Invitation.create(invitationInfo)
    req.query.invitationid = invitation.dataValues.invitationid
    return global.api.user.organizations.Invitation.get(req)
  }
}
