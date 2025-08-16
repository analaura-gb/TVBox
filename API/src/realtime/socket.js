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

  const counters = {
    total: 0,
    byRole: { user: 0, admin: 0, other: 0 },
  };

  function normalizeRole(q) {
    let r = q?.role;
    if (Array.isArray(r)) r = r[0];
    r = (r || 'user').toString().toLowerCase();
    if (r !== 'user' && r !== 'admin') r = 'user';
    return r;
  }

  const BROADCAST_MS = 2000;
  setInterval(() => {
    const metrics = buildMetrics();
    io.emit('metrics', {
      ...metrics,
      wsClients: counters.total,            
      wsUsers: counters.byRole.user || 0,  
    });
  }, BROADCAST_MS);

  io.on('connection', (socket) => {
    const role = normalizeRole(socket.handshake.query);

    counters.total += 1;
    counters.byRole[role] = (counters.byRole[role] || 0) + 1;
    
    socket.emit('metrics', {
      ...buildMetrics(),
      wsClients: counters.total,
      wsUsers: counters.byRole.user || 0,
    });

    socket.on('disconnect', () => {
      counters.total = Math.max(0, counters.total - 1);
      counters.byRole[role] = Math.max(0, (counters.byRole[role] || 1) - 1);
    });
  });

  return io;
};
