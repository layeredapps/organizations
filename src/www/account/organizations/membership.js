const dashboard = require('@layeredapps/dashboard')
const navbar = require('./navbar-membership.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
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
  let membership
  try {
    membership = await global.api.user.organizations.Membership.get(req)
  } catch (error) {
    req.removeContents = true
    if (error.message === 'invalid-membershipid' || error.message === 'invalid-account' || error.message === 'invalid-organizationid') {
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
  if (membership.accountid !== req.account.accountid && organization.ownerid !== req.account.accountid) {
    req.error = 'invalid-account'
    req.removeContents = true
    return
  }
  if (membership.createdAt) {
    membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
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
    const retainedFields = req.membershipProfileFields || global.userProfileFields
    for (const field of global.profileFields) {
      if (retainedFields.indexOf(field) > -1) {
        continue
      }
      removeElements.push(field)
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
