const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    throw new Error('invalid-organization')
  }
  const organization = await global.api.user.organizations.Organization.get(req)
  if (!organization) {
    throw new Error('invalid-organization')
  }
  if (organization.ownerid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  organization.createdAtFormatted = dashboard.Format.date(organization.createdAt)
  if (req.query.message === 'success') {
    organization.invitationid = req.query.invitationid
    organization.dashboardServer = global.dashboardServer
  }
  req.data = { organization }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.organization, 'organization')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, req.data.organization, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  doc.getElementById('secret-code').setAttribute('value', dashboard.UUID.random(16))
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  if (!req.body['secret-code']) {
    return renderPage(req, res, 'invalid-secret-code')
  }
  if (req.body['secret-code'].match(/^[a-z0-9]+$/i) === null) {
    return renderPage(req, res, 'invalid-secret-code')
  }
  let invitation
  try {
    invitation = await global.api.user.organizations.CreateInvitation.post(req)
  } catch (error) {
    return renderPage(req, res, req.error)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?organizationid=${req.query.organizationid}&invitationid=${invitation.invitationid}&message=success`
    })
    return res.end()
  }
}
