const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invitationid) {
    req.error = 'invalid-invitationid'
    req.removeContents = true
    req.data = {
      invitation: {
        invitationid: '',
        organizationid: req.query.organizationid
      }
    }
    return
  }
  if (req.query.message === 'success') {
    req.removeContents = true
    req.data = {
      invitation: {
        invitationid: '',
        organizationid: req.query.organizationid
      }
    }
    return
  }
  let invitation
  try {
    invitation = await global.api.user.organizations.Invitation.get(req)
  } catch (error) {
    req.removeContents = true
    if (error.mesage === 'invalid-invitationid' || error.message === 'invalid-organizationid' || error.message === 'invalid-account') {
      req.error = error.message
    } else {
      req.error = 'unknown-error'
    }
    req.data = {
      invitation: {
        invitationid: '',
        organizationid: req.query.organizationid
      }
    }
    return
  }
  if (invitation.acceptedAt) {
    req.error = 'invalid-invitation'
    return
  }
  req.data = { invitation }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.invitation, 'invitation')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.organizations.DeleteInvitation.delete(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?invitationid=${req.query.invitationid}&organizationid=${req.data.invitation.organizationid}&message=success`
    })
    return res.end()
  }
}
