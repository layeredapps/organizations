const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.membershipid) {
    req.error = 'invalid-membershipid'
    req.removeContents = true
    req.data = {
      membership: {
        membershipid: ''
      }
    }
    return
  }
  const membership = await global.api.administrator.organizations.Membership.get(req)
  if (!membership) {
    req.error = 'invalid-membershipid'
    return
  }
  req.query.organizationid = membership.organizationid
  const organization = await global.api.administrator.organizations.Organization.get(req)
  if (!organization) {
    req.error = 'invalid-organization'
    return
  }
  if (membership.createdAt) {
    membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
  }
  req.data = { membership }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.membership, 'membership')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      const membershipsTable = doc.getElementById('memberships-table')
      membershipsTable.parentNode.removeChild(membershipsTable)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
