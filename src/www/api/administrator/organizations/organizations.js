const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let where
    if (req.query.accountid) {
      where = {
        ownerid: req.query.accountid
      }
    }
    let organizationids
    if (req.query.all) {
      organizationids = await organizations.Storage.Organization.findAll({
        where,
        attributes: ['organizationid'],
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      organizationids = await organizations.Storage.Organization.findAll({
        where,
        attributes: ['organizationid'],
        order: [
          ['createdAt', 'DESC']
        ],
        offset,
        limit
      })
    }
    if (!organizationids || !organizationids.length) {
      return null
    }
    const items = []
    for (const organizationInfo of organizationids) {
      req.query.organizationid = organizationInfo.dataValues.organizationid
      const organization = await global.api.administrator.organizations.Organization.get(req)
      items.push(organization)
    }
    return items
  }
}
