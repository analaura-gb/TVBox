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

function buildMetrics() {
  const total = os.totalmem();
  const free = os.freemem();
  const usedPercent = ((total - free) / total) * 100;

  return {
    boxId: (process.env.BOX_ID || os.hostname()).trim(),
    name: (process.env.BOX_NAME || `TVBox ${os.hostname()}`).trim(),
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
    timestamp: Date.now(),
  };
}

module.exports = function setupSocketIO(server) {
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  let connected = 0;

  io.on('connection', (socket) => {
    connected++;
    const send = () => socket.emit('metrics', { ...buildMetrics(), wsClients: connected });
    send();

    const timer = setInterval(send, 2000);

    socket.on('disconnect', () => {
      clearInterval(timer);
      connected--;
    });
  });

  return io;
};
