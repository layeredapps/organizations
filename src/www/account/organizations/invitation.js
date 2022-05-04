const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invitationid) {
    req.error = 'invalid-invitationid'
    req.removeContents = true
    req.data = {
      invitation: {
        invitationid: ''
      }
    }
    return
  }
  const invitation = await global.api.user.organizations.Invitation.get(req)
  if (!invitation) {
    req.error = 'invalid-invitationid'
    return
  }
  req.query.organizationid = invitation.organizationid
  const organization = await global.api.user.organizations.Organization.get(req)
  if (organization.ownerid !== req.account.accountid) {
    req.error = 'invalid-account'
    return
  }
  invitation.organizationPIN = organization.pin
  req.data = { invitation }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.invitation, 'invitation')
  const removeElements = []
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      removeElements.push('submit-form')
    }
  } else {
    if (req.data.invitation.multi) {
      removeElements.push('single-use', 'accepted-row')
      if (req.data.invitation.terminatedAt) {
        removeElements.push('not-terminated')
      } else {
        removeElements.push('terminated')
      }
    } else {
      removeElements.push('multi-use', 'terminated-row')
      if (req.data.invitation.acceptedAt) {
        removeElements.push('not-accepted')
      } else {
        removeElements.push('accepted')
      }
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
