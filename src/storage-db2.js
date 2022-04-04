const { Sequelize, Model, DataTypes } = require('sequelize')

module.exports = async () => {
  const prefixedDatabase = process.env.ORGANIZATIONS_DB2_DATABASE || process.env.DB2_DATABASE
  const prefixedUsername = process.env.ORGANIZATIONS_DB2_USERNAME || process.env.DB2_USERNAME
  const prefixedPassword = process.env.ORGANIZATIONS_DB2_PASSWORD || process.env.DB2_PASSWORD
  const prefixedHost = process.env.ORGANIZATIONS_DB2_HOST || process.env.DB2_HOST
  const prefixedPort = process.env.ORGANIZATIONS_DB2_PORT || process.env.DB2_PORT
  const sequelize = new Sequelize(prefixedDatabase, prefixedUsername, prefixedPassword, {
    logging: true,
    dialect: 'db2',
    host: prefixedHost,
    port: prefixedPort,
    pool: {
      max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
      min: 0,
      idle: process.env.ORGANIZATIONS_IDLE_CONNECTION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
    }
  })
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
