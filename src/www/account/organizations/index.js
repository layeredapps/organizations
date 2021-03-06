const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const ownedOrganizations = await global.api.user.organizations.Organizations.get(req)
  if (ownedOrganizations && ownedOrganizations.length) {
    for (const organization of ownedOrganizations) {
      organization.createdAtFormatted = dashboard.Format.date(organization.createdAt)
    }
  }
  delete (req.query.organizationid)
  const memberships = await global.api.user.organizations.Memberships.get(req)
  if (memberships && memberships.length) {
    for (const membership of memberships) {
      membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
      req.query.organizationid = membership.organizationid
      const organization = await global.api.user.organizations.Organization.get(req)
      membership.organizationName = organization.name
      membership.organizationEmail = organization.email
    }
  }
  req.data = { memberships, organizations: ownedOrganizations }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (req.data.memberships && req.data.memberships.length) {
    dashboard.HTML.renderTable(doc, req.data.memberships, 'membership-row', 'memberships-table')
    const noMemberships = doc.getElementById('no-memberships')
    noMemberships.parentNode.removeChild(noMemberships)
  } else {
    const membershipsContainer = doc.getElementById('memberships-container')
    membershipsContainer.parentNode.removeChild(membershipsContainer)
  }
  if (req.data.organizations && req.data.organizations.length) {
    dashboard.HTML.renderTable(doc, req.data.organizations, 'organization-row', 'organizations-table')
    const noOrganizations = doc.getElementById('no-organizations')
    noOrganizations.parentNode.removeChild(noOrganizations)
  } else {
    const organizationsContainer = doc.getElementById('organizations-container')
    organizationsContainer.parentNode.removeChild(organizationsContainer)
  }
  if ((req.data.organizations && req.data.organizations.length) ||
      (req.data.memberships && req.data.memberships.length)) {
    const noData = doc.getElementById('no-data')
    noData.parentNode.removeChild(noData)
  }
  return dashboard.Response.end(req, res, doc)
}
