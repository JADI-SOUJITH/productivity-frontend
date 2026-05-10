import { motion } from "framer-motion";

type Props = {
  data: any;
};

function formatTime(ms: number) {
  if (!ms || ms <= 0) return "0m";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function percentDiff(today: number, avg: number | string | null | undefined) {
  if (avg === null || avg === undefined || avg === "N/A") return null;

  const avgNum = Number(avg);
  if (!Number.isFinite(avgNum) || avgNum === 0) return null;

  return Math.abs(((today - avgNum) / avgNum) * 100);
}

function getLabel(improved: boolean, diff: number | null) {
  if (diff === null) return "";

  if (improved) {
    if (diff > 25) return "excellent";
    if (diff > 10) return "good";
    return "better";
  }

  if (diff > 25) return "worst";
  if (diff > 10) return "bad";
  return "worse";
}

export function Comparison({ data }: Props) {
  const avg = data?.averages;

  if (!avg) {
    return (
      <div className="glass p-6 rounded-2xl text-sm text-muted-foreground">
        No average data yet.
      </div>
    );
  }

  const rows = [
    {
      label: "Focus Time",
      today: data.total_time || 0,
      avg: avg.total_time || 0,
      isTime: true,
      betterWhenHigher: true,
    },
    {
      label: "Sessions",
      today: data.sessions || 0,
      avg: Math.round(avg.sessions) || 0,
      isTime: false,
      betterWhenHigher: true,
    },
    {
      label: "Productivity Score",
      today: data.score || 0,
      avg: avg.score || 0,
      isTime: false,
      betterWhenHigher: true,
    },
    {
      label: "Distractions",
      today: data.spikes || 0,
      avg:
        avg.spikes !== undefined &&
        avg.spikes !== null &&
        avg.spikes > 0
          ? Math.round(avg.spikes)
          : "N/A",
      isTime: false,
      betterWhenHigher: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass p-5 sm:p-6"
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold">Today vs Average</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Compare today’s numbers with your normal baseline
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const diff = percentDiff(r.today, r.avg);
          const improved =
            r.betterWhenHigher
              ? typeof r.avg === "number" && r.avg > 0
                ? r.today >= r.avg
                : true
              : typeof r.avg === "number" && r.avg > 0
                ? r.today <= r.avg
                : true;

          const rating = getLabel(improved, diff);
          const arrow = improved ? "↑" : "↓";

          return (
            <div
              key={r.label}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Avg: {r.isTime ? formatTime(Number(r.avg)) : r.avg}
                </p>
              </div>

              <div className="text-right">
                <p className="text-base font-semibold tabular-nums">
                  {r.isTime ? formatTime(r.today) : r.today}
                </p>

                <p
                  className={`text-xs font-medium ${
                    improved ? "text-neon-green" : "text-destructive"
                  }`}
                >
                  {arrow} {rating}{" "}
                  {diff !== null ? `${diff.toFixed(0)}%` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}