const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.organizations.MembershipsCount.get(req)
  const memberships = await global.api.user.organizations.Memberships.get(req)
  if (memberships && memberships.length) {
    for (const membership of memberships) {
      membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { memberships, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  const removeElements = []
  if (req.data.memberships && req.data.memberships.length) {
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
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
