const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.invitationid) {
      throw new Error('invalid-invitationid')
    }
    if (!req.body) {
      throw new Error('invalid-secret-code')
    }
    req.body['secret-code'] = req.body['secret-code'].trim ? req.body['secret-code'].trim() : req.body['secret-code']
    if (!req.body['secret-code'] || !req.body['secret-code'].length) {
      throw new Error('invalid-secret-code')
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
    const secretCodeHash = await dashboard.Hash.sha512Hash(req.body['secret-code'], req.alternativesha512, req.alternativeDashboardEncryptionKey)
    if (invitation.secretCodeHash !== secretCodeHash) {
      throw new Error('invalid-secret-code')
    }
    req.query.organizationid = invitation.organizationid
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
      if (field === 'full-name') {
        if (!profile.firstName || !profile.lastName) {
          throw new Error('invalid-profile')
        }
        continue
      }
      const displayName = global.profileFieldMap[field]
      if (!profile[displayName]) {
        throw new Error('invalid-profile')
      }
    }
    let membership
    try {
      membership = await global.api.user.organizations.OrganizationMembership.get(req)
    } catch (error) {
    }
    if (membership) {
      throw new Error('invalid-account')
    }
    await organizations.Storage.Invitation.update({
      acceptedAt: new Date()
    }, {
      where: {
        invitationid: req.query.invitationid
      }
    })
    await dashboard.StorageCache.remove(req.query.invitationid)
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
