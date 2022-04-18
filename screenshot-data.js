const { faker } = require('@faker-js/faker')
const DashboardScreenshots = require('@layeredapps/dashboard/screenshot-data.js')

const organizationQuantities = []
const membershipQuantities = []
const invitationQuantities = []
for (let i = 0; i < 365; i++) {
  if (i === 0) {
    organizationQuantities[i] = Math.ceil(Math.random() * 100)
  } else {
    organizationQuantities[i] = Math.ceil(organizationQuantities[i - 1] * (0.85 + (Math.random() * 0.25)))
  }
  membershipQuantities[i] = organizationQuantities[i] + Math.ceil(Math.random() * 200)
  invitationQuantities[i] = membershipQuantities[i] + Math.ceil(Math.random() * 100)
}

const administratorIndex = {
  before: async (req) => {
    if (req.urlPath !== '/administrator/organizations') {
      return
    }
    const route = req.route
    const oldAPI = req.route.api
    req.route = {}
    for (const key in route) {
      req.route[key] = route[key]
    }
    req.route.api = {
      before: oldAPI.before,
      get: oldAPI.get,
      post: oldAPI.post,
      patch: oldAPI.patch,
      put: oldAPI.put,
      delete: oldAPI.delete
    }
    req.route.api.before = async (req) => {
      await oldAPI.before(req)
      DashboardScreenshots.addMetrics(req.data.organizationsChartDays, 90, organizationQuantities)
      DashboardScreenshots.addMetrics(req.data.invitationsChartDays, 90, invitationQuantities)
      DashboardScreenshots.addMetrics(req.data.membershipsChartDays, 90, membershipQuantities)
      DashboardScreenshots.adjustNormalize(req.data.organizationsChartDays)
      DashboardScreenshots.adjustNormalize(req.data.invitationsChartDays)
      DashboardScreenshots.adjustNormalize(req.data.membershipsChartDays)
      DashboardScreenshots.adjustHighlight(organizationQuantities, req.data.organizationsChartHighlights)
      DashboardScreenshots.adjustHighlight(invitationQuantities, req.data.invitationsChartHighlights)
      DashboardScreenshots.adjustHighlight(membershipQuantities, req.data.membershipsChartHighlights)
      DashboardScreenshots.adjustValues(req.data.organizationsChartDays, req.data.organizationsChartValues)
      DashboardScreenshots.adjustValues(req.data.invitationsChartDays, req.data.invitationsChartValues)
      DashboardScreenshots.adjustValues(req.data.membershipsChartDays, req.data.membershipsChartValues)
    }
  }
}

const administratorOrganizations = {
  before: async (req) => {
    if (req.urlPath !== '/administrator/organizations/organizations' || global.pageSize !== 50) {
      return
    }
    const route = req.route
    const oldAPI = req.route.api
    req.route = {}
    for (const key in route) {
      req.route[key] = route[key]
    }
    req.route.api = {
      before: oldAPI.before,
      get: oldAPI.get,
      post: oldAPI.post,
      patch: oldAPI.patch,
      put: oldAPI.put,
      delete: oldAPI.delete
    }
    req.route.api.before = async (req) => {
      await oldAPI.before(req)
      DashboardScreenshots.addMetrics(req.data.createdChartDays, 365, organizationQuantities)
      DashboardScreenshots.adjustNormalize(req.data.createdChartDays)
      DashboardScreenshots.adjustHighlight(organizationQuantities, req.data.createdChartHighlights)
      DashboardScreenshots.adjustValues(req.data.createdChartDays, req.data.createdChartValues)
      addOrganizationObjects(req.data.organizations, global.pageSize - req.data.organizations.length)
      req.data.total = req.data.createdChartHighlights.total
    }
  }
}

const administratorMemberships = {
  before: async (req) => {
    if (req.urlPath !== '/administrator/organizations/memberships' || global.pageSize !== 50) {
      return
    }
    const route = req.route
    const oldAPI = req.route.api
    req.route = {}
    for (const key in route) {
      req.route[key] = route[key]
    }
    req.route.api = {
      before: oldAPI.before,
      get: oldAPI.get,
      post: oldAPI.post,
      patch: oldAPI.patch,
      put: oldAPI.put,
      delete: oldAPI.delete
    }
    req.route.api.before = async (req) => {
      await oldAPI.before(req)
      DashboardScreenshots.addMetrics(req.data.createdChartDays, 365, membershipQuantities)
      DashboardScreenshots.adjustNormalize(req.data.createdChartDays)
      DashboardScreenshots.adjustHighlight(membershipQuantities, req.data.createdChartHighlights)
      DashboardScreenshots.adjustValues(req.data.createdChartDays, req.data.createdChartValues)
      addMembershipObjects(req.data.memberships, global.pageSize - req.data.memberships.length)
      req.data.total = req.data.createdChartHighlights.total
    }
  }
}

