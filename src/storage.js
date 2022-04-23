const { Model, DataTypes } = require('sequelize')
const metrics = require('@layeredapps/dashboard/src/metrics.js')

module.exports = async () => {
  let storage, dateType
  const prefixedStorage = process.env.ORGANIZATIONS_STORAGE || process.env.STORAGE
  switch (prefixedStorage) {
    case 'postgresql':
    case 'postgres':
      storage = require('./storage-postgresql.js')
      dateType = DataTypes.DATE
      break
    case 'mariadb':
      storage = require('./storage-mariadb.js')
      dateType = DataTypes.DATE(6)
      break
    case 'mysql':
      storage = require('./storage-mysql.js')
      dateType = DataTypes.DATE(6)
      break
    case 'db2':
      storage = require('./storage-db2.js')
      dateType = DataTypes.DATE
      break
    case 'mssql':
      storage = require('./storage-mssql.js')
      dateType = DataTypes.DATE
      break
    case 'sqlite':
    default:
      storage = require('./storage-sqlite.js')
      dateType = DataTypes.DATE
      break
  }
  const sequelize = await storage()
  class Invitation extends Model {}
  Invitation.init({
    invitationid: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      defaultValue: () => {
        const idValue = Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        return 'invt_' + idValue.substring(0, 16)
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
        const idValue = Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        return 'mmbr_' + idValue.substring(0, 16)
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
        const idValue = Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        return 'orgn_' + idValue.substring(0, 16)
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
  await sequelize.sync({ alter: true, force: true })
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
        await Organization.destroy({ where: {} })
        await Membership.destroy({ where: {} })
        await Invitation.destroy({ where: {} })
      }
    },
    Organization,
    Membership,
    Invitation
  }
}
