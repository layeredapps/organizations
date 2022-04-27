const dashboard = require('@layeredapps/dashboard')

module.exports = {
  after: checkBeforeDeleteOrganization
}

async function checkBeforeDeleteOrganization (req, res) {
  if (!req.url.startsWith('/account/organizations/delete-organization')) {
    return
  }
  if (!global.applicationServer) {
    return
  }
  const urlWas = req.url
  if (process.env.CHECK_BEFORE_DELETE_ACCOUNT) {
    req.url = `${process.env.CHECK_BEFORE_DELETE_ORGANIZATION}?organizationid=${req.query.organizationid}`
  } else {
    req.url = `/api/check-before-delete-organization?organizationid=${req.query.organizationid}`
  }
  const response = await dashboard.Proxy.get(req)
  req.url = urlWas
  if (response.startsWith('{')) {
    const result = JSON.parse(response)
    if (result.redirect) {
      return dashboard.Response.redirect(req, res, response.redirect)
    }
  }
}
