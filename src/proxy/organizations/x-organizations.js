module.exports = async (req, proxyRequestOptions) => {
  if (!req.account || req.route) {
    return
  }
  const queryWas = req.query
  req.query = {
    accountid: req.account.accountid,
    all: true
  }
  const organizations = await global.api.user.organizations.Organizations.get(req)
  req.query = queryWas
  if (!organizations) {
    proxyRequestOptions.headers['x-organizations'] = '[]'
    return
  }
  proxyRequestOptions.headers['x-organizations'] = JSON.stringify(organizations)
}
