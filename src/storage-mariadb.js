const { Sequelize, Model, DataTypes } = require('sequelize')

module.exports = async () => {
  const prefixedDatabase = process.env.ORGANIZATIONS_MARIADB_DATABASE || process.env.MARIADB_DATABASE
  const prefixedUsername = process.env.ORGANIZATIONS_MARIADB_USERNAME || process.env.MARIADB_USERNAME
  const prefixedPassword = process.env.ORGANIZATIONS_MARIADB_PASSWORD || process.env.MARIADB_PASSWORD
  const prefixedHost = process.env.ORGANIZATIONS_MARIADB_HOST || process.env.MARIADB_HOST
  const prefixedPort = process.env.ORGANIZATIONS_MARIADB_PORT || process.env.MARIADB_PORT
  const sequelize = new Sequelize(prefixedDatabase, prefixedUsername, prefixedPassword, {
    logging: true,
    dialect: 'mysql',
    host: prefixedHost,
    port: prefixedPort
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
