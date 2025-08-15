import TVBoxCard from '../components/TVBoxCard';
import useTvboxSockets from '../services/useTvboxSockets';

export default function Dashboard() {
  const items = useTvboxSockets();

  return (
    <div className="w-full min-h-screen px-8 py-4 bg-black text-white">
      <h1 className="text-4xl font-bold mb-6 text-center text-green-400">
        Monitoramento das TVBoxes
      </h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        {items.map((box) => {
          const online = !box.error;
          const cpuText = box.cpuLoad ? `${(box.cpuLoad[0] * 100).toFixed(1)}%` : '—';
          const memText = box.mem
            ? `${(((box.mem.total - box.mem.free) / 1024) / 1024).toFixed(0)}MB`
            : '—';

          return (
            <TVBoxCard
              key={box.boxId || box.baseUrl}
              box={{
                id: box.boxId,
                name: box.name,
                status: online ? 'online' : 'offline',
                users: box.wsClients ?? 0,
                cpu: cpuText,
                memory: memText,
                ip: box.ip || '—',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
