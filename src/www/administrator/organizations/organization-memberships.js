
const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    req.error = 'invalid-organizationid'
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
  const total = await global.api.administrator.organizations.MembershipsCount.get(req)
  const memberships = await global.api.administrator.organizations.Memberships.get(req)
  if (memberships && memberships.length) {
    for (const membership of memberships) {
      membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { organization, memberships, total, offset }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.organization, 'organization')
  const removeElements = []
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      removeElements.push('memberships-table')
    }
  } else {
    if (req.data.memberships && req.data.memberships.length) {
      const removeElements = []
      const retainedFields = req.membershipProfileFields || global.membershipProfileFields
      for (const membership of req.data.memberships) {
        for (const field of global.profileFields) {
          if (retainedFields.indexOf(field) > -1) {
            continue
          }
          removeElements.push(`${field}-${membership.membershipid}`)
        }
      }
      dashboard.HTML.renderTable(doc, req.data.memberships, 'membership-row', 'memberships-table')
      if (req.data.total <= global.pageSize) {
        removeElements.push('page-links')
      } else {
        dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
      }
      removeElements.push('no-memberships')
    } else {
      removeElements.push('memberships-table')
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    if (element) {
      element.parentNode.removeChild(element)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
