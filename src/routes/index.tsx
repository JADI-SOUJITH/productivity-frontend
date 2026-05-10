import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Flame,
  Gauge,
  Layers,
  Repeat,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  TopSitesChart,
  CategoryChart,
  HourlyChart,
} from "@/components/dashboard/Charts";
import { AICoach } from "@/components/dashboard/AICoach";
import { Comparison } from "@/components/dashboard/Comparison";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "AI Productivity Analyzer — Dashboard" },
      {
        name: "description",
        content:
          "Track focus, sessions, and productivity insights with an AI coach.",
      },
    ],
  }),
});

type ApiResponse = {
  total_time: number;
  sessions: number;
  score: number;
  top_sites: [string, number][];
  categories: Record<string, number>;
  metrics: {
    avg_session: number;
    switch_rate: number;
    focus_score: number;
  };
  spikes: number;
  longest_focus: number; // seconds
  peak_hour: number | null;
  low_hour: number | null;
  hourly: Record<string, number>;
  averages?: {
    total_time: number;
    sessions: number;
    score: number;
  };
};

function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatSec(sec: number) {
  return formatMs(sec * 1000);
}

function formatHour(hour: number | null) {
  if (hour === null || Number.isNaN(hour)) return "—";
  return `${hour.toString().padStart(2, "0")}:00`;
}

function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    fetch("https://productivity-backend-wayz.onrender.com/data", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: ApiResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load data");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const chartTopSites = useMemo(
    () =>
      (data?.top_sites || []).map(([name, value]) => ({
        name,
        value: Math.round(value / 1000 / 60),
      })),
    [data]
  );

  const chartCategories = useMemo(
    () =>
      Object.entries(data?.categories || {}).map(([name, value]) => ({
        name,
        value: Math.round(value / 1000 / 60),
      })),
    [data]
  );

  const currentHour = new Date().getHours();

const chartHourly = useMemo(
  () =>
    Object.entries(data?.hourly_score || {})
      .map(([hour, value]) => ({
        hourNum: Number(hour),
        hour: `${hour.padStart(2, "0")}h`,
        value: Number(value),
      }))
      .filter((point) => point.hourNum <= currentHour)
      .sort((a, b) => a.hourNum - b.hourNum)
      .map(({ hour, value }) => ({ hour, value })),
  [data]
);
  

  const TopSitesChartAny = TopSitesChart as React.ComponentType<any>;
  const CategoryChartAny = CategoryChart as React.ComponentType<any>;
  const HourlyChartAny = HourlyChart as React.ComponentType<any>;
  const AICoachAny = AICoach as React.ComponentType<any>;
  const ComparisonAny = Comparison as React.ComponentType<any>;

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-8">
        <div className="glass p-6 rounded-2xl max-w-xl w-full">
          <h1 className="text-xl font-semibold mb-2">Could not load dashboard</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-3">
            Make sure your Flask backend is running on{" "}
            <code>http://127.0.0.1:5001/data</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-8">
        <div className="glass p-6 rounded-2xl">
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[oklch(0.86_0.22_150)] via-[oklch(0.78_0.18_230)] to-[oklch(0.72_0.22_305)] ring-glow-purple">
              <Activity className="h-6 w-6 text-[oklch(0.16_0.025_265)]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                AI Productivity Analyzer
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your focus, behavior, and momentum — distilled by AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="glass px-4 py-2 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-green animate-float-pulse" />
              Live · Today
            </div>
            <button
              onClick={() => window.print()}
              className="glass glass-hover px-4 py-2 text-xs font-medium"
            >
              Export Report
            </button>
          </div>
        </motion.header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
          <StatCard
            label="Total Time"
            value={formatMs(data.total_time)}
            delta={
              data.averages
                ? `${data.total_time >= data.averages.total_time ? "↑" : "↓"} vs avg`
                : ""
            }
            trend={
              data.averages && data.total_time >= data.averages.total_time
                ? "up"
                : "down"
            }
            icon={Clock}
            glow="green"
            delay={0.05}
          />

          <StatCard
            label="Sessions"
            value={String(data.sessions)}
            delta={
              data.averages
                ? `${data.sessions >= data.averages.sessions ? "↑" : "↓"} vs avg`
                : ""
            }
            trend={
              data.averages && data.sessions >= data.averages.sessions ? "up" : "down"
            }
            icon={Layers}
            glow="blue"
            delay={0.1}
          />

          <StatCard
            label="Productivity Score"
            value={data.score.toFixed(2)}
            delta={
              data.averages
                ? `${data.score >= data.averages.score ? "↑" : "↓"} vs avg`
                : ""
            }
            trend={
              data.averages && data.score >= data.averages.score ? "up" : "down"
            }
            icon={Gauge}
            glow="purple"
            delay={0.15}
          />
    
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
          <ChartCard
            title="Top Sites"
            subtitle="Minutes spent today"
            delay={0.2}
            className="lg:col-span-2"
          >
            <TopSitesChartAny data={chartTopSites} />
          </ChartCard>

          <ChartCard
            title="Category Breakdown"
            subtitle="Where your time went"
            delay={0.25}
          >
            <CategoryChartAny data={chartCategories} />
          </ChartCard>
        </section>

        <section className="mb-6">
          <ChartCard
            title="Time Insights"
            subtitle="Productivity by hour"
            delay={0.3}
          >
            <HourlyChartAny data={chartHourly} />
          </ChartCard>
        </section>

        {/* Behavior insights */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <StatCard
            label="Avg Session"
            value={formatMs(data.metrics.avg_session)}
            icon={Timer}
            glow="blue"
            delay={0.32}
          />
          <StatCard
            label="Tab Switches"
            value={`${data.metrics.switch_rate.toFixed(1)} / hr`}
            icon={Repeat}
            glow="purple"
            delay={0.36}
          />
          <StatCard
            label="Focus Score"
            value={`${data.metrics.focus_score.toFixed(1)}`}
            icon={Target}
            glow="green"
            delay={0.4}
          />
          <StatCard
            label="Longest Focus"
            value={formatSec(data.longest_focus)}
            icon={Flame}
            glow="purple"
            delay={0.44}
          />
        </section>

        {/* AI Coach + Comparison */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
          <AICoachAny
            data={{
              ...data,
              top_sites: chartTopSites,
              categories: chartCategories,
              hourly: chartHourly,
              peak_hour: formatHour(data.peak_hour),
              low_hour: formatHour(data.low_hour),
            }}
          />
          <Comparison data={data} />
        </section>

        <footer className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            All systems tracking · Updated just now
          </p>
          <p>© AI Productivity Analyzer</p>
        </footer>
      </div>
    </div>
  );
}