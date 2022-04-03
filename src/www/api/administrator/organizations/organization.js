const dashboard = require('@layeredapps/dashboard')
const organizations = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    let organization = await dashboard.StorageCache.get(req.query.organizationid)
    if (!organization) {
      const organizationInfo = await organizations.Storage.Organization.findOne({
        where: {
          organizationid: req.query.organizationid
        }
      })
      if (!organizationInfo) {
        throw new Error('invalid-organizationid')
      }
      organization = {}
      for (const field of organizationInfo._options.attributes) {
        organization[field] = organizationInfo.get(field)
      }
      await dashboard.StorageCache.set(req.query.organizationid, organization)
    }
    return organization
  }
}
