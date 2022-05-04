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
  let organization
  try {
    organization = await global.api.user.organizations.Organization.get(req)
  } catch (error) {
    req.removeContents = true
    req.data = {
      organization: {
        organizationid: ''
      }
    }
    if (error.message === 'invalid-account' || error.message === 'invalid-organizationid') {
      req.error = error.message
    } else {
      req.error = 'unknown-error'
    }
    return
  }
  if (organization.ownerid !== req.account.accountid) {
    req.error = 'invalid-account'
    req.removeContents = true
    req.data = { organization }
    return
  }
  req.query.accountid = req.account.accountid
  const total = await global.api.user.organizations.MembershipsCount.get(req)
  const memberships = await global.api.user.organizations.Memberships.get(req)
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
      removeElements.push('submit-form')
    }
  } else {
    if (req.data.memberships && req.data.memberships.length) {
      const retainedFields = req.membershipProfileFields || global.membershipProfileFields
      for (const membership of req.data.memberships) {
        for (const field of global.profileFields) {
          if (retainedFields.indexOf(field) > -1) {
            continue
          }
          if (field === 'full-name') {
            if (retainedFields.indexOf('first-name') === -1) {
              removeElements.push(`first-name-${membership.membershipid}`)
            }
            if (retainedFields.indexOf('last-name') === -1) {
              removeElements.push(`last-name-${membership.membershipid}`)
            }
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
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
