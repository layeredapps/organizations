const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    throw new Error('invalid-organizationid')
  }
  const organization = await global.api.administrator.organizations.Organization.get(req)
  if (!organization) {
    throw new Error('invalid-organization')
  }
  if (organization.ownerid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  req.data = { organization }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.organization, 'organization')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }

  const note = {
    object: 'note',
    min: global.minimumOrganizationPINLength,
    max: global.maximumOrganizationPINLength
  }
  dashboard.HTML.renderTemplate(doc, note, 'alphanumeric-note', 'note-container')
  const nameField = doc.getElementById('name')
  const emailField = doc.getElementById('email')
  const pinField = doc.getElementById('pin')
  if (req.method === 'POST') {
    nameField.setAttribute('value', dashboard.Format.replaceQuotes(req.body.name || ''))
    emailField.setAttribute('value', dashboard.Format.replaceQuotes(req.body.email || ''))
    pinField.setAttribute('value', req.data.pin || '')
  } else {
    nameField.setAttribute('value', req.data.organization.name)
    pinField.setAttribute('value', req.data.organization.pin)
    emailField.setAttribute('value', req.data.organization.email)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  req.body.name = req.body.name && req.body.name.trim ? req.body.name.trim() : req.body.name
  if (!req.body.name || !req.body.name.length) {
    return renderPage(req, res, 'invalid-organization-name')
  }
  if (global.minimumOrganizationNameLength > req.body.name.length ||
    global.maximumOrganizationNameLength < req.body.name.length) {
    return renderPage(req, res, 'invalid-organization-name-length')
  }
  req.body.pin = req.body.pin.trim ? req.body.pin.trim() : req.body.pin
  if (req.body.pin.match(/^[a-z0-9]+$/i) === null) {
    return renderPage(req, res, 'invalid-pin')
  }
  if (global.minimumOrganizationPINLength > req.body.pin.length ||
    global.maximumOrganizationPINLength < req.body.pin.length) {
    return renderPage(req, res, 'invalid-pin-length')
  }
  req.body.email = req.body.email && req.body.email.trim ? req.body.email.trim() : req.body.email
  if (!req.body.email || !req.body.email.length) {
    return renderPage(req, res, 'invalid-organization-email')
  }
  try {
    await global.api.user.organizations.UpdateOrganization.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?organizationid=${req.query.organizationid}&message=success`
    })
    return res.end()
  }
}
