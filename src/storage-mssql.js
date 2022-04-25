const { Sequelize } = require('sequelize')
const Log = require('@layeredapps/dashboard/src/log.js')('sequelize-organizations-mssql')

module.exports = async () => {
  const prefixedDatabase = process.env.ORGANIZATIONS_MSSQL_DATABASE || process.env.MSSQL_DATABASE
  const prefixedUsername = process.env.ORGANIZATIONS_MSSQL_USERNAME || process.env.MSSQL_USERNAME
  const prefixedPassword = process.env.ORGANIZATIONS_MSSQL_PASSWORD || process.env.MSSQL_PASSWORD
  const prefixedHost = process.env.ORGANIZATIONS_MSSQL_HOST || process.env.MSSQL_HOST
  const prefixedPort = process.env.ORGANIZATIONS_MSSQL_PORT || process.env.MSSQL_PORT
  const sequelize = new Sequelize(prefixedDatabase, prefixedUsername, prefixedPassword, {
    logging: (sql) => {
      return Log.info(sql)
    },
    dialect: 'mssql',
    dialectOptions: {
      driver: 'SQL Server Native Client 11.0'
    },
    host: prefixedHost,
    port: prefixedPort,
    pool: {
      max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
      min: 0,
      idle: process.env.ORGANIZATIONS_IDLE_CONNECTION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
    }
  })
  return sequelize
}
