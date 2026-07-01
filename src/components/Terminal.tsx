import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, ShieldAlert, CheckCircle, Cpu, RefreshCw, Send } from "lucide-react";

interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "success" | "warning" | "info";
  timestamp: string;
}

export default function Terminal() {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: "REXDEVCYBER SOC CLI [v4.2.0]", type: "info", timestamp: "17:20:57" },
    { text: "Establishing secure SSL connection to REXDEVCYBER defense core...", type: "info", timestamp: "17:20:57" },
    { text: "CONNECTION SECURE. DEFENSE SYSTEM: ACTIVE. FIREWALL: SHIELD_MAX_STRENGTH.", type: "success", timestamp: "17:20:58" },
    { text: "Type 'help' to review available military-grade cybersecurity commands.", type: "warning", timestamp: "17:20:58" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = {
    help: "List all military-grade utility commands.",
    about: "Get the REXDEVCYBER origin dossier.",
    projects: "Examine active open-source cyber projects and security scripts.",
    "scan <domain/ip>": "Trigger a custom network scan and get an AI vulnerability assessment.",
    "ai <query>": "Ask the REXDEVCYBER AI Defense Assistant any security question.",
    decrypt: "Execute security integrity decryption check.",
    status: "Query defense mesh system integrity status and firewall telemetry.",
    clear: "Purge active console workspace.",
    exit: "Disconnect current SOC terminal session.",
  };

  const trimmedInput = inputVal.trim().toLowerCase();
  const availableCommandKeys = Object.keys(commands);
  const matchedSuggestions = trimmedInput
    ? availableCommandKeys.filter((cmd) => {
        const cmdBase = cmd.split(" ")[0];
        return cmdBase.startsWith(trimmedInput);
      })
    : [];

  // Reset active index when suggestions list changes
  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [matchedSuggestions.length]);

  const handleSuggestionClick = (cmd: string) => {
    const cmdBase = cmd.split(" ")[0];
    setInputVal(cmdBase + " ");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matchedSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev + 1) % matchedSuggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev - 1 + matchedSuggestions.length) % matchedSuggestions.length);
      } else if (e.key === "Tab") {
        e.preventDefault();
        const selectedCmd = matchedSuggestions[activeSuggestionIndex];
        const cmdBase = selectedCmd.split(" ")[0];
        setInputVal(cmdBase + " ");
      }
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addLine = (text: string, type: TerminalLine["type"] = "output") => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory((prev) => [...prev, { text, type, timestamp }]);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commandText = inputVal.trim();
    if (!commandText) return;

    addLine(`rex@cyber:~# ${commandText}`, "input");
    setInputVal("");
    setLoading(true);

    const parts = commandText.split(" ");
    const primaryCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (primaryCmd) {
      case "help":
        addLine("=================================================================", "info");
        addLine("REXDEVCYBER SECURE CONSOLE SYSTEM UTILITY INTERFACE", "success");
        addLine("=================================================================", "info");
        Object.entries(commands).forEach(([cmd, desc]) => {
          addLine(`  ${cmd.padEnd(20)} - ${desc}`, "output");
        });
        addLine("=================================================================", "info");
        setLoading(false);
        break;

      case "about":
        addLine("=== REXDEVCYBER SECURE INTELLIGENCE DOSSIER ===", "success");
        addLine("REXDEVCYBER is a premium cybersecurity research group and development laboratory focusing on modern network vulnerabilities, bug bounty disclosures, secure compiler integrations, and custom pentesting script automation.", "output");
        addLine("Mission: To build state-of-the-art security systems and empower developers globally to craft resilient web structures.", "output");
        addLine("Operational Mode: SECURE. DEVELOP. DEFEND.", "warning");
        setLoading(false);
        break;

      case "clear":
        setHistory([]);
        setLoading(false);
        break;

      case "status":
        addLine("=== REXDEVCYBER DEFENSE MESH VITALS ===", "success");
        addLine("GATEWAY TRUST LEVEL : L7 SECURE ACCESS", "info");
        addLine("ACTIVE PROXIES      : MUTUAL_TLS OVER US-EAST-4", "info");
        addLine("FIREWALL INTEGRITY  : 100% MAXIMUM PROTECTION", "success");
        addLine("SUBNET STATUS       : ALL SECTORS NOMINAL", "success");
        addLine("ACTIVE AI INTEGRATOR: ONLINE (gemini-3.5-flash)", "warning");
        setLoading(false);
        break;

      case "exit":
        addLine("Disconnecting current SOC secure channel...", "warning");
        setTimeout(() => {
          addLine("SECURE SHELL CLOSED. rex@cyber offline.", "error");
          setLoading(false);
        }, 500);
        break;

      case "projects":
        addLine("=== CURRENTLY ACTIVE PROJECTS & CODE REPOSITORIES ===", "success");
        addLine("1. RexRecon        - Advanced multi-threaded OSINT metadata harvester. [Stars: 310 | Forks: 72]", "output");
        addLine("2. WebVulnScanner  - Custom web scanner identifying injection entrypoints. [Stars: 244 | Forks: 58]", "output");
        addLine("3. SecUtils        - Collection of security hardening modules for Linux servers. [Stars: 198 | Forks: 41]", "output");
        addLine("To view or audit, navigate to github.com/rexdevcyber/rexrecon", "info");
        setLoading(false);
        break;

      case "decrypt":
        addLine("Initializing security integrity decryption check...", "info");
        let percentage = 0;
        const interval = setInterval(() => {
          percentage += 20;
          if (percentage <= 100) {
            addLine(`[HASH RUNNER] Decrypting node clusters... ${percentage}% completed.`, "info");
          } else {
            clearInterval(interval);
            addLine("HASH INTEGRITY: VERIFIED (100% SECURE). No anomalous packet signatures detected.", "success");
            setLoading(false);
          }
        }, 300);
        break;

      case "scan":
        if (!args) {
          addLine("ERROR: You must specify a target domain or IP address (e.g. 'scan google.com')", "error");
          setLoading(false);
          break;
        }

        addLine(`Initiating REXDEVCYBER network audit scan on host: ${args}...`, "info");
        addLine("Checking firewall responses...", "info");
        addLine("Mapping host architecture...", "info");

        try {
          const response = await fetch("/api/security/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target: args, scanType: "Quick CLI Scanner" }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Target firewall or network gateway rejected scan request.");
          }

          const data = await response.json();
          addLine("-----------------------------------------------------------------", "info");
          addLine(`SCAN REPORT COMPLETED FOR TARGET: ${data.target}`, "success");
          addLine("-----------------------------------------------------------------", "info");
          
          addLine(`Open ports detected:`, "info");
          data.ports.forEach((p: any) => {
            addLine(`  [*] PORT ${p.port}/${p.service} - [STATUS: ${p.status.toUpperCase()}] - Banner: ${p.banner || "Unknown"}`, "success");
          });

          addLine(`Vulnerability overview:`, "warning");
          data.vulnerabilities.forEach((v: any) => {
            addLine(`  [!] ${v.cve}: ${v.title} [SEVERITY: ${v.severity}]`, "error");
            addLine(`      Desc: ${v.description}`, "output");
            addLine(`      Remediation: ${v.remediation}`, "success");
          });

          addLine("AI-TAILORED REMEDIATION REPORT:", "warning");
          const lines = data.remediationReport.split("\n");
          lines.forEach((line: string) => {
            if (line.trim()) {
              addLine(`  ${line}`, "output");
            }
          });

        } catch (error: any) {
          addLine(`SCAN CRITICAL FAILURE: ${error.message || "Network gateway timeout."}`, "error");
        }
        setLoading(false);
        break;

      case "ai":
        if (!args) {
          addLine("ERROR: You must ask a security question (e.g. 'ai what is a SQL injection')", "error");
          setLoading(false);
          break;
        }

        addLine(`Consulting REXDEVCYBER AI Defense Assistant: "${args}"...`, "info");
        try {
          const response = await fetch("/api/gemini/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ sender: "user", content: args }],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "AI core unavailable.");
          }

          const data = await response.json();
          addLine("--- REXDEVCYBER SECURITY AI HANDLER ---", "success");
          
          const cleanLines = data.content.split("\n");
          cleanLines.forEach((l: string) => {
            if (l.trim()) {
              addLine(l, "output");
            }
          });
        } catch (error: any) {
          addLine(`AI CONNECTIVITY ERROR: ${error.message}`, "error");
        }
        setLoading(false);
        break;

      default:
        addLine(`Command not recognized: '${primaryCmd}'. Type 'help' to review supported commands.`, "error");
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-900 bg-black/80 p-4 font-mono shadow-2xl">
      {/* CLI Header */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-900 pb-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4.5 w-4.5 text-[#ff2020] animate-pulse" />
          <span className="font-bold tracking-widest text-slate-200 font-display">REXDEVCYBER SOC CLI CONSOLE v2.0</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="h-2 w-2 rounded-full bg-[#ff2020] animate-pulse"></span>
          <span className="text-red-400 tracking-wide font-bold">CORE CONNECTED</span>
        </div>
      </div>

      {/* History lines */}
      <div className="flex-1 overflow-y-auto space-y-2 p-2 min-h-[300px] max-h-[450px] text-xs scrollbar-thin scrollbar-thumb-slate-950">
        {history.map((line, idx) => (
          <div key={idx} className="leading-relaxed">
            <span className="mr-2 text-[9px] text-slate-600">[{line.timestamp}]</span>
            {line.type === "input" && (
              <span className="text-white font-bold">{line.text}</span>
            )}
            {line.type === "info" && (
              <span className="text-cyan-400 font-medium">{line.text}</span>
            )}
            {line.type === "success" && (
              <span className="text-red-400 font-semibold">✓ {line.text}</span>
            )}
            {line.type === "warning" && (
              <span className="text-amber-400 font-bold">⚠ {line.text}</span>
            )}
            {line.type === "error" && (
              <span className="text-red-500 font-black">✗ {line.text}</span>
            )}
            {line.type === "output" && (
              <span className="text-slate-300">{line.text}</span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-red-400 animate-pulse text-[11px]">
            <RefreshCw className="h-3 w-3 animate-spin text-[#ff2020]" />
            <span>AI CORE PROCESSING PIPELINE COMMITTED...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Command Auto-Suggest Panel */}
      {matchedSuggestions.length > 0 && (
        <div className="mt-3 p-2 rounded-lg border border-red-950/40 bg-[#05070d]/95 backdrop-blur-md space-y-1.5 shadow-[0_-4px_25px_rgba(255,32,32,0.12)] select-none">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1.5 border-b border-slate-900/60 pb-1 flex justify-between items-center font-mono">
            <span>AUTO-SUGGEST UTILITIES</span>
            <span className="text-[8px] text-[#ff2020] animate-pulse">▲▼ KEYS / TAB OR CLICK TO APPLY</span>
          </div>
          <div className="flex flex-col gap-0.5 max-h-[140px] overflow-y-auto scrollbar-thin">
            {matchedSuggestions.map((cmd, idx) => {
              const isActive = idx === activeSuggestionIndex;
              return (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleSuggestionClick(cmd)}
                  onMouseEnter={() => setActiveSuggestionIndex(idx)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs flex justify-between items-center group transition-colors cursor-pointer font-mono ${
                    isActive 
                      ? "bg-red-950/30 border border-red-900/40" 
                      : "border border-transparent hover:bg-red-950/10"
                  }`}
                >
                  <span className={`font-bold transition-colors ${isActive ? "text-red-400" : "text-slate-300 group-hover:text-red-400"}`}>
                    {cmd}
                  </span>
                  <span className={`text-[10px] truncate max-w-[220px] sm:max-w-none transition-colors ${isActive ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
                    {commands[cmd as keyof typeof commands]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal Input form */}
      <form onSubmit={handleCommandSubmit} className="mt-4 flex items-center gap-2 border-t border-slate-900 pt-3">
        <span className="text-[#ff2020] font-black text-xs">rex@cyber:~#</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type 'help' for options, or 'ai <your cyber query>'..."
          className="flex-1 bg-transparent text-white outline-none placeholder-slate-800 text-xs border-none focus:ring-0 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#05070d] hover:bg-red-950/20 border border-slate-900 hover:border-red-500/20 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 transition-all cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
