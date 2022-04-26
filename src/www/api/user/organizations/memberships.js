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
      const membership = await global.api.user.organizations.OrganizationMembership.get(req)
      if (!membership) {
        throw new Error('invalid-organizationid')
      }
      where.organizationid = req.query.organizationid
    } else {
      where.accountid = req.query.accountid
    }
    let membershipids
    if (req.query.all) {
      membershipids = await organizations.Storage.Membership.findAll({
        where,
        attributes: ['membershipid'],
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      membershipids = await organizations.Storage.Membership.findAll({
        where,
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
      const membership = await global.api.user.organizations.Membership.get(req)
      items.push(membership)
    }
    return items
  }
}
