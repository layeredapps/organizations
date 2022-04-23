if (!process.env.MEMBERSHIP_PROFILE_FIELDS) {
  global.membershipProfileFields = ['display-name', 'display-email']
} else {
  global.membershipProfileFields = process.env.MEMBERSHIP_PROFILE_FIELDS.split(',')
}
global.minimumOrganizationNameLength = parseInt(process.env.MINIMUM_ORGANIZATION_NAME_LENGTH || '1', 10)
global.maximumOrganizationNameLength = parseInt(process.env.MAXIMUM_ORGANIZATION_NAME_LENGTH || '50', 10)
global.minimumOrganizationPINLength = parseInt(process.env.MINIMUM_ORGANIZATION_PIN_LENGTH || '4', 10)
global.maximumOrganizationPINLength = parseInt(process.env.MAXIMUM_ORGANIZATION_PIN_LENGTH || '6', 10)
global.minimumInvitationCodeLength = parseInt(process.env.MINIMUM_INVITATION_CODE_LENGTH || '6', 10)
global.maximumInvitationCodeLength = parseInt(process.env.MAXIMUM_INVITATION_CODE_LENGTH || '50', 10)

module.exports = {
  setup: async () => {
    const storage = require('./src/storage.js')
    module.exports.Storage = await storage()
  }
}
