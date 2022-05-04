const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    req.error = 'invalid-organization'
    req.removeContents = true
    req.data = {
      organization: {
        organizationid: ''
      }
    }
    return
  }
  const organization = await global.api.administrator.organizations.Organization.get(req)
  if (!organization) {
    req.error = 'invalid-organization'
    return
  }
  organization.createdAtFormatted = dashboard.Format.date(organization.createdAt)
  req.data = { organization }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.organization, 'organization')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      const organizationsTable = doc.getElementById('organizations-table')
      organizationsTable.parentNode.removeChild(organizationsTable)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
