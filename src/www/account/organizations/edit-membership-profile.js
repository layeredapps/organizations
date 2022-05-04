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
      organization: {
        organizationid: ''
      },
      membership: {
        membershipid: '',
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
      organization: {
        organizationid: req.query.organizationid
      },
      membership: {
        membershipid: '',
        organizationid: req.query.organizationid
      }
    }
    return
  }
  if (membership.accountid !== req.account.accountid) {
    req.error = 'invalid-account'
    req.removeContents = true
    req.data = {
      organization: {
        organizationid: req.query.organizationid
      },
      membership: {
        membershipid: '',
        organizationid: req.query.organizationid
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
      organization: {
        organizationid: req.query.organizationid
      },
      membership: {
        membershipid: ''
      }
    }
    if (error.message === 'invalid-account' || error.message === 'invalid-organizationid') {
      req.error = error.message
    } else {
      req.error = 'unknown-error'
    }
    return
  }
  req.data = { organization, membership }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.membership, 'membership')
  await navbar.setup(doc, req.data.organization, req.account)
  const removeElements = []
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (req.removeContents) {
      removeElements.push('submit-form')
    }
  } else {
    const retainedFields = req.membershipProfileFields || global.membershipProfileFields
    for (const field of global.profileFields) {
      if (retainedFields.indexOf(field) > -1) {
        continue
      }
      removeElements.push(`${field}-container`)
    }
    if (req.method === 'GET') {
      for (const field of retainedFields) {
        if (field === 'full-name') {
          const firstName = doc.getElementById('first-name')
          firstName.setAttribute('value', dashboard.Format.replaceQuotes(req.data.membership['first-name']))
          const lastName = doc.getElementById('last-name')
          lastName.setAttribute('value', dashboard.Format.replaceQuotes(req.data.membership['last-name']))
          continue
        }
        const element = doc.getElementById(field)
        element.setAttribute('value', dashboard.Format.replaceQuotes(req.data.membership[field]))
      }
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
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
  req.membershipProfileFields = req.membershipProfileFields || global.membershipProfileFields
  try {
    await global.api.user.UpdateProfile.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?membershipid=${req.query.membershipid}&message=success`
    })
    return res.end()
  }
}
