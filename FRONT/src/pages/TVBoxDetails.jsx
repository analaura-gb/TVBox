import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { tvboxes } from "../services/tvboxes";
import axios from "axios";
import { io } from "socket.io-client";
import TimeSeriesChart from "../components/TimeSeriesChart";

function fmtUptime(sec = 0) {
  const s = Math.floor(sec), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}
function fmtMemMB(total, free) {
  if (!total || free == null) return "—";
  const used = (total - free) / (1024 * 1024);
  return `${used.toFixed(0)}MB`;
}

function cpuPercentFromPayload(p) {
  if (typeof p?.cpuPercent === "number") return p.cpuPercent;
  const cores = p?.cores || 4;
  const l1 = Array.isArray(p?.cpuLoad) ? p.cpuLoad[0] : 0;
  const pct = (l1 / cores) * 100;
  return Math.max(0, Math.min(100, pct));
}
function memPercentFromPayload(p) {
  if (typeof p?.mem?.usedPercent === "number") return p.mem.usedPercent;
  if (p?.mem?.total && p?.mem?.free != null) {
    return ((p.mem.total - p.mem.free) / p.mem.total) * 100;
  }
  return 0;
}

export default function TVBoxDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const meta = useMemo(() => tvboxes.find(b => String(b.id) === String(id)), [id]);

  const [status,   setStatus]   = useState(null);
  const [online,   setOnline]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [cpuSeries, setCpuSeries] = useState([]);
  const [ramSeries, setRamSeries] = useState([]);
  const socketRef = useRef(null);
  const MAX_POINTS = 60;

  useEffect(() => {
    if (!meta) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${meta.baseUrl}/api/status`, { timeout: 3000 });
        if (!mounted) return;
        setStatus(data);
        setOnline(true);

        const t = new Date().toLocaleTimeString();
        const cpuV = cpuPercentFromPayload(data);
        const ramV = memPercentFromPayload(data);
        setCpuSeries([{ t, v: cpuV }]);
        setRamSeries([{ t, v: ramV }]);
      } catch {
        if (!mounted) return;
        setOnline(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [meta]);

  useEffect(() => {
    if (!meta) return;
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    const s = io(meta.baseUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = s;

    s.on("connect", () => setOnline(true));
    s.on("disconnect", () => setOnline(false));
    s.on("metrics", (payload) => {
      setStatus(payload);
      setOnline(true);

      const t = new Date().toLocaleTimeString();
      const cpuV = cpuPercentFromPayload(payload);
      const ramV = memPercentFromPayload(payload);

      setCpuSeries(prev => {
        const next = [...prev, { t, v: cpuV }];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      });
      setRamSeries(prev => {
        const next = [...prev, { t, v: ramV }];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      });
    });
    s.on("connect_error", () => setOnline(false));

    return () => {
      s.close();
      socketRef.current = null;
    };
  }, [meta]);

  if (!meta) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <p className="mb-4">TVBox não encontrada.</p>
        <Link className="text-green-400 underline" to="/">Voltar</Link>
      </div>
    );
  }

  const border = online ? "border-green-500" : "border-red-500";

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
        >
          ← Voltar
        </button>

        <div className={`p-6 rounded-xl bg-gray-900 border-2 ${border} shadow-xl`}>
          <h1 className="text-3xl font-bold mb-4">
            {status?.name || meta.name} <span className="text-sm text-gray-400">({meta.id})</span>
          </h1>

          {loading && <p className="text-gray-400">Carregando…</p>}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                Status:{" "}
                <span className={online ? "text-green-400" : "text-red-400"}>
                  {online ? "online" : "offline"}
                </span>
              </p>
              <p>IP: {status?.ip || "—"}</p>
              <p>Hostname: {status?.hostname || "—"}</p>
              <p>Uptime: {status?.uptimeSec != null ? fmtUptime(status.uptimeSec) : "—"}</p>
            </div>

            <div className="space-y-2">
              <p>
                CPU (loadavg):{" "}
                {status?.cpuLoad ? status.cpuLoad.map(n => (n * 100).toFixed(1)).join(" / ") + "%" : "—"}
              </p>
              <p>
                RAM usada:{" "}
                {status?.mem ? fmtMemMB(status.mem.total, status.mem.free) : "—"}
                {status?.mem?.usedPercent != null && (
                  <> ({status.mem.usedPercent.toFixed(1)}%)</>
                )}
              </p>
              {status?.wsUsers != null && <p>Usuários conectados: {status.wsClients}</p>}
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            <TimeSeriesChart title="CPU (%)" data={cpuSeries} yLabel="%" max={100} />
            <TimeSeriesChart title="RAM usada (%)" data={ramSeries} yLabel="%" max={100} />
          </div>
        </div>
      </div>
    </div>
  );
}
