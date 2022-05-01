const { Sequelize } = require('sequelize')
const Log = require('@layeredapps/dashboard/src/log.js')('sequelize-organizations-postgresql')

module.exports = async () => {
  const prefixedDatabaseURL = process.env.ORGANIZATIONS_POSTGRESQL_DATABASE_URL || process.env.POSTGRESQL_DATABASE_URL
  const sequelize = new Sequelize(prefixedDatabaseURL, {
    dialect: 'sqlite',
    logging: (sql) => {
      return Log.info(sql)
    },
    pool: {
      max: process.env.ORGANIZATIONS_MAX_CONNECTIONS || process.env.MAX_CONNECTIONS || 10,
      min: 0,
      idle: process.env.ORGANIZATIONS_IDLE_CONNECTION_LIMIT || process.env.IDLE_CONNECTION_LIMIT || 10000
    }
  })
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
  return sequelize
}
