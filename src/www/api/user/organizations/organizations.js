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
    let organizationids
    if (req.query.all) {
      organizationids = await organizations.Storage.Membership.findAll({
        where: {
          accountid: req.query.accountid,
          appid: req.appid || global.appid
        },
        attributes: ['organizationid'],
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      organizationids = await organizations.Storage.Membership.findAll({
        where: {
          accountid: req.query.accountid,
          appid: req.appid || global.appid
        },
        attributes: ['organizationid'],
        offset,
        limit,
        order: [
          ['createdAt', 'DESC']
        ]
      })
    }
    if (!organizationids || !organizationids.length) {
      return null
    }
    const items = []
    for (const organizationInfo of organizationids) {
      req.query.organizationid = organizationInfo.dataValues.organizationid
      const organization = await global.api.user.organizations.Organization.get(req)
      items.push(organization)
    }
    return items
  }
}
