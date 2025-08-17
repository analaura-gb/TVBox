const { Server } = require('socket.io');
const { startSampler } = require('../metrics/cpuInstant');
const { buildMetrics } = require('../metrics/metrics');

function normalizeRole(q) {
  let r = q?.role;
  if (Array.isArray(r)) r = r[0];
  r = (r || 'user').toString().toLowerCase();
  return (r === 'admin' || r === 'user') ? r : 'user';
}

module.exports = function setupSocketIO(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
    pingInterval: 25_000,
    pingTimeout: 60_000,
    maxHttpBufferSize: 1e6,
  });

  const counters = { total: 0, byRole: { user: 0, admin: 0 } };

  const sampler = startSampler(1000, 250);

  const BROADCAST_MS = 3000;
  const broadcastTimer = setInterval(async () => {
    try {
      const base = await buildMetrics({ withInstant: false }); 
      const instant = sampler.get(); 

      io.emit('metrics', {
        ...base,
        cpuPercent: instant.cpuPercent ?? null,
        wsClients: counters.total,
        wsUsers: counters.byRole.user || 0,
      });
    } catch (err) {
      console.debug('broadcast error', err);
    }
  }, BROADCAST_MS);
  broadcastTimer.unref();

  io.on('connection', async (socket) => {
    const role = normalizeRole(socket.handshake.query);
    counters.total += 1;
    counters.byRole[role] = (counters.byRole[role] || 0) + 1;

    try {
      const base = await buildMetrics({ withInstant: false });
      const instant = sampler.get();

      socket.emit('metrics', {
        ...base,
        cpuPercent: instant.cpuPercent ?? null,
        wsClients: counters.total,
        wsUsers: counters.byRole.user || 0,
      });
    } catch (_) {}

    socket.on('disconnect', () => {
      counters.total = Math.max(0, counters.total - 1);
      counters.byRole[role] = Math.max(0, (counters.byRole[role] || 1) - 1);
    });
  });

  io.on('close', () => clearInterval(broadcastTimer));

  return io;
};
