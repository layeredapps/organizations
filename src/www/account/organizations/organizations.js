const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.organizations.OrganizationsCount.get(req)
  const organizations = await global.api.user.organizations.Organizations.get(req)
  if (organizations && organizations.length) {
    for (const organization of organizations) {
      organization.createdAtFormatted = dashboard.Format.date(organization.createdAt)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { organizations, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (req.data.organizations && req.data.organizations.length) {
    dashboard.HTML.renderTable(doc, req.data.organizations, 'organization-row', 'organizations-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noOrganizations = doc.getElementById('no-organizations')
    noOrganizations.parentNode.removeChild(noOrganizations)
  } else {
    const organizationsTable = doc.getElementById('organizations-table')
    organizationsTable.parentNode.removeChild(organizationsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
