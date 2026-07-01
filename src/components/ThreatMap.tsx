import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Shield, ShieldCheck, Activity, Globe, AlertTriangle } from "lucide-react";

interface AttackLog {
  id: string;
  source: string;
  target: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
}

export default function ThreatMap() {
  const [threatLevel, setThreatLevel] = useState("SECURE_NODE");
  const [threatScore, setThreatScore] = useState(12);
  const [totalBlocked, setTotalBlocked] = useState(87291);
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up world map mock nodes
  const locations = [
    { name: "North America (USA)", x: 220, y: 150, color: "text-[#ff2020]" },
    { name: "Europe (Germany)", x: 480, y: 130, color: "text-[#ff2020]" },
    { name: "Asia (Tokyo)", x: 780, y: 170, color: "text-red-500" },
    { name: "South America (Brazil)", x: 330, y: 310, color: "text-rose-500" },
    { name: "Australia (Sydney)", x: 820, y: 350, color: "text-red-500" },
    { name: "Africa (Cape Town)", x: 520, y: 320, color: "text-[#ff2020]" },
  ];

  const attackTypes = [
    "DDoS Buffer Overflow Intercepted",
    "SQL Injection attempt blocked",
    "SSH Port Sweep filtered",
    "XSS Injection Filtered by WAF",
    "Malicious Binary payload dropped",
    "Ransomware Signature Detected",
  ];

  const ips = [
    "185.220.101.5",
    "45.227.254.12",
    "103.204.171.89",
    "92.118.160.11",
    "195.206.105.34",
    "14.139.61.12",
  ];

  const [activeAttacks, setActiveAttacks] = useState<Array<{ id: number; from: typeof locations[0]; to: typeof locations[0] }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const fromNode = locations[Math.floor(Math.random() * locations.length)];
      let toNode = locations[Math.floor(Math.random() * locations.length)];
      while (toNode.name === fromNode.name) {
        toNode = locations[Math.floor(Math.random() * locations.length)];
      }

      const id = Date.now() + Math.random();
      const newAttack = { id, from: fromNode, to: toNode };

      setActiveAttacks((prev) => [...prev.slice(-3), newAttack]);

      const severityOptions: Array<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
      
      const newLog: AttackLog = {
        id: id.toString(),
        source: ips[Math.floor(Math.random() * ips.length)],
        target: toNode.name,
        type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        severity,
        timestamp: new Date().toLocaleTimeString(),
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 8)]);
      setTotalBlocked((prev) => prev + 1);

      setThreatScore((prev) => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(5, Math.min(95, prev + diff));
        if (next > 45) {
          setThreatLevel("PROBING_DETECTED");
        } else if (next > 20) {
          setThreatLevel("GUARD_ACTIVE");
        } else {
          setThreatLevel("SECURE_NODE");
        }
        return next;
      });

    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative rounded-xl border border-slate-900 bg-black/40 p-5 backdrop-blur-md shadow-2xl">
      {/* HUD Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 animate-pulse text-[#ff2020]" />
          <div>
            <h3 className="text-xs font-display font-bold tracking-widest text-slate-200">GLOBAL THREAT INTERCEPTOR</h3>
            <p className="text-[10px] font-mono text-slate-500">REALTIME ATTACK AND DEPLOYED VECTOR WATCH</p>
          </div>
        </div>

        {/* Level indicator */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[9px] font-mono text-slate-500">DEFENSE LEVEL</span>
            <span className={`text-xs font-mono font-black tracking-widest ${threatLevel === "SECURE_NODE" ? "text-red-400" : "text-[#ff2020]"}`}>
              {threatLevel}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-mono text-slate-500">THREAT RATE</span>
            <span className="text-xs font-mono font-black text-red-400">{threatScore}%</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-mono text-slate-500">ATTACKS MITIGATED</span>
            <span className="text-xs font-mono font-black text-white">{totalBlocked.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* World Map SVG Visualizer */}
        <div className="relative col-span-1 flex flex-col items-center justify-center rounded-xl border border-slate-900 bg-black/60 p-4 lg:col-span-2 min-h-[250px] sm:min-h-[350px]">
          {/* Grid lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1212_1px,transparent_1px),linear-gradient(to_bottom,#1f1212_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20"></div>

          {/* Glowing HUD Ring */}
          <div className="absolute -inset-2 rounded-xl bg-red-500/[0.01] blur-xl pointer-events-none"></div>

          <svg viewBox="0 0 1000 450" className="relative z-10 w-full opacity-90 select-none">
            {/* Outline World Map */}
            <g className="fill-slate-800 opacity-20">
              {/* North America */}
              <circle cx="150" cy="110" r="15" />
              <circle cx="210" cy="130" r="25" />
              <circle cx="250" cy="160" r="30" />
              <circle cx="190" cy="190" r="20" />
              {/* South America */}
              <circle cx="320" cy="280" r="18" />
              <circle cx="350" cy="330" r="25" />
              <circle cx="380" cy="380" r="15" />
              {/* Europe */}
              <circle cx="490" cy="110" r="22" />
              <circle cx="530" cy="130" r="28" />
              <circle cx="470" cy="150" r="15" />
              {/* Africa */}
              <circle cx="510" cy="250" r="20" />
              <circle cx="540" cy="290" r="25" />
              <circle cx="560" cy="340" r="15" />
              {/* Asia */}
              <circle cx="680" cy="110" r="25" />
              <circle cx="720" cy="140" r="35" />
              <circle cx="790" cy="150" r="22" />
              <circle cx="740" cy="200" r="30" />
              <circle cx="690" cy="180" r="20" />
              {/* Australia */}
              <circle cx="830" cy="320" r="15" />
              <circle cx="860" cy="350" r="20" />
            </g>

            {/* Simulated attack beams with Framer Motion path animations */}
            {activeAttacks.map((attack) => (
              <g key={attack.id}>
                {/* Arc Line */}
                <motion.path
                  d={`M ${attack.from.x} ${attack.from.y} Q ${(attack.from.x + attack.to.x)/2} ${Math.min(attack.from.y, attack.to.y) - 60} ${attack.to.x} ${attack.to.y}`}
                  fill="none"
                  stroke="url(#attackGradient)"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={{ pathLength: 1, opacity: [0.8, 1, 0] }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                />
                {/* Pulsing Target Dot */}
                <circle cx={attack.to.x} cy={attack.to.y} r="10" className="fill-red-500/10 stroke-red-500/60 animate-ping" />
                <circle cx={attack.to.x} cy={attack.to.y} r="4" className="fill-red-500" />
              </g>
            ))}

            {/* Static Nodes with Labels */}
            {locations.map((loc) => (
              <g key={loc.name} className="cursor-pointer group">
                <circle cx={loc.x} cy={loc.y} r="5" className="fill-[#05070d] stroke-slate-800 stroke-2 group-hover:stroke-[#ff2020] transition-all duration-300" />
                <circle cx={loc.x} cy={loc.y} r="1.5" className="fill-white" />
                <text x={loc.x} y={loc.y - 12} textAnchor="middle" className="fill-slate-600 font-mono text-[9px] font-bold group-hover:fill-red-400 tracking-wider transition-colors">
                  {loc.name.split(" ")[0]}
                </text>
              </g>
            ))}

            {/* SVG Definitions */}
            <defs>
              <linearGradient id="attackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff2020" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Hexagonal decorative watermark pattern */}
          <div className="absolute right-4 bottom-4 flex items-center gap-1 opacity-5">
            <svg className="h-10 w-10 fill-none stroke-current text-red-500" viewBox="0 0 100 100" strokeWidth="4">
              <polygon points="50,15 90,38 90,83 50,100 10,83 10,38" />
            </svg>
          </div>
        </div>

        {/* Real-time event log HUD panel */}
        <div className="flex flex-col rounded-xl border border-slate-900 bg-black/60 p-4 font-mono">
          <div className="mb-2 flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400">SOC INTERCEPT STREAM</span>
            <span className="rounded bg-red-950/40 px-1.5 py-0.5 text-[8px] font-bold text-red-400">MONITOR_ENGAGED</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] sm:max-h-[300px] scrollbar-thin scrollbar-thumb-slate-950">
            {logs.length === 0 ? (
              <div className="flex h-36 flex-col items-center justify-center text-slate-600">
                <Activity className="h-6 w-6 animate-pulse text-slate-800" />
                <span className="mt-2 text-[9px]">Awaiting system telemetry...</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded border border-red-950/20 bg-black/40 p-2 text-[10px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500">{log.timestamp}</span>
                    <span className={`rounded-sm px-1 text-[8px] font-bold ${
                      log.severity === "CRITICAL" ? "bg-red-950/50 text-red-400 border border-red-500/20" :
                      log.severity === "HIGH" ? "bg-rose-950/50 text-rose-400 border border-rose-500/20" :
                      log.severity === "MEDIUM" ? "bg-zinc-900 text-red-400" : "bg-zinc-950 text-slate-400"
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                  <div className="mt-1 flex items-start gap-1">
                    <span className="text-red-500 font-bold">&gt;</span>
                    <p className="leading-tight text-slate-300">
                      Blocked <span className="text-red-400 font-semibold">{log.type}</span> from <span className="text-slate-400 underline decoration-slate-950">{log.source}</span> targeting <span className="text-slate-400">{log.target}</span>.
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 border-t border-slate-900 pt-2 flex items-center justify-between text-[9px] text-slate-500">
            <span>PACKETS INSPECTED: 812K/sec</span>
            <span className="text-red-400 flex items-center gap-1 font-bold">
              <ShieldCheck className="h-3 w-3 text-red-500" /> SSL/TLS DECRYPT ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
