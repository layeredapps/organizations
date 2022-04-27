module.exports = addXMembershipsHeader

async function addXMembershipsHeader (req, proxyRequestOptions) {
  if (!req.account || req.route) {
    return
  }
  const queryWas = {}
  req.query = {
    all: true,
    accountid: req.account.accountid
  }
  const memberships = await global.api.user.organizations.Memberships.get(req)
  req.query = queryWas
  if (!memberships || !memberships.length) {
    proxyRequestOptions.headers['x-memberships'] = '[]'
    return
  }
  proxyRequestOptions.headers['x-memberships'] = JSON.stringify(memberships)
}
