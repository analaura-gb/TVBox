const { buildMetrics } = require('../metrics/metrics');

async function getStatus({ instant = false } = {}) {
  return buildMetrics({ withInstant: instant, instantWindowMs: 250 }); //Função para retornar as metricas
}
module.exports = { getStatus };
