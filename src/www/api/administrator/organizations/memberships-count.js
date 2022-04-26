const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    const where = {
      appid: req.appid || global.appid
    }
    if (req.query) {
      if (req.query.accountid) {
        where.accountid = req.query.accountid
      } else if (req.query.organizationid) {
        where.organizationid = req.query.organizationid
      }
    }
    return organizations.Storage.Membership.count({
      where
    })
  }
}
