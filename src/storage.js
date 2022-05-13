const crypto = require('crypto')
const { Sequelize, Model, DataTypes } = require('sequelize')
const metrics = require('@layeredapps/dashboard/src/metrics.js')
const Log = require('@layeredapps/dashboard/src/log.js')('sequelize-organizations')

module.exports = async () => {
  let dateType
  const prefixedStorage = process.env.ORGANIZATIONS_STORAGE || process.env.STORAGE
  switch (prefixedStorage) {
    case 'mariadb':
    case 'mysql':
      dateType = DataTypes.DATE(6)
      break
    case 'postgresql':
    case 'postgres':
    case 'db2':
    case 'mssql':
    case 'sqlite':
    default:
      dateType = DataTypes.DATE
      break
  }
  const sequelize = await createConnection(prefixedStorage)
  class Invitation extends Model {}
  Invitation.init({
    invitationid: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      defaultValue: () => {
        return 'invt_' + crypto.randomBytes(8).toString('hex')
      }
    },
    organizationid: DataTypes.STRING(64),
    accountid: DataTypes.STRING(64),
    object: {
      type: DataTypes.VIRTUAL,
      get () {
        return 'invitation'
      }
    },
    appid: {
      type: DataTypes.STRING,
      defaultValue: global.appid
    },
    secretCode: DataTypes.STRING,
    multi: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    acceptedAt: dateType,
    terminatedAt: dateType,
    // 'createdAt' is specified for each model because mysql/mariadb truncate
    // the ms and this makes the return order unpredictable and throws off the
    // test suites expecting the write order to match the return order
    createdAt: {
      type: dateType,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'invitation'
  })

  class Membership extends Model {}
  Membership.init({
    membershipid: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      defaultValue: () => {
        return 'mmbr_' + crypto.randomBytes(8).toString('hex')
      }
    },
    object: {
      type: DataTypes.VIRTUAL,
      get () {
        return 'membership'
      }
    },
    appid: {
      type: DataTypes.STRING,
      defaultValue: global.appid
    },
    accountid: DataTypes.STRING(64),
    organizationid: DataTypes.STRING(64),
    invitationid: DataTypes.STRING(64),
    profileid: DataTypes.STRING(64),
    // 'createdAt' is specified for each model because mysql/mariadb truncate
    // the ms and this makes the return order unpredictable and throws off the
    // test suites expecting the write order to match the return order
    createdAt: {
      type: dateType,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'membership'
  })
  class Organization extends Model {}
  Organization.init({
    organizationid: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      defaultValue: () => {
        return 'orgn_' + crypto.randomBytes(8).toString('hex')
      }
    },
    object: {
      type: DataTypes.VIRTUAL,
      get () {
        return 'organization'
      }
    },
    appid: {
      type: DataTypes.STRING,
      defaultValue: global.appid
    },
    ownerid: DataTypes.STRING(64),
    name: DataTypes.STRING,
    pin: {
      type: DataTypes.STRING,
      unique: true
    },
    email: DataTypes.STRING,
    // 'createdAt' is specified for each model because mysql/mariadb truncate
    // the ms and this makes the return order unpredictable and throws off the
    // test suites expecting the write order to match the return order
    createdAt: {
      type: dateType,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'organization'
  })
  // table creation
  await sequelize.sync()
  // exception logging
  const originalQuery = sequelize.query
  sequelize.query = function () {
    return originalQuery.apply(this, arguments).catch((error) => {
      Log.error(error)
      throw error
    })
  }
  // metrics
  Organization.afterCreate(async (object) => {
    if (global.disableMetrics) {
      return
    }
    await metrics.aggregate(object.dataValues.appid, 'organizations-created', object.dataValues.createdAt)
  })
  Membership.afterCreate(async (object) => {
    if (global.disableMetrics) {
      return
    }
    await metrics.aggregate(object.dataValues.appid, 'memberships-created', object.dataValues.createdAt)
  })
  Invitation.afterCreate(async (object) => {
    if (global.disableMetrics) {
      return
    }
    await metrics.aggregate(object.dataValues.appid, 'invitations-created', object.dataValues.createdAt)
  })
  Invitation.afterBulkUpdate(async (object) => {
    if (global.disableMetrics) {
      return
    }
    if (object.attributes.acceptedAt) {
      const invitation = await Invitation.findOne({ where: object.where, attributes: ['appid'] })
      await metrics.aggregate(invitation.dataValues.appid, 'invitations-accepted', object.attributes.acceptedAt)
    }
  })
  return {
    sequelize,
    flush: async () => {
      if (process.env.NODE_ENV === 'testing') {
        await Organization.sync({ force: true })
        await Membership.sync({ force: true })
        await Invitation.sync({ force: true })
      }
    },
    Organization,
    Membership,
    Invitation
  }
}

