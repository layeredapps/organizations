const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
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
    let membershipids
    if (req.query.all) {
      membershipids = await organizations.Storage.Membership.findAll({
        where: {
          invitationid: req.query.invitationid,
          appid: req.appid || global.appid
        },
        attributes: ['membershipid'],
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      membershipids = await organizations.Storage.Membership.findAll({
        where: {
          invitationid: req.query.invitationid,
          appid: req.appid || global.appid
        },
        attributes: ['membershipid'],
        offset,
        limit,
        order: [
          ['createdAt', 'DESC']
        ]
      })
    }
    if (!membershipids || !membershipids.length) {
      return null
    }
    const items = []
    for (const membershipInfo of membershipids) {
      req.query.membershipid = membershipInfo.dataValues.membershipid
      const membership = await global.api.user.organizations.OrganizationMembership.get(req)
      items.push(membership)
    }
    return items
  }
}
