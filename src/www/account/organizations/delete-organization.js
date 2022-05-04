const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    req.error = 'invalid-organization'
    req.removeContents = true
    req.data = {
      organization: {
        organizationid: req.query.organizationid
      }
    }
    return
  }
  if (req.query.message === 'success') {
    req.data = {
      organization: {
        organizationid: ''
      }
    }
    req.removeContents = true
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
    req.data = {
      organization: {
        organizationid: ''
      }
    }
    return
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
  }
  const organizationName = doc.getElementById('organizationName')
  organizationName.setAttribute('value', req.data.organization.name)
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.organizations.DeleteOrganization.delete(req)
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
