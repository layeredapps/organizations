const metrics = require('@layeredapps/dashboard/src/metrics.js')

module.exports = async () => {
  let storage
  const prefixedStorage = process.env.ORGANIZATIONS_STORAGE || process.env.STORAGE
  switch (prefixedStorage) {
    case 'postgresql':
    case 'postgres':
      storage = require('./storage-postgresql.js')
      break
    case 'mariadb':
      storage = require('./storage-mariadb.js')
      break
    case 'mysql':
      storage = require('./storage-mysql.js')
      break
    case 'db2':
      storage = require('./storage-db2.js')
      break
    case 'mssql':
      storage = require('./storage-mssql.js')
      break
    case 'sqlite':
    default:
      storage = require('./storage-sqlite.js')
      break
  }
  const container = await storage()
  container.Organization.afterCreate(organizationsCreated)
  container.Membership.afterCreate(membershipsCreated)
  container.Invitation.afterCreate(invitationsCreated)
  return container
}

async function organizationsCreated () {
  await metrics.aggregate('organizations-created', new Date())
}

async function membershipsCreated () {
  await metrics.aggregate('memberships-created', new Date())
}

async function invitationsCreated () {
  await metrics.aggregate('invitations-created', new Date())
}
