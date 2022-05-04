const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  req.query.all = true
  const profiles = await global.api.user.Profiles.get(req)
  const validProfiles = []
  if (profiles && profiles.length) {
    const requiredFields = req.membershipProfileFields || global.membershipProfileFields
    for (const profile of profiles) {
      let include = true
      for (const field of requiredFields) {
        if (field === 'full-name') {
          if (!profile.firstName || !profile.lastName) {
            include = false
            break
          }
        }
        const displayName = global.profileFieldMap[field]
        include = profile[displayName] && profile[displayName].length
        if (!include) {
          break
        }
      }
      if (include) {
        validProfiles.push(profile)
      }
    }
  }
  if (validProfiles && validProfiles.length) {
    req.data = {
      profiles: validProfiles
    }
  }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = req.error || messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  const removeElements = []
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      removeElements.push('submit-form')
    }
  } else {
    if (req.data && req.data.profiles && req.data.profiles.length) {
      dashboard.HTML.renderList(doc, req.data.profiles, 'profile-option', 'profileid')
    } else {
      removeElements.push('existing-profile-container')
    }
    const retainedFields = req.membershipProfileFields || global.membershipProfileFields
    for (const field of global.profileFields) {
      if (retainedFields.indexOf(field) > -1) {
        continue
      }
      removeElements.push(`${field}-container`)
    }
    if (req.body) {
      const codeField = doc.getElementById('secret-code')
      codeField.setAttribute('value', dashboard.Format.replaceQuotes(req.body['secret-code'] || ''))
      if (req.body.profileid) {
        dashboard.HTML.setSelectedOptionByValue(doc, 'profileid', dashboard.Format.replaceQuotes(req.body.profileid || ''))
      } else {
        const profileFields = req.membershipProfileFields || global.membershipProfileFields
        for (const field of profileFields) {
          if (field === 'full-name') {
            if (req.body['first-name']) {
              const element = doc.getElementById('first-name')
              element.setAttribute('value', dashboard.Format.replaceQuotes(req.body['first-name']))
            }
            if (req.body['last-name']) {
              const element = doc.getElementById('last-name')
              element.setAttribute('value', dashboard.Format.replaceQuotes(req.body['last-name']))
            }
            continue
          }
          if (req.body[field]) {
            const element = doc.getElementById(field)
            element.setAttribute('value', dashboard.Format.replaceQuotes(req.body[field] || ''))
          }
        }
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
  req.body['organization-pin'] = req.body['organization-pin'].trim ? req.body['organization-pin'].trim() : req.body['organization-pin']
  if (req.body['organization-pin'].match(/^[a-z0-9]+$/i) === null) {
    return renderPage(req, res, 'invalid-organization-pin')
  }

  req.body['secret-code'] = req.body['secret-code'].trim ? req.body['secret-code'].trim() : req.body['secret-code']
  if (req.body['secret-code'].match(/^[a-z0-9]+$/i) === null) {
    return renderPage(req, res, 'invalid-secret-code')
  }
  req.query = req.query || {}
  req.query['organization-pin'] = req.body['organization-pin']
  req.query['secret-code'] = req.body['secret-code']
  try {
    const invitation = await global.api.user.organizations.SecretInvitation.get(req)
    if (invitation.acceptedAt || invitation.terminatedAt) {
      return renderPage(req, res, 'invalid-invitation')
    }
    req.query.organizationid = invitation.organizationid
    req.query.invitationid = invitation.invitationid
    const organization = await global.api.user.organizations.OpenInvitationOrganization.get(req)
    if (req.account.accountid === organization.ownerid) {
      return renderPage(req, res, 'invalid-account')
    }
    let membership
    try {
      req.query.organizationid = organization.organizationid
      membership = await global.api.user.organizations.OrganizationMembership.get(req)
    } catch (error) {
    }
    if (membership) {
      return renderPage(req, res, 'invalid-account')
    }
  } catch (error) {
    return renderPage(req, res, error.message)
  }

  if (req.body.profileid) {
    if (!req.data || !req.data.profiles || !req.data.profiles.length) {
      return renderPage(req, res, 'invalid-profileid')
    }
    let found = false
    for (const profile of req.data.profiles) {
      found = profile.profileid === req.body.profileid
      if (found) {
        break
      }
    }
    if (!found) {
      req.query.profileid = req.body.profileid
      let profile
      try {
        profile = await global.api.user.Profile.get(req)
      } catch (error) {
        return renderPage(req, res, error.message)
      }
      if (!profile) {
        return renderPage(req, res, 'invalid-profileid')
      }
    }
  } else {
    const requiredFields = req.membershipProfileFields || global.membershipProfileFields
    for (const field of requiredFields) {
      switch (field) {
        case 'full-name':
          if (req.body['first-name'] && req.body['first-name'].trim) {
            req.body['first-name'] = req.body['first-name'].trim()
          }
          if (!req.body['first-name'] || !req.body['first-name'].length) {
            return renderPage(req, res, 'invalid-first-name')
          }
          if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
            global.maximumProfileFirstNameLength < req.body['first-name'].length) {
            return renderPage(req, res, 'invalid-first-name-length')
          }
          if (req.body['last-name'] && req.body['last-name'].trim) {
            req.body['last-name'] = req.body['last-name'].trim()
          }
          if (!req.body['last-name'] || !req.body['last-name'].length) {
            return renderPage(req, res, 'invalid-last-name')
          }
          if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
            global.maximumProfileLastNameLength < req.body['last-name'].length) {
            return renderPage(req, res, 'invalid-last-name-length')
          }
          continue
        case 'contact-email':
          if (!req.body[field] || req.body[field].indexOf('@') < 1) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
        case 'display-email':
          if (!req.body[field] || req.body[field].indexOf('@') < 1) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
        case 'display-name':
          if (!req.body[field] || !req.body[field].length) {
            return renderPage(req, res, `invalid-${field}`)
          }
          if (global.minimumProfileDisplayNameLength > req.body[field].length ||
            global.maximumProfileDisplayNameLength < req.body[field].length) {
            return renderPage(req, res, 'invalid-display-name-length')
          }
          continue
        case 'company-name':
          if (!req.body[field] || !req.body[field].length) {
            return renderPage(req, res, `invalid-${field}`)
          }
          if (global.minimumProfileCompanyNameLength > req.body[field].length ||
            global.maximumProfileCompanyNameLength < req.body[field].length) {
            return renderPage(req, res, 'invalid-company-name-length')
          }
          continue
        case 'dob':
          if (!req.body[field] || !req.body[field].length) {
            return renderPage(req, res, `invalid-${field}`)
          }
          try {
            const date = dashboard.Format.parseDate(req.body[field])
            if (!date || !date.getFullYear) {
              return renderPage(req, res, `invalid-${field}`)
            }
          } catch (error) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
        default:
          if (!req.body || !req.body[field]) {
            return renderPage(req, res, `invalid-${field}`)
          }
          continue
      }
    }
    try {
      req.userProfileFields = requiredFields
      const profile = await global.api.user.CreateProfile.post(req)
      req.body.profileid = profile.profileid
    } catch (error) {
      return renderPage(req, res, error.message)
    }
  }
  try {
    await global.api.user.organizations.CreateMembership.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?message=success`
    })
    return res.end()
  }
}
