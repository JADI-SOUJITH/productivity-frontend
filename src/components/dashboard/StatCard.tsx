import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  glow?: "green" | "blue" | "purple";
  delay?: number;
};

const glowClasses: Record<NonNullable<StatCardProps["glow"]>, string> = {
  green: "bg-neon-green/15 text-neon-green",
  blue: "bg-neon-blue/15 text-neon-blue",
  purple: "bg-neon-purple/15 text-neon-purple",
};

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  icon: Icon,
  glow = "blue",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="glass p-5 sm:p-6 rounded-2xl h-full"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl sm:text-4xl font-semibold tabular-nums">
            {value}
          </p>

          
        </div>

        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            glowClasses[glow]
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}