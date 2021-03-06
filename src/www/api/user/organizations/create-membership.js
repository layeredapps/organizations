const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.body) {
      throw new Error('invalid-secret-code')
    }
    if (!req.body['secret-code'] || !req.body['secret-code'].length) {
      throw new Error('invalid-secret-code')
    }
    if (!req.body['organization-pin'] || !req.body['organization-pin'].length) {
      throw new Error('invalid-organization-pin')
    }
    req.query = req.query || {}
    req.query['secret-code'] = req.body['secret-code']
    req.query['organization-pin'] = req.body['organization-pin']
    const invitation = await global.api.user.organizations.SecretInvitation.get(req)
    req.query.invitationid = invitation.invitationid
    const organization = await global.api.user.organizations.OpenInvitationOrganization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (req.account.accountid === organization.ownerid) {
      throw new Error('invalid-account')
    }
    if (!req.body.profileid || !req.body.profileid.length) {
      throw new Error('invalid-profileid')
    }
    req.query.profileid = req.body.profileid
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    const requireProfileFields = global.membershipProfileFields
    for (const field of requireProfileFields) {
      const displayName = global.profileFieldMap[field]
      if (!profile[displayName]) {
        throw new Error('invalid-profile')
      }
    }
    req.query.organizationid = organization.organizationid
    let membership
    try {
      membership = await global.api.user.organizations.OrganizationMembership.get(req)
    } catch (error) {
    }
    if (membership) {
      throw new Error('invalid-account')
    }
    if (!invitation.multi) {
      await organizations.Storage.Invitation.update({
        acceptedAt: new Date()
      }, {
        where: {
          invitationid: req.query.invitationid,
          appid: req.appid || global.appid
        }
      })
      await dashboard.StorageCache.remove(`invitation_by_secret_${invitation.secretCode}`)
      await dashboard.StorageCache.remove(req.query.invitationid)
    }
    const membershipInfo = {
      appid: req.appid || global.appid,
      organizationid: invitation.organizationid,
      accountid: req.account.accountid,
      invitationid: req.query.invitationid,
      profileid: req.body.profileid
    }
    const newMembership = await organizations.Storage.Membership.create(membershipInfo)
    req.query.membershipid = newMembership.dataValues.membershipid
    return global.api.user.organizations.Membership.get(req)
  }
}
