const fs = require('fs/promises');

function parseCpuLine(line) {
  const parts = line.trim().split(/\s+/);
  const nums = parts.slice(1).map(n => Number(n));
  const [user, nice, system, idle, iowait, irq, softirq, steal, guest, guestNice] =
    [nums[0], nums[1], nums[2], nums[3], nums[4] || 0, nums[5] || 0, nums[6] || 0, nums[7] || 0, nums[8] || 0, nums[9] || 0];
  const idleAll = idle + iowait;
  const nonIdle = user + nice + system + irq + softirq + steal + guest + guestNice;
  const total = idleAll + nonIdle;
  return { idle: idleAll, total };
}

async function readProcStat() {
  const txt = await fs.readFile('/proc/stat', 'utf8');
  const lines = txt.split('\n').filter(Boolean);

  const agg = parseCpuLine(lines.find(l => l.startsWith('cpu ')));
  const cores = [];

  for (const l of lines) {
    if (/^cpu\d+ /.test(l)) cores.push(parseCpuLine(l));
  }
  return { agg, cores };
}

function computeDelta(a, b) {
  const dTotal = b.total - a.total;
  const dIdle  = b.idle  - a.idle;
  const busy = dTotal > 0 ? 1 - (dIdle / dTotal) : 0;
  return Math.max(0, Math.min(1, busy)); // 0..1
}

async function sampleOnce(sampleWindowMs = 250) {
  const a = await readProcStat();
  await new Promise(r => setTimeout(r, sampleWindowMs));
  const b = await readProcStat();

  const cpuPercent = computeDelta(a.agg, b.agg) * 100;
  const perCorePercent = a.cores.map((c, i) => computeDelta(a.cores[i], b.cores[i]) * 100);

  return {
    cpuPercent: Number(cpuPercent.toFixed(1)),
    perCorePercent: perCorePercent.map(p => Number(p.toFixed(1))),
    cores: perCorePercent.length,
  };
}

function startSampler(periodMs = 1000, sampleWindowMs = 250) {
  let last = { cpuPercent: 0, perCorePercent: [], cores: 0 };
  let stopped = false;

  (async function loop() {
    while (!stopped) {
      try {
        last = await sampleOnce(sampleWindowMs);
      } catch (_) { }
      await new Promise(r => setTimeout(r, periodMs));
    }
  })();

  return {
    get() { return last; },
    stop() { stopped = true; }
  };
}

module.exports = { sampleOnce, startSampler };
