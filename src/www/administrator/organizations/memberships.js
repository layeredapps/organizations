const dashboard = require('@layeredapps/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.organizations.MembershipsCount.get(req)
  const memberships = await global.api.administrator.organizations.Memberships.get(req)
  if (memberships && memberships.length) {
    for (const membership of memberships) {
      membership.createdAtFormatted = dashboard.Format.date(membership.createdAt)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  let createdChartDays, createdChartHighlights, createdChartValues
  if (offset === 0) {
    req.query.keys = dashboard.Metrics.metricKeys('memberships-created', 365).join(',')
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
  req.data = { memberships, total, offset, createdChartDays, createdChartHighlights, createdChartValues }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  const removeElements = []
  if (req.data.memberships && req.data.memberships.length) {
    const removeFields = [].concat(global.profileFields)
    const usedFields = []
    for (const membership of req.data.memberships) {
      for (const field of removeFields) {
        if (usedFields.indexOf(field) > -1) {
          continue
        }
        if (field === 'full-name') {
          if (membership.firstName && usedFields.indexOf(field) === -1) {
            usedFields.push(field)
          }
          continue
        }
        const displayName = global.profileFieldMap[field]
        if (membership[displayName] && usedFields.indexOf(field) === -1) {
          usedFields.push(field)
        }
      }
    }
    for (const field of removeFields) {
      if (usedFields.indexOf(field) === -1) {
        removeElements.push(field)
      }
    }
    dashboard.HTML.renderTable(doc, req.data.memberships, 'membership-row', 'memberships-table')
    for (const membership of req.data.memberships) {
      for (const field of removeFields) {
        if (usedFields.indexOf(field) === -1) {
          removeElements.push(`${field}-${membership.membershipid}`)
        }
      }
    }
    if (req.data.total <= global.pageSize) {
      removeElements.push('page-links')
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    removeElements.push('no-memberships')
  } else {
    removeElements.push('memberships-table')
  }
  if (req.data.createdChartDays && req.data.createdChartDays.length) {
    dashboard.HTML.renderList(doc, req.data.createdChartDays, 'chart-column', 'created-chart')
    dashboard.HTML.renderList(doc, req.data.createdChartValues, 'chart-value', 'created-values')
    dashboard.HTML.renderTemplate(doc, req.data.createdChartHighlights, 'metric-highlights', 'created-highlights')
  } else {
    removeElements.push('created-chart-container')
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
