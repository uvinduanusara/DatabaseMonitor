import { useAppSelector } from "../hooks/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Cpu, Activity, HardDrive } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReactNode } from "react";

export function MetricsGrid() {
  // Pulling live metrics from Redux (Assuming you have a metricsSlice or RTK Query hook)
  const { items: allMetrics } = useAppSelector((state) => state.metrics);
  const { selectedId } = useAppSelector((state) => state.selectedDatabase);

  // Filter metrics based on selected database
  const metrics = selectedId
    ? allMetrics.filter((m) => m.db_id === selectedId)
    : allMetrics;

  // Calculate averages for the StatCards
  const avgCpu =
    metrics.length > 0
      ? (
          metrics.reduce((acc, curr) => acc + curr.cpu, 0) / metrics.length
        ).toFixed(1)
      : "0";

  return (
    <div className="p-8 space-y-8">
      {/* Top Stats - Now Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Avg CPU Usage"
          value={`${avgCpu}%`}
          icon={<Cpu size={16} />}
          color="text-blue-500"
        />
        <MetricCard
          title="Active Connections"
          value={metrics.length.toString()}
          icon={<Activity size={16} />}
          color="text-green-500"
        />
        <MetricCard
          title="System Health"
          value="Optimal"
          icon={<HardDrive size={16} />}
          color="text-yellow-500"
        />
      </div>

      {/* Real-time Line Chart */}
      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader>
          <CardTitle className="text-md font-medium text-slate-300">
            Live Performance (CPU %)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(str) =>
                    new Date(str).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode; // This handles Lucide icons correctly
  trend?: string; // The '?' makes it optional
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <Card className="bg-slate-900/40 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </CardTitle>
        <span className={color}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
