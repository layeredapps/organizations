const { Sequelize } = require('sequelize')
const Log = require('@layeredapps/dashboard/src/log.js')('sequelize-organizations-db2')

module.exports = async () => {
  const prefixedDatabaseURL = process.env.ORGANIZATIONS_DATABASE_URL || process.env.DATABASE_URL
  const sequelize = new Sequelize(prefixedDatabaseURL, {
    logging: (sql) => {
      return Log.info(sql)
    },
    dialect: 'db2',
    pool: {
      max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
      min: 0,
      idle: process.env.ORGANIZATIONS_IDLE_CONNECTION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
    }
  })
  return sequelize
}
