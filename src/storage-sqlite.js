const { Sequelize, Model, DataTypes } = require('sequelize')

module.exports = async () => {
  const prefixedDatabaseFile = process.env.ORGANIZATIONS_SQLITE_DATABASE_FILE || process.env.SQLITE_DATABASE_FILE
  const prefixedDatabaseName = process.env.ORGANIZATIONS_SQLITE_DATABASE || process.env.SQLITE_DATABASE
  let sequelize
  if (prefixedDatabaseFile) {
    sequelize = new Sequelize(prefixedDatabaseName || 'organizations', '', '', {
      storage: prefixedDatabaseFile,
      dialect: 'sqlite',
      logging: false,
      pool: {
        max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
        min: 0,
        idle: process.env.ORGANIZATIONS_IDLE_CONNECTION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
      }
    })
  } else {
    sequelize = new Sequelize('sqlite::memory', {
      dialect: 'sqlite',
      logging: false,
      pool: {
        max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
        min: 0,
        idle: process.env.ORGANIZATIONS_IDLE_CONNECTION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
      }
    })
  }
  class Invitation extends Model {}
  Invitation.init({
    invitationid: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      defaultValue: () => {
        const idValue = Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        return 'invt_' + idValue.substring(0, 16)
      }
    },
    organizationid: DataTypes.STRING(21),
    accountid: DataTypes.STRING(21),
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
    secretCodeHash: DataTypes.STRING,
    acceptedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'invitation'
  })

  class Membership extends Model {}
  Membership.init({
    membershipid: {
      type: DataTypes.STRING(21),
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
    accountid: DataTypes.STRING(21),
    organizationid: DataTypes.STRING(21),
    invitationid: DataTypes.STRING(21),
    profileid: DataTypes.STRING(21)
  }, {
    sequelize,
    modelName: 'membership'
  })

  class Organization extends Model {}
  Organization.init({
    organizationid: {
      type: DataTypes.STRING(21),
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
    ownerid: DataTypes.STRING(21),
    name: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'organization'
  })

  await sequelize.sync()
  return {
    sequelize,
    flush: async () => {
      await Invitation.destroy({ where: {} })
      await Membership.destroy({ where: {} })
      await Organization.destroy({ where: {} })
    },
    Invitation,
    Membership,
    Organization
  }
}
