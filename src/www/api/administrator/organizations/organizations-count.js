const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    const where = {
      appid: req.appid || global.appid
    }
    if (req.query) {
      if (req.query.accountid) {
        where.accountid = req.query.accountid
      }
    }
    return organizations.Storage.Organization.count({
      where
    })
  }
}
