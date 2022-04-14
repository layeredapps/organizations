const { Sequelize } = require('sequelize')

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
  return sequelize
}
