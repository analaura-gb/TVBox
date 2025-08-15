import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function TimeSeriesChart({
  title,
  data,       
  yLabel = '',
  max = 100,   
}) {
  return (
    <div className="h-48 rounded bg-gray-800 p-3">
      <div className="text-sm text-gray-300 mb-2">{title}</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis dataKey="t" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, max]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151"}}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#e5e7eb" }}
            formatter={(v) => [`${v.toFixed(1)}${yLabel}`, "valor"]}
          />
          <Line
            type="monotone"
            dataKey="v"
            dot={false}
            stroke="#22c55e"    
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
