const dashboard = require('@layeredapps/dashboard')
module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  // organizations-created chart
  req.query.keys = dashboard.Metrics.metricKeys('organizations-created', 90).join(',')
  const organizationsChart = await global.api.administrator.MetricKeys.get(req)
  const organizationsChartMaximum = dashboard.Metrics.maximumDay(organizationsChart)
  const organizationsChartDays = dashboard.Metrics.days(organizationsChart, organizationsChartMaximum)
  const organizationsChartHighlights = dashboard.Metrics.highlights(organizationsChart, organizationsChartDays)
  const organizationsChartValues = [
    { object: 'object', value: organizationsChartMaximum },
    { object: 'object', value: Math.floor(organizationsChartMaximum * 0.75) },
    { object: 'object', value: Math.floor(organizationsChartMaximum * 0.5) },
    { object: 'object', value: Math.floor(organizationsChartMaximum * 0.25) },
    { object: 'object', value: 0 }
  ]
  // memberships-created chart
  req.query.keys = dashboard.Metrics.metricKeys('memberships-created', 90).join(',')
  const membershipsChart = await global.api.administrator.MetricKeys.get(req)
  const membershipsChartMaximum = dashboard.Metrics.maximumDay(membershipsChart)
  const membershipsChartDays = dashboard.Metrics.days(membershipsChart, membershipsChartMaximum)
  const membershipsChartHighlights = dashboard.Metrics.highlights(membershipsChart, membershipsChartDays)
  const membershipsChartValues = [
    { object: 'object', value: membershipsChartMaximum },
    { object: 'object', value: Math.floor(membershipsChartMaximum * 0.75) },
    { object: 'object', value: Math.floor(membershipsChartMaximum * 0.5) },
    { object: 'object', value: Math.floor(membershipsChartMaximum * 0.25) },
    { object: 'object', value: 0 }
  ]
  // invitations-created chart
  req.query.keys = dashboard.Metrics.metricKeys('invitations-created', 90).join(',')
  const invitationsChart = await global.api.administrator.MetricKeys.get(req)
  const invitationsChartMaximum = dashboard.Metrics.maximumDay(invitationsChart)
  const invitationsChartDays = dashboard.Metrics.days(invitationsChart, invitationsChartMaximum)
  const invitationsChartHighlights = dashboard.Metrics.highlights(invitationsChart, invitationsChartDays)
  const invitationsChartValues = [
    { object: 'object', value: invitationsChartMaximum },
    { object: 'object', value: Math.floor(invitationsChartMaximum * 0.75) },
    { object: 'object', value: Math.floor(invitationsChartMaximum * 0.5) },
    { object: 'object', value: Math.floor(invitationsChartMaximum * 0.25) },
    { object: 'object', value: 0 }
  ]
  req.data = { organizationsChartDays, organizationsChartHighlights, organizationsChartValues, membershipsChartDays, membershipsChartHighlights, membershipsChartValues, invitationsChartDays, invitationsChartHighlights, invitationsChartValues }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  let hasChart = false
  if (req.data.organizationsChartDays && req.data.organizationsChartDays.length) {
    dashboard.HTML.renderList(doc, req.data.organizationsChartDays, 'chart-column', 'organizations-chart')
    dashboard.HTML.renderList(doc, req.data.organizationsChartValues, 'chart-value', 'organizations-values')
    dashboard.HTML.renderTemplate(doc, req.data.organizationsChartHighlights, 'metric-highlights', 'organizations-highlights')
    hasChart = true
  } else {
    const organizationsChart = doc.getElementById('organizations-chart-container')
    organizationsChart.parentNode.removeChild(organizationsChart)
  }
  if (req.data.membershipsChartDays && req.data.membershipsChartDays.length) {
    dashboard.HTML.renderList(doc, req.data.membershipsChartDays, 'chart-column', 'memberships-chart')
    dashboard.HTML.renderList(doc, req.data.membershipsChartValues, 'chart-value', 'memberships-values')
    dashboard.HTML.renderTemplate(doc, req.data.membershipsChartHighlights, 'metric-highlights', 'memberships-highlights')
    hasChart = true
  } else {
    const membershipsChart = doc.getElementById('memberships-chart-container')
    membershipsChart.parentNode.removeChild(membershipsChart)
  }
  if (req.data.invitationsChartDays && req.data.invitationsChartDays.length) {
    dashboard.HTML.renderList(doc, req.data.invitationsChartDays, 'chart-column', 'invitations-chart')
    dashboard.HTML.renderList(doc, req.data.invitationsChartValues, 'chart-value', 'invitations-values')
    dashboard.HTML.renderTemplate(doc, req.data.invitationsChartHighlights, 'metric-highlights', 'invitations-highlights')
    hasChart = true
  } else {
    const invitationsChart = doc.getElementById('invitations-chart-container')
    invitationsChart.parentNode.removeChild(invitationsChart)
  }
  if (hasChart) {
    const noOrganizations = doc.getElementById('no-organizations')
    noOrganizations.parentNode.removeChild(noOrganizations)
  }
  return dashboard.Response.end(req, res, doc)
}
