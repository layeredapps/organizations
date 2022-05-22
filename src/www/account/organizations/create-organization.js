const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  req.query = req.query || {}
  if (req.query.message === 'success') {
    req.removeContents = true
    req.data = {
      organization: {
        organizationid: req.query.organizationid
      }
    }
    return
  }
  req.query.accountid = req.account.accountid
  req.query.all = true
  const profiles = await global.api.user.Profiles.get(req)
  const validProfiles = []
  if (profiles && profiles.length) {
    const requiredFields = req.membershipProfileFields || global.membershipProfileFields
    for (const profile of profiles) {
      let include = true
      for (const field of requiredFields) {
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
    dashboard.HTML.renderTemplate(doc, req.data ? req.data.organization : null, messageTemplate, 'message-container')
    if (req.removeContents) {
      removeElements.push('submit-form')
    }
  } else {
    const note = {
      object: 'note',
      min: global.minimumOrganizationPINLength,
      max: global.maximumOrganizationPINLength
    }
    dashboard.HTML.renderTemplate(doc, note, 'alphanumeric-note', 'note-container')
    const profileFields = req.membershipProfileFields || global.membershipProfileFields
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
      const nameField = doc.getElementById('name')
      nameField.setAttribute('value', dashboard.Format.replaceQuotes(req.body.name || ''))
      const emailField = doc.getElementById('email')
      emailField.setAttribute('value', dashboard.Format.replaceQuotes(req.body.email || ''))
      if (req.body.profileid) {
        dashboard.HTML.setSelectedOptionByValue(doc, 'profileid', req.body.profileid || '')
      }
      for (const field of profileFields) {
        if (req.body[field]) {
          const element = doc.getElementById(field)
          element.setAttribute('value', dashboard.Format.replaceQuotes(req.body[field]))
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
  if (!req.body.name || !req.body.name.length) {
    return renderPage(req, res, 'invalid-organization-name')
  }
  req.body.name = req.body.name.trim ? req.body.name.trim() : req.body.name
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
      return renderPage(req, res, 'invalid-profileid')
    }
  } else {
    const requiredFields = req.membershipProfileFields || global.membershipProfileFields
    for (const field of requiredFields) {
      switch (field) {
        case 'full-name':
          if (req.body['full-name'] && req.body['full-name'].trim) {
            req.body['full-name'] = req.body['full-name'].trim()
          }
          if (!req.body['full-name'] || !req.body['full-name'].length) {
            return renderPage(req, res, 'invalid-full-name')
          }
          if (global.minimumProfileFullNameLength > req.body['full-name'].length ||
            global.maximumProfileFullNameLength < req.body['full-name'].length) {
            return renderPage(req, res, 'invalid-full-name-length')
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
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  let organization
  try {
    organization = await global.api.user.organizations.CreateOrganization.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?organizationid=${organization.organizationid}&message=success`
    })
    return res.end()
  }
}
