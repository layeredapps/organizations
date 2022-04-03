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
    let invitationids
    if (req.query.all) {
      invitationids = await organizations.Storage.Invitation.findAll({
        where,
        attributes: ['invitationid'],
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      invitationids = await organizations.Storage.Invitation.findAll({
        where,
        attributes: ['invitationid'],
        order: [
          ['createdAt', 'DESC']
        ],
        offset,
        limit
      })
    }
    if (!invitationids || !invitationids.length) {
      return null
    }
    const items = []
    for (const invitationInfo of invitationids) {
      req.query.invitationid = invitationInfo.dataValues.invitationid
      const invitation = await global.api.administrator.organizations.Invitation.get(req)
      items.push(invitation)
    }
    return items
  }
}
