import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SitePoint = { name: string; value: number };

type DashboardData = {
  total_time?: number;
  sessions?: number;
  score?: number;
  // AICoach receives the chart-transformed version: [{name, value}]
  top_sites?: SitePoint[] | [string, number][];
  categories?: Record<string, number> | { name: string; value: number }[];
  metrics?: {
    avg_session?: number;
    switch_rate?: number;
    focus_score?: number;
  };
  spikes?: number;
  longest_focus?: number;
  peak_hour?: number | string | null;
  low_hour?: number | string | null;
};

type Message = {
  role: "assistant" | "user";
  text: string;
};

type AICoachProps = {
  data?: DashboardData;
};

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// Handles both [{name, value}] and [[string, number]] shapes
function getTopSiteName(top_sites?: DashboardData["top_sites"]): string {
  if (!top_sites || top_sites.length === 0) return "—";
  const first = top_sites[0];
  if (Array.isArray(first)) {
    // tuple shape [string, number]
    return String(first[0]) || "—";
  }
  // object shape {name, value}
  return (first as SitePoint).name || "—";
}

function cleanReply(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function buildStarterText(data?: DashboardData): string {
  if (!data || !data.total_time) {
    return "Connect the backend and I'll start analyzing your day.";
  }

  const topSite = getTopSiteName(data.top_sites);
  const score   = Number(data.score ?? 0).toFixed(2);
  const focus   = (data.metrics?.focus_score ?? 0).toFixed(1);
  const rate    = (data.metrics?.switch_rate ?? 0).toFixed(1);
  const spikes  = data.spikes ?? 0;
  const longest = formatTime((data.longest_focus ?? 0) * 1000);

  return [
    `📊 Today so far: ${formatTime(data.total_time)}`,
    `⚡ Score: ${score}%`,
    `🌐 Top site: ${topSite}`,
    `🎯 Focus: ${focus}/100`,
    `🔄 Switch rate: ${rate}/hr`,
    `⚠️ Distractions: ${spikes}`,
    `🔥 Longest focus: ${longest}`,
  ].join("\n");
}

function buildFallbackReply(data?: DashboardData): string {
  if (!data) return "Could not load your stats right now.";

  const score  = Number(data.score ?? 0);
  const focus  = Number(data.metrics?.focus_score ?? 0);
  const spikes = Number(data.spikes ?? 0);
  const topSite = getTopSiteName(data.top_sites);

  const summary =
    score >= 80 ? "Nice — today looks strong 🔥" :
    score >= 60 ? "Pretty good day overall." :
                  "Today looks a bit rough.";

  const tip =
    spikes > 100
      ? "Your tab switching is very high — try committing to one tab for 25 min blocks."
      : "Keep your focus blocks a bit longer to push that score up.";

  return `${summary}\n🌐 Top site: ${topSite}\n🎯 Focus score: ${focus.toFixed(1)}/100\n💡 ${tip}`;
}

export function AICoach({ data }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: buildStarterText(data) },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([{ role: "assistant", text: buildStarterText(data) }]);
  }, [data]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      fetch("https://productivity-backend-wayz.onrender.com/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, data }),
      });

      const json = await res.json().catch(() => ({}));
      const reply = cleanReply(json.reply || "I didn't get a reply from Gemini.");

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: buildFallbackReply(data) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass p-5 sm:p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[oklch(0.72_0.22_305)] to-[oklch(0.78_0.18_230)] ring-glow-purple">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold">AI Coach</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-float-pulse" />
            Live analysis
          </p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-3 border ${
                msg.role === "user"
                  ? "bg-white/[0.05] border-white/10"
                  : "bg-white/[0.03] border-white/5"
              }`}
            >
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-xs text-muted-foreground px-1 animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-5 flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-neon-purple/50 transition-colors">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="h-9 w-9 rounded-lg bg-gradient-to-br from-[oklch(0.72_0.22_305)] to-[oklch(0.78_0.18_230)] flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    </motion.div>
  );
}
