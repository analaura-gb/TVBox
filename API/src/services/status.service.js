const os = require('os');

function getPrimaryIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const i of ifaces[name]) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return null;
}

const BOX_ID   = process.env.BOX_ID   || os.hostname();
const BOX_NAME = process.env.BOX_NAME || `TVBox ${os.hostname()}`;

const getStatus = async () => {
  const total = os.totalmem();
  const free  = os.freemem();
  const usedPercent = ((total - free) / total) * 100;

  return {
    boxId: BOX_ID,
    name: BOX_NAME,
    hostname: os.hostname(),
    ip: getPrimaryIPv4(),
    uptimeSec: os.uptime(),
    cpuLoad: os.loadavg(),         
    mem: {
      total,
      free,
      usedPercent: Number(usedPercent.toFixed(2)),
    },
    platform: os.platform(),
  };
};

module.exports = { getStatus };
