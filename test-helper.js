/* eslint-env mocha */
global.appid = global.appid || 'tests'
global.language = global.language || 'en'
global.applicationPath = global.applicationPath || __dirname
global.testConfiguration = global.testConfiguration || {}
global.testConfiguration.userProfileFields = ['full-name', 'contact-email']
global.testConfiguration.membershipProfileFields = ['display-name', 'display-email']
global.testConfiguration.minimumOrganizationNameLength = 1
global.testConfiguration.maximumOrganizationNameLength = 100
global.testConfiguration.minimumOrganizationPINLength = 1
global.testConfiguration.maximumOrganizationPINLength = 100
global.testConfiguration.minimumMembershipNameLength = 1
global.testConfiguration.maximumMembershipNameLength = 100
global.testConfiguration.minimumInvitationCodeLength = 1
global.testConfiguration.maximumInvitationCodeLength = 100

const TestHelper = require('@layeredapps/dashboard/test-helper.js')
let organizations

module.exports = {
  acceptInvitation,
  createInvitation,
  createOrganization,
  terminateInvitation
}

for (const x in TestHelper) {
  module.exports[x] = module.exports[x] || TestHelper[x]
}

async function setupBefore () {
  organizations = require('./index.js')
  await organizations.setup()
}

async function setupBeforeEach () {
  await organizations.Storage.flush()
}

async function setupAfter () {
  await organizations.Storage.flush()
}

before(setupBefore)
beforeEach(setupBeforeEach)
afterEach(setupAfter)

async function createOrganization (user, properties) {
  const req = TestHelper.createRequest(`/api/user/organizations/create-organization?accountid=${user.account.accountid}`, 'POST')
  req.account = user.account
  req.session = user.session
  req.body = properties
  user.organization = await req.post()
  const req2 = TestHelper.createRequest(`/api/user/organizations/organization-membership?organizationid=${user.organization.organizationid}`, 'POST')
  req2.account = user.account
  req2.session = user.session
  req2.body = properties
  user.membership = await req2.get()
  return user.organization
}

let invitationNumber = 0
async function createInvitation (owner, properties) {
  const code = 'secret' + invitationNumber++
  const req = TestHelper.createRequest(`/api/user/organizations/create-invitation?organizationid=${owner.organization.organizationid}`, 'POST')
  req.account = owner.account
  req.session = owner.session
  req.body = {
    'secret-code': code,
    lifespan: 'multi'
  }
  for (const property in properties) {
    req.body[property] = properties[property]
  }
  owner.invitation = await req.post()
  owner.invitation.secretCode = code
  return owner.invitation
}

async function acceptInvitation (user, owner) {
  const req = TestHelper.createRequest('/api/user/organizations/create-membership', 'POST')
  req.account = user.account
  req.session = user.session
  req.body = {
    'organization-pin': owner.organization.pin,
    'secret-code': owner.invitation.secretCode,
    profileid: user.profile.profileid
  }
  user.membership = await req.post()
  return user.membership
}

async function terminateInvitation (owner) {
  const req = TestHelper.createRequest(`/api/user/organizations/set-invitation-terminated?invitationid=${owner.invitation.invitationid}`, 'PATCH')
  req.account = owner.account
  req.session = owner.session
  owner.invitation = await req.patch()
  return owner.invitation
}