async function createConnection (dialect) {
  // sqlite
  if (dialect === 'sqlite') {
    const databaseFile = process.env.ORGANIZATIONS_DATABASE_FILE || process.env.DATABASE_FILE
    if (databaseFile) {
      return new Sequelize(process.env.DATABASE || 'dashboard', '', '', {
        storage: databaseFile,
        dialect: 'sqlite',
        logging: (sql) => {
          return Log.info(sql)
        }
      })
    } else {
      return new Sequelize('sqlite::memory', {
        dialect: 'sqlite',
        logging: (sql) => {
          return Log.info(sql)
        }
      })
    }
  }
  // all other databases
  let url = global.organizationsDatabaseURL || process.env.ORGANIZATIONS_DATABASE_URL || global.databaseURL || process.env.DATABASE_URL
  const sslModeRequiredIndex = url.indexOf('?sslmode=require')
  const dialectOptions = {}
  if (sslModeRequiredIndex > -1) {
    url = url.substring(0, sslModeRequiredIndex)
    dialectOptions.ssl = {
      require: true,
      rejectUnauthorized: false
    }
    dialectOptions.keepAlive = true
  }
  if (dialect === 'mssql') {
    dialectOptions.driver = 'SQL Server Native Client 11.0'
  }
  const pool = {
    max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
    min: 0,
    idle: process.env.ORGANIZATIONS_IDLE_CONNECION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
  }
  const replicationEnabled = process.env.ORGANIZATIONS_REPLICATION || process.env.STORAGE_REPLICATION
  if (replicationEnabled) {
    const replication = {
      read: [],
      write: parseConnectionString(url)
    }
    let i = 1
    while (true) {
      if (!global[`organizationsReadDatabaseURL${i}`] && !process.env[`ORGANIZATIONS_READ_DATABASE_URL${i}`] && !global[`readDatabaseURL${i}`] && !process.env[`READ_DATABASE_URL${i}`]) {
        break
      }
      replication.read.push(parseConnectionString(
        global[`organizationsReadDatabaseURL${i}`] || process.env[`ORGANIZATIONS_READ_DATABASE_URL${i}`] || global[`readDatabaseURL${i}`] || process.env[`READ_DATABASE_URL${i}`]
      ))
      i++
    }
    const sequelize = new Sequelize({
      dialect,
      dialectOptions,
      replication,
      pool,
      logging: (sql) => {
        return Log.info(sql)
      }
    })
    return sequelize
  }
  const sequelize = new Sequelize(url, {
    dialect,
    dialectOptions,
    pool,
    logging: (sql) => {
      return Log.info(sql)
    }
  })
  return sequelize
}

function parseConnectionString (url) {
  // dialect://username:password@host:port/database
  if (url.indexOf('://') > -1) {
    const urlParts = url.parse(url, true)
    const object = {}
    object.host = urlParts.hostname
    if (urlParts.pathname) {
      object.database = urlParts.pathname.replace(/^\//, '')
    }
    if (urlParts.port) {
      object.port = urlParts.port
    }
    if (urlParts.auth) {
      const authParts = urlParts.auth.split(':')
      object.username = authParts[0]
      if (authParts.length > 1) {
        object.password = authParts.slice(1).join(':')
      }
    }
    return object
  }
  // User Id=X;Password=X;Server=X;Database=X;Port=X
  const params = url.split(';')
  const rawParams = {}
  for (const param of params) {
    const parts = param.split('=')
    rawParams[parts[0]] = parts.slice(1).join('=')
  }
  const object = {}
  object.host = rawParams.Server || rawParams.server
  object.username = rawParams['User Id'] || rawParams['user id']
  object.password = rawParams.Password || rawParams.password
  object.database = rawParams.Database || rawParams.database
  object.port = rawParams.Port || rawParams.port
  return object
}
