import TVBoxCard from '../components/TVBoxCard';
import useTvboxSockets from '../services/useTvboxSockets';
import { tvboxes } from '../services/tvboxes';

export default function Dashboard() {
  const byId = useTvboxSockets();

  return (
    <div className="w-full min-h-screen px-8 py-4 bg-black text-white">
      <h1 className="text-4xl font-bold mb-6 text-center text-green-400">
        Monitoramento das TVBoxes
      </h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        {tvboxes.map((meta) => {
          const d = byId[meta.id];              // dados da box (se houver)
          const online = d && !d.error;
          const cpuText = d?.cpuLoad
            ? `${(d.cpuLoad[0] * 100).toFixed(1)}%`
            : '—';
          const memText = d?.mem
            ? `${(((d.mem.total - d.mem.free) / 1024) / 1024).toFixed(0)}MB`
            : '—';

          return (
            <TVBoxCard
              key={meta.id}
              box={{
                id: meta.id,
                name: meta.name,
                status: online ? 'online' : 'offline',
                users: d?.wsClients ?? 0,
                cpu: cpuText,
                memory: memText,
                ip: d?.ip ?? '—',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