const administratorInvitations = {
  before: async (req) => {
    if (req.urlPath !== '/administrator/organizations/invitations' || global.pageSize !== 50) {
      return
    }
    const route = req.route
    const oldAPI = req.route.api
    req.route = {}
    for (const key in route) {
      req.route[key] = route[key]
    }
    req.route.api = {
      before: oldAPI.before,
      get: oldAPI.get,
      post: oldAPI.post,
      patch: oldAPI.patch,
      put: oldAPI.put,
      delete: oldAPI.delete
    }
    req.route.api.before = async (req) => {
      await oldAPI.before(req)
      DashboardScreenshots.addMetrics(req.data.createdChartDays, 365, invitationQuantities)
      DashboardScreenshots.adjustNormalize(req.data.createdChartDays)
      DashboardScreenshots.adjustHighlight(invitationQuantities, req.data.createdChartHighlights)
      DashboardScreenshots.adjustValues(req.data.createdChartDays, req.data.createdChartValues)
      addInvitationObjects(req.data.invitations, global.pageSize - req.data.invitations.length)
      req.data.total = req.data.createdChartHighlights.total
    }
  }
}

module.exports = {
  administratorIndex,
  administratorOrganizations,
  administratorMemberships,
  administratorInvitations
}

function addOrganizationObjects (array, quantity) {
  const now = new Date()
  let date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let day = 0
  let dayCount = 0
  let identityNumber = 0
  for (let i = 0; i < quantity; i++) {
    dayCount++
    if (dayCount === organizationQuantities[day]) {
      day++
      dayCount = 0
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
    }
    const identity = DashboardScreenshots.identities[identityNumber]
    identityNumber++
    const organization = {
      organizationid: 'orgn_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      object: 'organization',
      appid: global.appid,
      ownerid: 'acct_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      name: faker.company.companyName(),
      email: identity.email,
      createdAt: date,
      createdAtFormatted: date.getFullYear() + '-' + DashboardScreenshots.twoDigits(date.getMonth() + 1) + '-' + DashboardScreenshots.twoDigits(date.getDate()),
      updatedAt: date
    }
    array.push(organization)
  }
}

function addInvitationObjects (array, quantity) {
  const now = new Date()
  let date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let day = 0
  let dayCount = 0
  for (let i = 0; i < quantity; i++) {
    dayCount++
    if (dayCount === invitationQuantities[day]) {
      day++
      dayCount = 0
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
    }
    const invitation = {
      invitationid: 'invt_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      organizationid: 'orgn_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      accountid: 'acct_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      object: 'invitation',
      appid: global.appid,
      createdAt: date,
      createdAtFormatted: date.getFullYear() + '-' + DashboardScreenshots.twoDigits(date.getMonth() + 1) + '-' + DashboardScreenshots.twoDigits(date.getDate()),
      updatedAt: date
    }
    array.push(invitation)
  }
}

function addMembershipObjects (array, quantity) {
  const now = new Date()
  let date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let day = 0
  let dayCount = 0
  let identityNumber = 0
  for (let i = 0; i < quantity; i++) {
    dayCount++
    if (dayCount === membershipQuantities[day]) {
      day++
      dayCount = 0
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
    }
    const identity = DashboardScreenshots.identities[identityNumber]
    identityNumber++
    const membership = {
      membershipid: 'mmbr_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      object: 'membership',
      appid: global.appid,
      invitationid: 'invt_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      organizationid: 'orgn_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      accountid: 'acct_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      profileid: 'prof_' + faker.datatype.uuid().split('-').join('').substring(0, 24),
      createdAt: date,
      createdAtFormatted: date.getFullYear() + '-' + DashboardScreenshots.twoDigits(date.getMonth() + 1) + '-' + DashboardScreenshots.twoDigits(date.getDate()),
      updatedAt: date,
      displayName: identity.firstName,
      displayEmail: identity.email
    }
    array.push(membership)
  }
}
