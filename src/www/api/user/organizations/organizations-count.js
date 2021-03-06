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
    return organizations.Storage.Organization.count({
      where: {
        ownerid: req.query.accountid,
        appid: req.appid || global.appid
      }
    })
  }
}
