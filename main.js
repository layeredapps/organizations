const dashboard = require('@layeredapps/dashboard')
dashboard.start(__dirname)
const organizations = require('./index.js')
organizations.setup()
