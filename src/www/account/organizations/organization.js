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
    if (error.message === 'invalid-account' || error.message === 'invalid-organizationid') {
      req.error = error.message
    } else {
      req.error = 'unknown-error'
    }
  }
  if (!req.error && organization.ownerid !== req.account.accountid) {
    let membership
    try {
      membership = await global.api.user.organizations.OrganizationMembership.get(req)
    } catch (error) {
    }
    if (!membership) {
      req.error = 'invalid-account'
      return
    }
  }
  if (organization.createdAt) {
    organization.createdAtFormatted = dashboard.Format.date(organization.createdAt)
  }
  req.data = { organization }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.organization, 'organization')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  } else {
    if (req.data.organization.ownerid !== req.account.accountid) {
      const invitationsLink = doc.getElementById(`invitations-link-${req.query.organizationid}`)
      invitationsLink.parentNode.removeChild(invitationsLink)
      const organizationLink = doc.getElementById(`organization-link-${req.query.organizationid}`)
      organizationLink.parentNode.removeChild(organizationLink)
      const deleteOrganizationLink = doc.getElementById(`delete-organization-link-${req.query.organizationid}`)
      deleteOrganizationLink.parentNode.removeChild(deleteOrganizationLink)
    }
  }
  return dashboard.Response.end(req, res, doc)
}
