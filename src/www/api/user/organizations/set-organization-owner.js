const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    const organization = await global.api.user.organizations.Organization.get(req)
    if (!organization) {
      throw new Error('invalid-organizationid')
    }
    if (organization.ownerid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    if (!req.body || !req.body.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.body.accountid === req.account.accountid) {
      throw new Error('invalid-account')
    }
    req.query.accountid = req.body.accountid
    const targetAccount = await global.api.administrator.Account.get(req)
    if (!targetAccount) {
      throw new Error('invalid-account')
    }
    let membership
    const account = req.account
    try {
      req.account = { accountid: req.body.accountid }
      membership = await global.api.user.organizations.OrganizationMembership.get(req)
    } catch (error) {
    }
    req.account = account
    if (!membership) {
      throw new Error('invalid-account')
    }
    const query = req.query
    req.query.accountid = req.body.accountid
    const newOwner = await global.api.administrator.Account.get(req)
    req.query = query
    if (!newOwner || newOwner.deleted) {
      throw new Error('invalid-account')
    }
    await organizations.Storage.Organization.update({
      ownerid: req.body.accountid
    }, {
      where: {
        organizationid: req.query.organizationid,
        appid: req.appid || global.appid
      }
    })
    organization.ownerid = req.body.accountid
    await dashboard.StorageCache.remove(req.query.organizationid)
    return global.api.user.organizations.Organization.get(req)
  }
}
