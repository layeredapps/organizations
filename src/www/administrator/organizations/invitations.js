const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.organizations.InvitationsCount.get(req)
  const invitations = await global.api.administrator.organizations.Invitations.get(req)
  if (invitations && invitations.length) {
    for (const invitation of invitations) {
      invitation.createdAtFormatted = dashboard.Format.date(invitation.createdAt)
      if (invitation.acceptedAt) {
        invitation.acceptedAtFormatted = dashboard.Format.date(invitation.acceptedAt)
      }
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  let createdChartDays, createdChartHighlights, createdChartValues
  if (offset === 0) {
    req.query.keys = dashboard.Metrics.metricKeys('invitations-created', 365).join(',')
    const createdChart = await global.api.administrator.MetricKeys.get(req)
    const createdChartMaximum = dashboard.Metrics.maximumDay(createdChart)
    createdChartDays = dashboard.Metrics.days(createdChart, createdChartMaximum)
    createdChartHighlights = dashboard.Metrics.highlights(createdChart, createdChartDays)
    createdChartValues = [
      { object: 'object', value: createdChartMaximum },
      { object: 'object', value: Math.floor(createdChartMaximum * 0.75) },
      { object: 'object', value: Math.floor(createdChartMaximum * 0.5) },
      { object: 'object', value: Math.floor(createdChartMaximum * 0.25) },
      { object: 'object', value: 0 }
    ]
  }
  req.data = { invitations, total, offset, createdChartDays, createdChartHighlights, createdChartValues }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (req.data.invitations && req.data.invitations.length) {
    dashboard.HTML.renderTable(doc, req.data.invitations, 'invitation-row', 'invitations-table')
    for (const invitation of req.data.invitations) {
      if (invitation.acceptedAt) {
        const notAccepted = doc.getElementById(`not-accepted-${invitation.invitationid}`)
        notAccepted.parentNode.removeChild(notAccepted)
      } else {
        const acceptedElement = doc.getElementById(`accepted-${invitation.invitationid}`)
        acceptedElement.parentNode.removeChild(acceptedElement)
      }
      if (invitation.membershipid) {
        const noMembership = doc.getElementById(`no-membership-${invitation.invitationid}`)
        noMembership.parentNode.removeChild(noMembership)
      } else {
        const membership = doc.getElementById(`membership-${invitation.invitationid}`)
        membership.parentNode.removeChild(membership)
      }
    }
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noInvitations = doc.getElementById('no-invitations')
    noInvitations.parentNode.removeChild(noInvitations)
  } else {
    const invitationsTable = doc.getElementById('invitations-table')
    invitationsTable.parentNode.removeChild(invitationsTable)
  }
  if (req.data.createdChartDays && req.data.createdChartDays.length) {
    dashboard.HTML.renderList(doc, req.data.createdChartDays, 'chart-column', 'created-chart')
    dashboard.HTML.renderList(doc, req.data.createdChartValues, 'chart-value', 'created-values')
    dashboard.HTML.renderTemplate(doc, req.data.createdChartHighlights, 'metric-highlights', 'created-highlights')
  } else {
    const createdChart = doc.getElementById('created-chart-container')
    createdChart.parentNode.removeChild(createdChart)
  }
  return dashboard.Response.end(req, res, doc)
}
