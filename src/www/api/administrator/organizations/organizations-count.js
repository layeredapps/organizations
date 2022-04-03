const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    let where
    if (req.query) {
      if (req.query.accountid) {
        where = {
          accountid: req.query.accountid
        }
      }
    }
    return organizations.Storage.Organization.count({ where })
  }
}
