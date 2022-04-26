const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    const where = {
      appid: req.appid || global.appid
    }
    if (req.query.organizationid) {
      const organization = await global.api.user.organizations.Organization.get(req)
      if (!organization) {
        throw new Error('invalid-organizationid')
      }
      if (organization.ownerid !== req.account.accountid) {
        throw new Error('invalid-account')
      }
      where.organizationid = req.query.organizationid
    } else {
      where.accountid = req.query.accountid
    }
    let invitationids
    if (req.query.all) {
      invitationids = await organizations.Storage.Invitation.findAll({
        where,
        attributes: ['invitationid'],
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      invitationids = await organizations.Storage.Invitation.findAll({
        where,
        attributes: ['invitationid'],
        offset,
        limit,
        order: [
          ['createdAt', 'DESC']
        ]
      })
    }
    if (!invitationids || !invitationids.length) {
      return null
    }
    const items = []
    for (const invitationInfo of invitationids) {
      req.query.invitationid = invitationInfo.dataValues.invitationid
      const invitation = await global.api.user.organizations.Invitation.get(req)
      items.push(invitation)
    }
    return items
  }
}
