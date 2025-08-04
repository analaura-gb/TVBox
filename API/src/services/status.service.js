const os = require('os');

const getStatus = async() => {
  return {
    uptime: os.uptime(),
    cpuUsage: os.loadavg(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem(),
    platform: os.platform()
  };
}

module.exports = {
  getStatus
};
