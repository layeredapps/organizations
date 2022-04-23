const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invitationid) {
    throw new Error('invalid-invitationid')
  }
  const invitation = await global.api.user.organizations.Invitation.get(req)
  if (!invitation) {
    throw new Error('invalid-invitationid')
  }
  req.query.organizationid = invitation.organizationid
  const organization = await global.api.user.organizations.Organization.get(req)
  if (organization.ownerid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  invitation.organizationPIN = organization.pin
  req.data = { invitation }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.invitation, 'invitation')
  const removeElements = []
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
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
