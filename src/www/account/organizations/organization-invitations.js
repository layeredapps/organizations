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
    organization = {
      organizationid: ''
    }
    if (error.message === 'invalid-account' || error.message === 'invalid-organizationid' || error.message === 'invalid-account') {
      req.error = error.message
    } else {
      req.error = 'unknown-error'
    }
    return
  }
  if (!req.error && organization.ownerid !== req.account.accountid) {
    req.error = 'invalid-account'
    req.removeContents = true
    req.data = { organization }
    return
  }
  req.query.accountid = req.account.accountid
  const total = await global.api.user.organizations.InvitationsCount.get(req)
  const invitations = await global.api.user.organizations.Invitations.get(req)
  if (invitations && invitations.length) {
    for (const invitation of invitations) {
      invitation.organizationPIN = organization.pin
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { organization, invitations, total, offset }
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
    if (req.data.invitations && req.data.invitations.length) {
      dashboard.HTML.renderTable(doc, req.data.invitations, 'invitation-row', 'invitations-table')
      for (const invitation of req.data.invitations) {
        if (invitation.multi) {
          removeElements.push(`single-${invitation.invitationid}`, `accepted-${invitation.invitationid}`)
          if (invitation.terminated) {
            removeElements.push(`open-${invitation.invitationid}`)
          } else {
            removeElements.push(`terminated-${invitation.invitationid}`)
          }
        } else {
          removeElements.push(`multi-${invitation.invitationid}`, `terminated-${invitation.invitationid}`)
          if (invitation.acceptedAt) {
            removeElements.push(`open-${invitation.invitationid}`)
          } else {
            removeElements.push(`accepted-${invitation.invitationid}`)
          }
        }
      }
      if (req.data.total <= global.pageSize) {
        removeElements.push('page-links')
      } else {
        dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
      }
      removeElements.push('no-invitations')
    } else {
      removeElements.push('invitations-table')
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
