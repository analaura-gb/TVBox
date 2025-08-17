const os = require('os');
const { getPrimaryIPv4 } = require('../utils/net');
const cfg = require('../config/env');
const { sampleOnce } = require('./cpuInstant');

const CORES = os.cpus()?.length || 1;

//Identifica memória, ip, cpuLoad, cores
async function buildMetrics(opts = {}) {
  const total = os.totalmem();
  const free  = os.freemem();

  const base = {
    boxId: cfg.BOX_ID || os.hostname(),
    name:  cfg.BOX_NAME || `TVBox ${os.hostname()}`,
    hostname: os.hostname(),
    ip: getPrimaryIPv4(),
    uptimeSec: os.uptime(),
    cpuLoad: os.loadavg(),   // loadavg (1/5/15min)
    cores: CORES,
    mem: {
      total,
      free,
      usedPercent: Number((((total - free)/total) * 100).toFixed(2)),
    },
    platform: os.platform(),
    timestamp: Date.now(),
  };

  if (opts.withInstant) {
    const s = await sampleOnce(opts.instantWindowMs || 250);
    base.cpuPercent = s.cpuPercent;
  }
  return base;
}

module.exports = { buildMetrics, CORES };
