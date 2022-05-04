const crypto = require('crypto')
const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
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
    req.data = {
      organization: {
        organizationid: ''
      }
    }
    return
  }
  if (organization.ownerid !== req.account.accountid) {
    req.error = 'invalid-account'
    req.removeContents = true
    req.data = {
      organization: {
        organizationid: ''
      }
    }
    return
  }
  if (req.query.message === 'success') {
    req.removeContents = true
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
    dashboard.HTML.renderTemplate(doc, req.data.organization, messageTemplate, 'message-container')
    if (req.removeContents) {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const note = {
    object: 'note',
    min: global.minimumInvitationCodeLength,
    max: global.maximumInvitationCodeLength
  }
  dashboard.HTML.renderTemplate(doc, note, 'alphanumeric-note', 'note-container')
  doc.getElementById('organization-pin').setAttribute('value', req.data.organization.pin)
  doc.getElementById('secret-code').setAttribute('value', crypto.randomBytes(Math.ceil(global.minimumInvitationCodeLength / 2)).toString('hex'))
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
  if (global.minimumInvitationCodeLength > req.body['secret-code'].length || global.maximumInvitationCodeLength < req.body['secret-code'].length) {
    return renderPage(req, res, 'invalid-secret-code-length')
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
