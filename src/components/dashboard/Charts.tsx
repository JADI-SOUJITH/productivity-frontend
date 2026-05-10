import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  name: string;
  value: number;
};

type HourPoint = {
  hour: string;
  value: number;
};

type TopSitesChartProps = {
  data?: Point[];
};

type CategoryChartProps = {
  data?: Point[];
};

type HourlyChartProps = {
  data?: HourPoint[];
};

const COLORS = ["#39ff88", "#22d3ee", "#c084fc", "#f472b6", "#94a3b8"];

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-white">
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
}

export function TopSitesChart({ data = [] }: TopSitesChartProps) {
  if (!data.length) return <EmptyState text="No top sites yet." />;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="topSitesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39ff88" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload;

              return (
                <div className="rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
                  <p className="text-sm font-medium text-white">
                    min: {item.value}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill="url(#topSitesGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({ data = [] }: CategoryChartProps) {
  if (!data.length) return <EmptyState text="No category data yet." />;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-[320px] w-full grid grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)] items-center gap-4 overflow-hidden">
      <div className="w-[170px] h-[170px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={64}
              paddingAngle={2}
              stroke="#0b0f19"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                const pct = total ? Math.round((item.value / total) * 100) : 0;

                return (
                  <div className="rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.value} min · {pct}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full min-w-0 space-y-3 pr-3">
        {data.map((item, index) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;

          return (
            <div
              key={item.name}
              className="grid grid-cols-[14px_minmax(0,1fr)_36px] items-center gap-3 min-w-0"
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-foreground/80 min-w-0 truncate">
                {item.name}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums text-right shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HourlyChart({ data = [] }: HourlyChartProps) {
  if (!data.length) return <EmptyState text="No hourly data yet." />;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="hourLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-sm font-medium text-white">
                    Productivity: {payload[0].value}%
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#hourLine)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}