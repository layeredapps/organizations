const dashboard = require('@layeredapps/dashboard')
const navbar = require('./navbar-membership.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.membershipid) {
    req.error = 'invalid-membershipid'
    req.removeContents = true
    req.data = {
      membership: {
        membershipid: ''
      },
      organization: {
        organizationid: ''
      }
    }
    return
  }
  if (req.query.message === 'success') {
    req.removeContents = true
    req.data = {
      membership: {
        membershipid: req.query.membershipid
      },
      organization: {
        organizationid: req.query.organizationid
      }
    }
    return
  }
  let membership
  try {
    membership = await global.api.user.organizations.Membership.get(req)
  } catch (error) {
    req.removeContents = true
    if (error.message === 'invalid-membershipid' || error.message === 'invalid-account') {
      req.error = error.message
    } else {
      req.error = 'unknown-error'
    }
    req.data = {
      membership: {
        membershipid: '',
        organizationid: req.query.organizationid
      },
      organization: {
        organizationid: ''
      }
    }
    return
  }
  req.query.organizationid = membership.organizationid
  let organization
  try {
    organization = await global.api.user.organizations.Organization.get(req)
  } catch (error) {
    req.removeContents = true
    req.data = {
      membership: {
        membershipid: '',
        organizationid: req.query.organizationid
      },
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
    return
  }
  membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
  req.data = { organization, membership }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.membership, 'membership')
  await navbar.setup(doc, req.data.organization, req.account)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.organizations.DeleteMembership.delete(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?membershipid=${req.query.membershipid}&organizationid=${req.query.organizationid}&message=success`
    })
    return res.end()
  }
}
