const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let where
    if (req.query.accountid) {
      where = {
        accountid: req.query.accountid
      }
    } else if (req.query.organizationid) {
      where = {
        organizationid: req.query.organizationid
      }
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
        order: [
          ['createdAt', 'DESC']
        ],
        offset,
        limit
      })
    }
    if (!membershipids || !membershipids.length) {
      return null
    }
    const items = []
    for (const membershipInfo of membershipids) {
      req.query.membershipid = membershipInfo.dataValues.membershipid
      const membership = await global.api.administrator.organizations.Membership.get(req)
      items.push(membership)
    }
    return items
  }
}
