import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Cpu, 
  Globe, 
  Github, 
  Twitter, 
  Youtube, 
  Activity, 
  Server, 
  Lock, 
  Unlock, 
  Database, 
  Play, 
  AlertTriangle, 
  TerminalSquare, 
  FileCode, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Check,
  Code,
  Info,
  Bug,
  Braces,
  Settings,
  HardDrive,
  History,
  Trash2,
  Clock,
  FileDown,
  FileJson,
  Download,
  Filter,
  Layout,
  BarChart3,
  Layers,
  Zap,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import Header from "./components/Header";
import ThreatMap from "./components/ThreatMap";
import Terminal from "./components/Terminal";
import ParticlesBg from "./components/ParticlesBg";
import DriveVault from "./components/DriveVault";
import { Project, SecurityScanResult } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeSocTool, setActiveSocTool] = useState<"map" | "terminal" | "scanner">("map");
  const [selectedProject, setSelectedProject] = useState<Project | null>({
    title: "RexRecon",
    description: "Advanced multi-threaded OSINT metadata harvester and target intelligence enumerator. Scans subdomains, SSL footprints, and open network vectors.",
    language: "Rust",
    stars: 310,
    forks: 72,
    type: "SecOps / OSINT"
  });
  
  // Custom states for interactive scanner
  const defaultScanHistory: SecurityScanResult[] = [
    {
      target: "vulnerable-api.internal",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ports: [
        { port: 22, service: "SSH", status: "open", banner: "OpenSSH 8.2p1 Ubuntu-4ubuntu0.5" },
        { port: 80, service: "HTTP", status: "open", banner: "Apache/2.4.41" },
        { port: 3000, service: "NodeJS", status: "open", banner: "Express/Vite Dev" }
      ],
      vulnerabilities: [
        {
          cve: "CVE-2024-9102",
          title: "SQL Injection on Auth Entrypoint",
          severity: "HIGH",
          description: "Parameter login handler allows raw SQL statements via injection payload, leading to authentication bypass.",
          remediation: "Implement prepared statements and parameterized queries for all database connection drivers."
        },
        {
          cve: "CVE-2024-4112",
          title: "Outdated SSH Host Key Exchange Weakness",
          severity: "MEDIUM",
          description: "SSH daemon supports obsolete cipher suites risking decryption or session hijacking under specific OSINT criteria.",
          remediation: "Update /etc/ssh/sshd_config to allow only strong modern HMACs and cipher algorithms."
        }
      ],
      remediationReport: `### Executive Summary: vulnerable-api.internal
Our AI security auditor has detected a critical injection vector on the authentication route. Immediate containment is advised.

### Vulnerability Assessment
- **SQL Injection**: Allows unauthorized attackers to bypass authentication layers.
- **SSH Weakness**: Outdated key exchange configurations.

### Defense Action Plan
1. **Apply Prepared Statements**: Update backend authentication router with parameterization.
2. **Harder SSH Settings**: Enforce modern SSH protocols.`,
      status: "completed"
    },
    {
      target: "corporate-sandbox.net",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ports: [
        { port: 80, service: "HTTP", status: "open", banner: "nginx/1.18.0" },
        { port: 443, service: "HTTPS", status: "open", banner: "nginx/1.18.0" }
      ],
      vulnerabilities: [
        {
          cve: "CVE-2023-35123",
          title: "HTTP Header Information Disclosure",
          severity: "LOW",
          description: "Web server exposes exact backend version details in response headers (nginx/1.18.0).",
          remediation: "Configure ServerTokens off in nginx configurations."
        }
      ],
      remediationReport: `### Executive Summary: corporate-sandbox.net
Security posture is mostly safe. Exposure is limited to low-severity version disclosure on public endpoints.

### Vulnerability Assessment
- **Information Disclosure**: HTTP header exposes explicit service signatures.

### Defense Action Plan
1. **Disable Server Banners**: Turn off detailed version telemetry in nginx configurations.`,
      status: "completed"
    }
  ];

  const [scanHistory, setScanHistory] = useState<SecurityScanResult[]>(() => {
    const saved = localStorage.getItem("rexdevcyber_scan_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({ ...item, status: item.status || "completed" }));
      } catch (e) {
        return defaultScanHistory;
      }
    }
    return defaultScanHistory;
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setContactStatus("submitting");
    try {
      await addDoc(collection(db, "contacts"), {
        ...contactForm,
        createdAt: serverTimestamp()
      });
      setContactStatus("success");
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactStatus("idle"), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setContactStatus("error");
      setTimeout(() => setContactStatus("idle"), 5000);
    }
  };

  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(() => {
    const saved = localStorage.getItem("rexdevcyber_scan_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed[0] || null;
      } catch (e) {
        return defaultScanHistory[0];
      }
    }
    return defaultScanHistory[0];
  });

  useEffect(() => {
    localStorage.setItem("rexdevcyber_scan_history", JSON.stringify(scanHistory));
  }, [scanHistory]);

  const getMaxSeverity = (res: SecurityScanResult) => {
    if (!res.vulnerabilities || res.vulnerabilities.length === 0) return "SECURE";
    const severities = res.vulnerabilities.map(v => v.severity);
    if (severities.includes("CRITICAL")) return "CRITICAL";
    if (severities.includes("HIGH")) return "HIGH";
    if (severities.includes("MEDIUM")) return "MEDIUM";
    if (severities.includes("LOW")) return "LOW";
    return "SECURE";
  };

  const handleDeleteHistoryItem = (itemToDelete: SecurityScanResult) => {
    const confirmed = window.confirm(`[MANDATE] Are you sure you want to delete the scan report for "${itemToDelete.target}" from your SOC audit history?`);
    if (!confirmed) return;
    
    setScanHistory(prev => {
      const updated = prev.filter(item => !(item.target === itemToDelete.target && item.timestamp === itemToDelete.timestamp));
      return updated;
    });

    setScanResult(current => {
      if (current && current.target === itemToDelete.target && current.timestamp === itemToDelete.timestamp) {
        return null;
      }
      return current;
    });
  };
  
  const handleExportTxt = (result: SecurityScanResult) => {
    const content = `REXDEVCYBER SECURITY AUDIT REPORT
====================================
TARGET: ${result.target}
TIMESTAMP: ${new Date(result.timestamp).toLocaleString()}
STATUS: ${result.status?.toUpperCase() || "COMPLETED"}

PORT TELEMETRY:
${result.ports.map(p => `- ${p.port}/${p.service} (${p.status}): ${p.banner || "N/A"}`).join('\n')}

VULNERABILITIES:
${result.vulnerabilities.map(v => `
[!] ${v.cve}: ${v.title}
SEVERITY: ${v.severity}
DESCRIPTION: ${v.description}
REMEDIATION: ${v.remediation}
`).join('\n')}

EXECUTIVE SUMMARY:
${result.remediationReport}

------------------------------------
REXDEVCYBER - Advanced Security Intelligence
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rexdevcyber_audit_${result.target.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = (result: SecurityScanResult) => {
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rexdevcyber_audit_${result.target.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [scanTarget, setScanTarget] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState<"Port Enumeration" | "Vulnerability Matching" | "Remediation Generation" | "Completed" | "">("");
  const [liveScanLogs, setLiveScanLogs] = useState<string[]>([]);

  // State for trust level request access demo
  const [accessLevel, setAccessLevel] = useState("GUEST");
  const [requestPending, setRequestPending] = useState(false);

  // Live Threat Status
  const [firewallStatus, setFirewallStatus] = useState("MAXIMUM");
  const [integrityScore, setIntegrityScore] = useState(100);

  // Repository database
  const initialProjects: Project[] = [
    {
      title: "RexRecon",
      description: "Advanced multi-threaded OSINT metadata harvester and target intelligence enumerator. Scans subdomains, SSL footprints, and open network vectors.",
      language: "Rust",
      stars: 310,
      forks: 72,
      type: "SecOps / OSINT"
    },
    {
      title: "WebVulnScanner",
      description: "Custom lightweight web app vulnerability scanner that locates XSS, SQL injections, and outdated dependency packages in real-time.",
      language: "Go / TypeScript",
      stars: 244,
      forks: 58,
      type: "Web PenTesting"
    },
    {
      title: "SecUtils",
      description: "A comprehensive collection of security hardening scripts, system audits, and automated iptables firewall configurations.",
      language: "Shell / Python",
      stars: 198,
      forks: 41,
      type: "System Defense"
    },
    {
      title: "ZeroTrustProxy",
      description: "Reverse proxy implementation adhering to Zero-Trust policies. Features automatic SSL termination and hardware-key mutual TLS authentication.",
      language: "Go",
      stars: 154,
      forks: 23,
      type: "Network Defense"
    }
  ];

  const quickTargets = ["security-test.rexdevcyber.com", "vulnerable-api.internal", "corporate-sandbox.net"];

  const handleRequestAccess = () => {
    setRequestPending(true);
    setTimeout(() => {
      setRequestPending(false);
      setAccessLevel("AUTHORIZED (LEVEL 7/10)");
      setIntegrityScore(100);
      setFirewallStatus("ARMED_ENCRYPTED");
    }, 1500);
  };

  const handleStartScan = async (targetToScan: string) => {
    if (!targetToScan) return;
    setScanning(true);
    setScanResult(null);
    setScanProgress(0);
    setScanStage("Port Enumeration");
    setLiveScanLogs([
      `[SYSTEM] Connecting to secure target: ${targetToScan}`,
      "[SYSTEM] Establishing socket handshake with core SOC layer...",
      "[SYSTEM] Authorization key validated. Commencing scanner engine."
    ]);

    const scanTimestamp = new Date().toISOString();
    const pendingItem: SecurityScanResult = {
      target: targetToScan,
      timestamp: scanTimestamp,
      ports: [],
      vulnerabilities: [],
      remediationReport: "",
      status: "pending"
    };
    setScanHistory(prev => [pendingItem, ...prev]);

    // Transition to running state shortly after initiation
    setTimeout(() => {
      setScanHistory(prev =>
        prev.map(item =>
          item.target === targetToScan && item.timestamp === scanTimestamp
            ? { ...item, status: "running" as const }
            : item
        )
      );
    }, 1200);

    // Pre-allocate diagnostic logs to progressively print
    const logPool = {
      ports: [
        "[PORT] Sweeping target tcp/udp port boundaries...",
        "[PORT] Port 22/SSH: Open (Banner: OpenSSH 8.2p1-Ubuntu)",
        "[PORT] Port 80/HTTP: Open (Banner: Nginx 1.18.0)",
        "[PORT] Port 443/HTTPS: Open (TLS 1.3 handshakes negotiated)",
        "[PORT] Enumeration complete. Active services mapped."
      ],
      vulns: [
        "[VULN] Querying national CVE-2026 hash registry...",
        "[VULN] Testing SSL/TLS handshakes for configuration pitfalls...",
        "[VULN] MATCH FOUND: CVE-2023-38606 Web vulnerability on ports 80/443",
        "[VULN] MATCH DISCOVERED: Cross-Site Scripting target vector on search inputs",
        "[VULN] Vulnerability index matching fully assembled."
      ],
      remed: [
        "[REMED] Compiling security context vectors into structured profiles...",
        "[REMED] Connecting with Gemini defense intelligence core...",
        "[REMED] Formulating executive-ready hotfixes and source-level mitigations..."
      ]
    };

    let progressVal = 0;
    let logsAdded = { ports: 0, vulns: 0, remed: 0 };

    const progressInterval = setInterval(() => {
      progressVal += Math.floor(Math.random() * 3) + 2; // Increments of 2% to 4%
      if (progressVal >= 98) {
        progressVal = 98;
      }
      setScanProgress(progressVal);

      // Transition stages & add logs
      if (progressVal < 35) {
        setScanStage("Port Enumeration");
        if (progressVal > 10 && logsAdded.ports === 0) {
          setLiveScanLogs(prev => [...prev, logPool.ports[0], logPool.ports[1]]);
          logsAdded.ports = 1;
        }
        if (progressVal > 25 && logsAdded.ports === 1) {
          setLiveScanLogs(prev => [...prev, logPool.ports[2], logPool.ports[3], logPool.ports[4]]);
          logsAdded.ports = 2;
        }
      } else if (progressVal < 70) {
        setScanStage("Vulnerability Matching");
        if (logsAdded.vulns === 0) {
          setLiveScanLogs(prev => [...prev, logPool.vulns[0], logPool.vulns[1]]);
          logsAdded.vulns = 1;
        }
        if (progressVal > 52 && logsAdded.vulns === 1) {
          setLiveScanLogs(prev => [...prev, logPool.vulns[2], logPool.vulns[3], logPool.vulns[4]]);
          logsAdded.vulns = 2;
        }
      } else {
        setScanStage("Remediation Generation");
        if (logsAdded.remed === 0) {
          setLiveScanLogs(prev => [...prev, logPool.remed[0], logPool.remed[1]]);
          logsAdded.remed = 1;
        }
        if (progressVal > 85 && logsAdded.remed === 1) {
          setLiveScanLogs(prev => [...prev, logPool.remed[2]]);
          logsAdded.remed = 2;
        }
      }
    }, 100);

    try {
      const response = await fetch("/api/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetToScan, scanType: "Full Web Security & Compliance Scan" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Scan request blocked or refused by firewalled endpoint.");
      }

      const data: SecurityScanResult = await response.json();

      // Ensure scanning loop transitions cleanly
      const finalizeScan = () => {
        clearInterval(progressInterval);
        setScanProgress(100);
        setScanStage("Completed");
        setLiveScanLogs(prev => [
          ...prev, 
          "[SYSTEM] Gemini AI compiler response acquired.",
          "[SYSTEM] Mitigation playbook built.", 
          "[SYSTEM] Audit scan successfully completed. Displaying report."
        ]);

        const completedData: SecurityScanResult = {
          ...data,
          status: "completed"
        };

        setScanResult(completedData);
        setScanHistory((prev) => {
          const hasPlaceholder = prev.some(item => item.target === targetToScan && (item.status === "pending" || item.status === "running"));
          if (hasPlaceholder) {
            return prev.map(item => 
              item.target === targetToScan && (item.status === "pending" || item.status === "running")
                ? completedData
                : item
            );
          } else {
            return [completedData, ...prev.filter(item => item.target !== targetToScan)];
          }
        });
        setScanning(false);
      };

      // If progress is already nearly finished, complete right away. Otherwise, wait/speed up.
      if (progressVal >= 90) {
        finalizeScan();
      } else {
        // Run a rapid catchup interval to make it feel super snappy yet fully visual
        const catchupInterval = setInterval(() => {
          progressVal += 12;
          if (progressVal >= 100) {
            clearInterval(catchupInterval);
            finalizeScan();
          } else {
            setScanProgress(Math.min(99, progressVal));
          }
        }, 60);
      }

    } catch (err: any) {
      clearInterval(progressInterval);
      setScanning(false);
      console.error(err);
      alert(err.message || "An error occurred while running the security audit.");
      setScanHistory((prev) => prev.filter(item => !(item.target === targetToScan && (item.status === "pending" || item.status === "running"))));
    }
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    // Always scroll to top when switching main views
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Additional sub-section scrolling if needed when on home tab
    if (tab === "about" && document.getElementById("about-section")) {
      document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-300 flex flex-col font-sans selection:bg-[#ff2020] selection:text-white relative overflow-hidden">
      {/* Interactive Particles Layer */}
      <ParticlesBg />

      {/* Premium Header Component */}
      <Header activeTab={activeTab} onNavClick={handleNavClick} />

      {/* Main Grid Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left Sidebar: Principal Identity Dossier */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 lg:shrink-0 select-none">
          
          {/* Identity Dossier Card */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-black/75 backdrop-blur-md relative overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            {/* Glowing accent backdrops */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff2020]/5 rounded-bl-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] text-[#ff2020] font-mono uppercase tracking-[0.25em] px-2.5 py-1 rounded bg-red-950/20 border border-red-900/30 font-bold">
                  SECURE_AGENT_DOSSIER
                </span>
                <span className="inline-flex h-2 w-2 rounded-full bg-[#ff2020] animate-pulse"></span>
              </div>

              {/* Glowing circular image frame from design template style */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full border-2 border-[#ff2020]/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,32,32,0.15)] bg-black/60 overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="absolute inset-1.5 border border-dashed border-[#ff2020]/30 rounded-full"
                  />
                  <div className="z-10 text-center flex flex-col items-center justify-center">
                    <Shield className="h-10 w-10 text-[#ff2020] drop-shadow-[0_0_8px_rgba(255,32,32,0.5)] animate-pulse" />
                    <span className="text-[8px] font-mono tracking-widest text-slate-500 mt-2">D_CORE_v4</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-display font-black tracking-wider text-white">REX DEV</h2>
                <p className="text-xs text-red-400 font-mono tracking-widest mt-0.5">CYBERSECURITY ARCHITECT</p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed text-center mb-5 border-t border-slate-900/60 pt-4 px-1 font-mono">
                Principal security researcher specialized in zero-trust mesh setups, vulnerability mitigation, and custom pentesting script automation.
              </p>

              <button 
                onClick={handleRequestAccess}
                disabled={requestPending || accessLevel !== "GUEST"}
                className={`w-full py-3 text-xs font-mono font-bold uppercase tracking-widest rounded-lg transition-all duration-300 relative cursor-pointer flex items-center justify-center gap-2 ${
                  accessLevel !== "GUEST" 
                    ? "bg-red-950/20 text-red-400 border border-red-900/40" 
                    : "bg-[#ff2020] text-white hover:bg-red-500 shadow-md shadow-red-500/10 hover:shadow-red-500/25"
                }`}
              >
                {requestPending ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    DECRYPTING KEY...
                  </>
                ) : accessLevel !== "GUEST" ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    ACCESS_GRANTED [L7]
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    REQUEST DEPLOYED ACCESS
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Vitals Stats Card */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-black/75 backdrop-blur-md relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] font-mono">
            <h3 className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-4 flex items-center justify-between border-b border-slate-950 pb-2">
              <span>SYSTEM VITALS</span>
              <Cpu className="h-4 w-4 text-[#ff2020] animate-pulse" />
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-500">GATEWAY TRUST STATUS</span>
                  <span className={`font-bold ${accessLevel === "GUEST" ? "text-red-400" : "text-emerald-400"}`}>{accessLevel}</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                  <motion.div 
                    initial={{ width: "30%" }}
                    animate={{ width: accessLevel === "GUEST" ? "30%" : "100%" }}
                    transition={{ duration: 1 }}
                    className="bg-gradient-to-r from-red-600 to-[#ff2020] h-full shadow-[0_0_8px_rgba(255,32,32,0.8)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 text-[11px] leading-relaxed">
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold">PROXY ROUTE</span>
                  <span className="font-bold text-white">MUTUAL_TLS</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold">FIREWALL</span>
                  <span className="font-bold text-red-400">{firewallStatus}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold">INTEGRITY</span>
                  <span className="font-bold text-emerald-400">{integrityScore}% SECURE</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold">SYS REGION</span>
                  <span className="font-bold text-white">US-EAST-4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Component */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-black/75 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-[10px] text-slate-400 font-mono uppercase font-black tracking-widest mb-3.5 border-b border-slate-950 pb-2">
              TECH STACK & ARMOR
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Rust", "Go", "TypeScript", "eBPF", "Kali Linux", "Burp Suite", "Nmap", "Docker"].map((tech) => (
                <span 
                  key={tech} 
                  className="px-2.5 py-1 bg-[#05070d] border border-slate-900 text-[10px] font-mono rounded text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </aside>

        {/* Right Content Area: Tabs + Display Dashboard panels */}
        <section className="flex-1 flex flex-col gap-6">

          {/* Quick Stats Grid Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-black/40 border border-slate-900 rounded-xl relative group">
              <div className="absolute top-4 right-4 text-red-500/10">
                <Database className="h-6 w-6" />
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Active Repositories</p>
              <p className="text-3xl font-display font-black text-white">42</p>
              <p className="text-[10px] text-red-400 mt-2 font-mono flex items-center gap-1.5 font-bold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff2020]"></span>
                +3 from previous cycle
              </p>
            </div>

            <div className="p-5 bg-black/40 border border-slate-900 rounded-xl relative group">
              <div className="absolute top-4 right-4 text-red-500/10">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Threats Neutralized</p>
              <p className="text-3xl font-display font-black text-white">1,209</p>
              <p className="text-[10px] text-red-500 mt-2 font-mono flex items-center gap-1.5 font-bold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                High Severity: 12 (Critical: 0)
              </p>
            </div>

            <div className="p-5 bg-black/40 border border-slate-900 rounded-xl relative group">
              <div className="absolute top-4 right-4 text-red-500/10">
                <Server className="h-6 w-6" />
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Uptime Core Score</p>
              <p className="text-3xl font-display font-black text-white">99.98%</p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono tracking-wider font-bold">STABLE / HOT-SWAPPABLE</p>
            </div>
          </div>

          {/* Interactive Navigation Content tabs */}
          <div className="border border-slate-900 bg-black/50 backdrop-blur-md rounded-xl p-1.5 flex gap-1.5 overflow-x-auto">
            {[
              { id: "home", label: "Dashboard", icon: Globe },
              { id: "terminal", label: "SOC Console", icon: TerminalIcon },
              { id: "about", label: "About Brand", icon: Info },
              { id: "tools", label: "Tech Stack", icon: Cpu },
              { id: "services", label: "Services", icon: Layout },
              { id: "projects", label: "Projects", icon: FileCode },
              { id: "scanner", label: "AI Scanner", icon: ShieldCheck },
              { id: "contact", label: "Contact", icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#ff2020] text-white shadow-md shadow-red-500/20 font-black"
                      : "text-slate-400 hover:text-white hover:bg-[#05070d]/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel render */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                
                {/* Home Panel: Live threat interceptor & streams */}
                {activeTab === "home" && (
                  <div className="space-y-12">
                    {/* Interceptor Feed */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-red-950/20 bg-red-950/5 text-xs text-slate-300 font-mono flex items-start gap-3">
                        <ShieldAlert className="h-5 w-5 text-[#ff2020] shrink-0 mt-0.5 animate-pulse" />
                        <p className="leading-relaxed">
                          <strong className="text-white uppercase tracking-wider">[SYS_SEC_UPDATE]</strong> Welcome to the REXDEVCYBER SOC Command. The live threat map below intercepts incoming dictionary probes, DDoS vectors, and port scans. Utilize the terminal or scanner tabs to command our Gemini defense intelligence.
                        </p>
                      </div>
                      <ThreatMap />
                    </div>

                    {/* SERVICES SECTION: "WHAT I DO" */}
                    <div id="services-section" className="space-y-6">
                      <div className="border-b border-slate-950 pb-3">
                        <span className="text-[10px] text-[#ff2020] font-mono uppercase tracking-[0.2em] font-bold">TACTICAL CAPABILITIES</span>
                        <h3 className="text-xl font-display font-black text-white uppercase mt-1">WHAT I DO</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Service Card 1 */}
                        <div className="p-5 rounded-xl border border-slate-900 bg-black/45 backdrop-blur-md relative overflow-hidden group hover:border-[#ff2020]/20 transition-all duration-300">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[#ff2020] shrink-0 mt-0.5">
                              <Globe className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Penetration Testing</h4>
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                controlled simulated exploits targeting cloud networks, routing structures, and API gateways to audit compliance buffers.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Service Card 2 */}
                        <div className="p-5 rounded-xl border border-slate-900 bg-black/45 backdrop-blur-md relative overflow-hidden group hover:border-[#ff2020]/20 transition-all duration-300">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[#ff2020] shrink-0 mt-0.5">
                              <ShieldCheck className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Vulnerability Research</h4>
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                Investigating static bytecodes, compilation patterns, and memory footprints to isolate logic flaws before deployment.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Service Card 3 */}
                        <div className="p-5 rounded-xl border border-slate-900 bg-black/45 backdrop-blur-md relative overflow-hidden group hover:border-[#ff2020]/20 transition-all duration-300">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[#ff2020] shrink-0 mt-0.5">
                              <Bug className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Bug Bounty Defense</h4>
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                Active collaboration on white-hat vulnerability dispatches, preventing malicious zero-day exploits through rapid mitigations.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Service Card 4 */}
                        <div className="p-5 rounded-xl border border-slate-900 bg-black/45 backdrop-blur-md relative overflow-hidden group hover:border-[#ff2020]/20 transition-all duration-300">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[#ff2020] shrink-0 mt-0.5">
                              <Braces className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Secure Engineering</h4>
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                Implementing stateful authorization filters, reverse API proxies, and custom cryptography modules built for scale.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Service Card 5 */}
                        <div className="p-5 rounded-xl border border-slate-900 bg-black/45 backdrop-blur-md relative overflow-hidden group hover:border-[#ff2020]/20 transition-all duration-300">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[#ff2020] shrink-0 mt-0.5">
                              <Settings className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">OSINT Automation</h4>
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                Writing high-velocity scrapers, subdomain enumerators, and custom metadata collectors optimized for Linux cores.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Service Card 6 */}
                        <div className="p-5 rounded-xl border border-slate-900 bg-black/45 backdrop-blur-md relative overflow-hidden group hover:border-[#ff2020]/20 transition-all duration-300">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-[#ff2020] shrink-0 mt-0.5">
                              <Lock className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Security Hardening</h4>
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                Designing zero-trust container setups, custom iptables frameworks, and hardening Linux system architectures.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ABOUT & CORE STATISTICS ROW */}
                    <div id="about-section" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Bio brief */}
                      <div className="xl:col-span-2 p-6 rounded-xl border border-slate-900 bg-black/60 backdrop-blur-md space-y-4">
                        <span className="text-[9px] text-red-400 font-mono uppercase tracking-[0.2em] font-bold">OPERATIONAL DOSSIER</span>
                        <h3 className="text-lg font-mono font-black text-white uppercase">ABOUT THE SYSTEM ARCHITECT</h3>
                        <p className="text-xs font-mono text-slate-400 leading-relaxed">
                          I am REX DEV, an active cyber intelligence architect and full-stack engineer operating at the intersection of network automation and core vulnerability exploitation. My mission is to build secure, transparent, and resilient digital architectures.
                        </p>
                        <p className="text-xs font-mono text-slate-400 leading-relaxed">
                          I maintain lightweight network scanners, and frequently audit server-side integrations against injection vectors. Through systematic testing and high-integrity code review, my focus remains on defense optimization.
                        </p>
                      </div>

                      {/* Stats widgets inspired by Image 1 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 hover:border-red-500/25 transition-all text-center">
                          <span className="block text-2xl font-mono font-black text-white">50+</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold mt-1">VULNS FOUND</span>
                        </div>
                        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 hover:border-red-500/25 transition-all text-center">
                          <span className="block text-2xl font-mono font-black text-[#ff2020]">20+</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold mt-1">CROWD AUDITS</span>
                        </div>
                        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 hover:border-red-500/25 transition-all text-center">
                          <span className="block text-2xl font-mono font-black text-white">15+</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold mt-1">REPOS BUILT</span>
                        </div>
                        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 hover:border-red-500/25 transition-all text-center">
                          <span className="block text-2xl font-mono font-black text-cyan-400">5K+</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold mt-1">FOLLOWERS</span>
                        </div>
                      </div>
                    </div>

                    {/* CONTACT INBOX MODULE */}
                    <div id="contact-section" className="p-6 rounded-xl border border-slate-900 bg-black/60 backdrop-blur-md space-y-5">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#ff2020] font-mono uppercase tracking-[0.2em] font-bold">ENCRYPTED TELEMETRY CHANNEL</span>
                        <h3 className="text-lg font-mono font-bold text-white uppercase">CONTACT COMMAND INBOX</h3>
                        <p className="text-[11px] text-slate-500 font-mono">Dispatches encrypted signals to the REXDEVCYBER core inbox.</p>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                          const msg = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
                          if (!email || !msg) return;
                          
                          alert("SECURE TRANSMISSION CONFIRMED:\nAES-256 package successfully dispatched to REXDEVCYBER core inbox.");
                          form.reset();
                        }}
                        className="space-y-4 font-mono text-xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 uppercase font-bold mb-1">CALLSIGN / NAME:</label>
                            <input 
                              type="text" 
                              required
                              placeholder="AGENT_X"
                              className="w-full bg-[#05070d] text-white px-3 py-2.5 rounded border border-slate-900 outline-none focus:border-[#ff2020] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 uppercase font-bold mb-1">SECURE_EMAIL:</label>
                            <input 
                              type="email" 
                              name="email"
                              required
                              placeholder="anonymous@protonmail.com"
                              className="w-full bg-[#05070d] text-white px-3 py-2.5 rounded border border-slate-900 outline-none focus:border-[#ff2020] transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 uppercase font-bold mb-1">ENCRYPTED CONTENT:</label>
                          <textarea 
                            rows={3}
                            name="message"
                            required
                            placeholder="Briefly state compliance requests or vulnerability dispatches..."
                            className="w-full bg-[#05070d] text-white px-3 py-2.5 rounded border border-slate-900 outline-none focus:border-[#ff2020] transition-colors resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#ff2020] hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock className="w-4 h-4" />
                          <span>DISPATCH SECURE MESSAGE</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Terminal Panel: CLI Shell */}
                {activeTab === "terminal" && (
                  <div className="space-y-4">
                    <Terminal />
                    <div className="p-4 rounded-xl border border-red-900/30 bg-red-950/10 font-mono text-[11px] text-red-400">
                      <strong>PRO-TIP:</strong> You can command the AI core directly in the console using: <code>ai &lt;your question&gt;</code> (e.g. <code>ai what is secure memory allocation?</code>) or scan local sandboxes using <code>scan corporate-sandbox.net</code>.
                    </div>
                  </div>
                )}

                {/* Repositories / Projects Panel */}
                {activeTab === "projects" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-[#ff2020] pl-3">
                          Verified Code Assets
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">SYNCED WITH GITHUB</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {initialProjects.map((p) => (
                          <div 
                            key={p.title}
                            onClick={() => setSelectedProject(p)}
                            className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                              selectedProject?.title === p.title 
                                ? "bg-black/80 border-[#ff2020] shadow-md shadow-red-500/5"
                                : "bg-black/40 border-slate-900 hover:border-slate-800 hover:bg-black/60"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-white font-mono group-hover:text-red-400 transition-colors">
                                {p.title}
                              </h4>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#05070d] text-slate-400 border border-slate-900">
                                {p.language}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                              {p.description}
                            </p>
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-900/60 pt-3">
                              <span className="text-red-400 font-bold">{p.type}</span>
                              <div className="flex items-center gap-3">
                                <span>★ {p.stars}</span>
                                <span>⑂ {p.forks}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Repository Inspector Sidebar */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-slate-800 pl-3">
                        Asset Auditor
                      </h3>
                      
                      <div className="p-5 rounded-xl border border-slate-900 bg-black/60 backdrop-blur-md min-h-[250px] flex flex-col justify-between">
                        {selectedProject ? (
                          <div className="space-y-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4.5 w-4.5 text-[#ff2020]" />
                                <h4 className="text-sm font-bold font-mono text-white">{selectedProject.title}</h4>
                              </div>
                              <span className="inline-block text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900 mb-3">
                                Verified Secure Release
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {selectedProject.description}
                              </p>
                            </div>

                            <div className="space-y-2 py-3 border-y border-slate-900 font-mono text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Security Rating</span>
                                <span className="text-red-400 font-bold">A+ (STATIC AUDIT PASS)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Vulnerabilities</span>
                                <span className="text-red-400 font-bold">0 Active</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Fuzzing Integrity</span>
                                <span className="text-slate-300 font-bold">100% Core coverage</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <a 
                                href={`https://github.com/rexdevcyber/${selectedProject.title.toLowerCase()}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded text-center text-xs text-white font-mono transition-all flex items-center justify-center gap-1.5"
                              >
                                <Github className="h-3.5 w-3.5" /> Source
                              </a>
                              <button 
                                onClick={() => {
                                  setActiveTab("scanner");
                                  setScanTarget(selectedProject.title.toLowerCase() + ".internal");
                                  handleStartScan(selectedProject.title.toLowerCase() + ".internal");
                                }}
                                className="flex-1 py-2 bg-[#ff2020] hover:bg-red-500 rounded text-center text-xs text-white font-mono font-bold transition-all cursor-pointer"
                              >
                                Audit API
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-8">
                            <Info className="h-8 w-8 text-slate-700 mb-2" />
                            <p className="text-xs">Select any repository to review active source audits, package structures, and security stats.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Services Portfolio View */}
                {activeTab === "services" && (
                  <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-display font-black text-white tracking-tight">PROFESSIONAL SERVICES</h2>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">Advanced Cybersecurity, Web Development & AI Solutions</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded border border-emerald-400/20">CAPACITY: 92%</span>
                        <button className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[10px] px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(255,32,32,0.2)]">
                          REQUEST QUOTE
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* 1. Cybersecurity Services */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group">
                        <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Shield className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">Cybersecurity</h3>
                        <ul className="space-y-2">
                          {[
                            "Penetration Testing (Web, Mobile, API)",
                            "Vulnerability Assessment (VAPT)",
                            "Network Security Assessment",
                            "Cloud Security (AWS, Azure, GCP)",
                            "Security Audits",
                            "Incident Response & Digital Forensics",
                            "Threat Hunting & Malware Analysis",
                            "Security Awareness Training"
                          ].map(item => (
                            <li key={item} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. Development Services */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group">
                        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Code className="h-6 w-6 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">Development</h3>
                        <ul className="space-y-2">
                          {[
                            "Custom Website Development",
                            "Web Application Development",
                            "Mobile App Development",
                            "REST API Development",
                            "Automation Scripts (Python, Bash, PS)",
                            "DevSecOps Integration",
                            "CI/CD Pipeline Security"
                          ].map(item => (
                            <li key={item} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Infrastructure & Cloud */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Server className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">Infrastructure</h3>
                        <ul className="space-y-2">
                          {[
                            "Linux Server Administration",
                            "Docker & Kubernetes Deployment",
                            "VPN & Firewall Configuration",
                            "Web Hosting & Domain Management",
                            "Cloud Migration & Optimization"
                          ].map(item => (
                            <li key={item} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-purple-400 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 4. AI & Automation */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Zap className="h-6 w-6 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">AI & Automation</h3>
                        <ul className="space-y-2">
                          {[
                            "AI Chatbots & Virtual Assistants",
                            "AI Security Assistant",
                            "SOC Automation & Response",
                            "Security Monitoring Dashboards",
                            "Log Analysis & SIEM Integration"
                          ].map(item => (
                            <li key={item} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 5. Digital Services */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Layout className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">Digital Services</h3>
                        <ul className="space-y-2">
                          {[
                            "Portfolio Website Design",
                            "Corporate Website Development",
                            "UI/UX Design & Prototyping",
                            "SEO Optimization & Analytics",
                            "Website Maintenance & Support"
                          ].map(item => (
                            <li key={item} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-emerald-400 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 6. Consulting */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <BarChart3 className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">Consulting</h3>
                        <ul className="space-y-2">
                          {[
                            "Cybersecurity Strategy & Roadmap",
                            "Risk Assessment & Management",
                            "Compliance Support (ISO, NIST, PCI)",
                            "Startup Security Consulting",
                            "Security Architecture Review"
                          ].map(item => (
                            <li key={item} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom CTA / Banner */}
                    <div className="p-8 rounded-3xl border border-slate-900 bg-gradient-to-br from-slate-950 to-black relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Layers className="h-32 w-32" />
                      </div>
                      <div className="relative z-10 max-w-2xl space-y-4">
                        <h3 className="text-xl font-bold text-white">Need a custom solution for your enterprise?</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          REXDEVCYBER specializes in bridging the gap between cutting-edge development and rigorous security standards. Our team is ready to help you Secure, Build, and Innovate your next big project.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <button className="px-6 py-2.5 bg-white text-black font-bold font-mono text-[10px] rounded-lg hover:bg-slate-200 transition-all">
                            SCHEDULE DISCOVERY CALL
                          </button>
                          <span className="text-[10px] font-mono text-slate-500">Available Mon-Fri, 09:00 - 18:00 UTC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* About Rexdevcyber View */}
                {activeTab === "about" && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {/* Hero Branding */}
                    <div className="relative p-12 rounded-[2rem] border border-slate-900 bg-gradient-to-br from-slate-950 via-black to-slate-950 overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
                      <div className="relative z-10 text-center space-y-6">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.8 }}
                          className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 mb-4"
                        >
                          <Shield className="h-10 w-10 text-red-600" />
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase italic">
                          REXDEV<span className="text-red-600">CYBER</span>
                        </h1>
                        <p className="text-sm font-mono text-slate-400 max-w-3xl mx-auto leading-relaxed tracking-wide">
                          Rexdevcyber is a technology and cybersecurity brand focused on building secure, scalable, and innovative digital solutions. We combine cybersecurity expertise, software development, cloud technologies, and AI-powered automation to help businesses and individuals strengthen their digital presence while reducing cyber risks.
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-4">
                          <div className="h-[1px] w-12 bg-slate-800"></div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">Secure. Build. Innovate.</span>
                          <div className="h-[1px] w-12 bg-slate-800"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column: Mission, Vision & Philosophy */}
                      <div className="lg:col-span-2 space-y-8">
                        <div className="p-8 rounded-2xl border border-slate-900 bg-black/40 backdrop-blur-sm space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <span className="h-8 w-1 bg-red-600 rounded-full"></span>
                                MISSION
                              </h3>
                              <p className="text-sm text-slate-400 leading-relaxed">
                                To provide advanced cybersecurity and software engineering solutions that empower organizations to innovate with confidence.
                              </p>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <span className="h-8 w-1 bg-cyan-500 rounded-full"></span>
                                VISION
                              </h3>
                              <p className="text-sm text-slate-400 leading-relaxed">
                                To become a trusted global technology partner recognized for excellence in cybersecurity, secure software development, and digital innovation.
                              </p>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-slate-900 space-y-4">
                            <h3 className="text-lg font-bold text-white font-mono">Our Approach</h3>
                            <p className="text-sm text-slate-400 leading-relaxed italic">
                              "At Rexdevcyber, security is integrated into every stage of development—from planning and design to deployment and continuous monitoring. Our approach emphasizes innovation, transparency, and industry best practices to build resilient digital environments."
                            </p>
                          </div>
                        </div>

                        {/* Core Values Grid */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.25em] pl-2">CORE VALUES</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              { title: "Security First", color: "bg-red-500/10 text-red-500 border-red-500/20" },
                              { title: "Innovation", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                              { title: "Integrity", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                              { title: "Excellence", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                              { title: "Continuous Learning", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                              { title: "Customer Success", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
                            ].map((value) => (
                              <div key={value.title} className={`p-4 rounded-xl border ${value.color} text-center font-mono font-bold text-[10px] tracking-wider uppercase group hover:scale-105 transition-transform cursor-default`}>
                                {value.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Specialization List */}
                      <div className="space-y-6">
                        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/50">
                          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-6 pb-2 border-b border-slate-900">SPECIALIZATIONS</h4>
                          <ul className="space-y-4">
                            {[
                              "Cybersecurity Assessments & Penetration Testing",
                              "Vulnerability Assessment and Risk Analysis",
                              "Secure Web & API Development",
                              "Cloud Security & Infrastructure",
                              "DevSecOps & Automation",
                              "AI-Powered Security Solutions",
                              "Digital Forensics & Incident Response",
                              "Security Consulting & Compliance"
                            ].map((spec) => (
                              <li key={spec} className="flex items-center gap-3 group">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-600 group-hover:scale-150 transition-transform"></div>
                                <span className="text-[11px] text-slate-400 font-mono group-hover:text-white transition-colors leading-tight">{spec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-6 rounded-2xl border border-red-900/30 bg-red-950/5 text-center space-y-4">
                          <p className="text-[10px] font-mono text-red-400/80 uppercase">Est.</p>
                          <p className="text-2xl font-display font-black text-white">2024</p>
                          <p className="text-[9px] font-mono text-slate-500 leading-tight">Empowering organizations to innovate with confidence.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tools & Technologies View */}
                {activeTab === "tools" && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">
                          TOOLS <span className="text-red-600">&</span> TECHNOLOGIES
                        </h2>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Advanced Stack & Security Arsenal</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
                        <span className="text-[9px] font-mono text-slate-400">UPDATED: 2024.Q4</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* 1. Cybersecurity Arsenal */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <ShieldAlert className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Shield className="h-5 w-5 text-red-500" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-mono">Cybersecurity</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Kali Linux", "Metasploit", "Burp Suite", "Nmap", "Wireshark", 
                            "OWASP ZAP", "Nessus", "OpenVAS", "Nikto", "SQLMap", 
                            "Hydra", "John the Ripper", "Hashcat", "Snort", "Splunk"
                          ].map(tool => (
                            <span key={tool} className="text-[10px] font-mono px-2 py-1 bg-slate-950/80 border border-slate-900 text-slate-400 rounded-md group-hover:border-red-500/30 group-hover:text-red-400 transition-all">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 2. Languages & Development */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Code className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileCode className="h-5 w-5 text-cyan-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-mono">Programming</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Python", "TypeScript", "JavaScript", "PHP", "Java", "C++", 
                            "Go", "Rust", "Bash", "PowerShell"
                          ].map(lang => (
                            <span key={lang} className="text-[10px] font-mono px-2 py-1 bg-slate-950/80 border border-slate-900 text-slate-400 rounded-md group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-all">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 3. Web Frameworks */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Globe className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Layout className="h-5 w-5 text-emerald-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-mono">Frontend & Backend</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "React", "Next.js", "Vue.js", "Node.js", "Express.js", 
                            "Django", "FastAPI", "Laravel", "Tailwind CSS", "Bootstrap"
                          ].map(web => (
                            <span key={web} className="text-[10px] font-mono px-2 py-1 bg-slate-950/80 border border-slate-900 text-slate-400 rounded-md group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">
                              {web}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 4. Databases & Storage */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Database className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Database className="h-5 w-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-mono">Databases</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Firebase"
                          ].map(db => (
                            <span key={db} className="text-[10px] font-mono px-2 py-1 bg-slate-950/80 border border-slate-900 text-slate-400 rounded-md group-hover:border-purple-500/30 group-hover:text-purple-400 transition-all">
                              {db}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 5. Cloud & Infrastructure */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Server className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Server className="h-5 w-5 text-blue-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-mono">Infrastructure</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "AWS", "Azure", "GCP", "Cloudflare", "Docker", "Kubernetes", 
                            "Terraform", "Ansible", "Nginx", "Apache"
                          ].map(cloud => (
                            <span key={cloud} className="text-[10px] font-mono px-2 py-1 bg-slate-950/80 border border-slate-900 text-slate-400 rounded-md group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                              {cloud}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 6. AI & Monitoring */}
                      <div className="p-6 rounded-2xl border border-slate-900 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Zap className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-mono">AI & Monitoring</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "OpenAI", "Ollama", "LangChain", "n8n", "Make", 
                            "Grafana", "Prometheus", "ELK Stack", "Uptime Kuma"
                          ].map(ai => (
                            <span key={ai} className="text-[10px] font-mono px-2 py-1 bg-slate-950/80 border border-slate-900 text-slate-400 rounded-md group-hover:border-amber-500/30 group-hover:text-amber-400 transition-all">
                              {ai}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/20 flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 space-y-4">
                        <h4 className="text-xl font-bold text-white">Versatility & Selection</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                          We select the right technologies for each project, combining secure development practices, automation, cloud-native architecture, and continuous monitoring to deliver resilient, scalable, and future-ready solutions.
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-black text-white">50+</p>
                          <p className="text-[9px] font-mono text-slate-500 uppercase">Tools Deployed</p>
                        </div>
                        <div className="h-8 w-px bg-slate-900"></div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-white">100%</p>
                          <p className="text-[9px] font-mono text-slate-500 uppercase">Secure Stack</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact View */}
                {activeTab === "contact" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="p-12 rounded-[2rem] border border-slate-900 bg-gradient-to-br from-slate-950 via-black to-slate-950 text-center space-y-6">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 mb-2">
                        <Mail className="h-8 w-8 text-red-600" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic">
                        GET IN <span className="text-red-600">TOUCH</span>
                      </h2>
                      <p className="text-slate-400 max-w-2xl mx-auto font-mono text-sm leading-relaxed">
                        Have a project in mind or need a security audit? Dispatches encrypted signals to the REXDEVCYBER core inbox.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="p-8 rounded-2xl border border-slate-900 bg-black/40 backdrop-blur-sm space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-white font-mono flex items-center gap-3">
                            <span className="h-6 w-1 bg-red-600 rounded-full"></span>
                            CONTACT INFORMATION
                          </h3>
                          <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-4 group">
                              <div className="h-10 w-10 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-500 group-hover:text-red-500 transition-colors">
                                <Mail className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase">Email</p>
                                <p className="text-sm text-white font-mono">contact@rexdevcyber.com</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="h-10 w-10 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase">Twitter / X</p>
                                <p className="text-sm text-white font-mono">@rexdevcyber</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="h-10 w-10 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors">
                                <Github className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase">GitHub</p>
                                <p className="text-sm text-white font-mono">github.com/rexdevcyber</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-xl border border-red-900/20 bg-red-950/5">
                          <p className="text-[10px] font-mono text-slate-400 leading-relaxed italic">
                            "Secure. Build. Innovate. We are ready to help you navigate the complex digital landscape with confidence."
                          </p>
                        </div>
                      </div>

                      <div className="p-8 rounded-2xl border border-slate-900 bg-black/40 backdrop-blur-sm">
                        <form 
                          onSubmit={handleContactSubmit}
                          className="space-y-5"
                        >
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold px-1">Callsign / Name</label>
                            <input 
                              type="text" 
                              placeholder="Enter your name"
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              required
                              disabled={contactStatus === "submitting"}
                              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:border-red-600 outline-none transition-all font-mono disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold px-1">Secure Email</label>
                            <input 
                              type="email" 
                              placeholder="your@email.com"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              required
                              disabled={contactStatus === "submitting"}
                              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:border-red-600 outline-none transition-all font-mono disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold px-1">Message Body</label>
                            <textarea 
                              rows={4}
                              placeholder="State your request..."
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              required
                              disabled={contactStatus === "submitting"}
                              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:border-red-600 outline-none transition-all font-mono resize-none disabled:opacity-50"
                            />
                          </div>
                          
                          {contactStatus === "success" && (
                            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20 animate-in fade-in zoom-in duration-300">
                              <CheckCircle2 className="h-4 w-4" />
                              SECURE TRANSMISSION CONFIRMED: AES-256 DISPATCH SUCCESSFUL
                            </div>
                          )}

                          {contactStatus === "error" && (
                            <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] bg-red-500/5 p-3 rounded-lg border border-red-500/20 animate-in fade-in zoom-in duration-300">
                              <AlertCircle className="h-4 w-4" />
                              TRANSMISSION FAILED: UPLINK ERROR DETECTED
                            </div>
                          )}

                          <button 
                            type="submit"
                            disabled={contactStatus === "submitting"}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,32,32,0.15)] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {contactStatus === "submitting" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                ENCRYPTING & DISPATCHING...
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                DISPATCH ENCRYPTED MESSAGE
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Cyber Scanner Panel */}
                {activeTab === "scanner" && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Recent Audit History Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="p-4 rounded-xl border border-slate-900 bg-black/60 backdrop-blur-md font-mono relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col gap-3 border-b border-slate-950 pb-3 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <History className="h-4 w-4 shrink-0 animate-pulse" />
                              RECENT AUDITS
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-950/80 border border-slate-900">
                              {scanHistory.filter(item => severityFilter === "ALL" || getMaxSeverity(item) === severityFilter).length} / {scanHistory.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg border border-slate-900 px-2 py-1.5">
                            <Filter className="h-3 w-3 text-slate-500" />
                            <select 
                              value={severityFilter}
                              onChange={(e) => setSeverityFilter(e.target.value)}
                              className="bg-transparent text-[10px] text-slate-400 font-mono outline-none w-full cursor-pointer hover:text-white transition-colors"
                            >
                              <option value="ALL">ALL LEVELS</option>
                              <option value="CRITICAL">CRITICAL</option>
                              <option value="HIGH">HIGH</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="LOW">LOW</option>
                              <option value="SECURE">SECURE</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
                          {scanHistory.filter(item => severityFilter === "ALL" || getMaxSeverity(item) === severityFilter).length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-[10px] space-y-2">
                              <Info className="h-6 w-6 text-slate-700 mx-auto" />
                              <p>{severityFilter === "ALL" ? "No previous audits recorded." : `No audits found with ${severityFilter} severity.`}</p>
                            </div>
                          ) : (
                            scanHistory
                              .filter(item => severityFilter === "ALL" || getMaxSeverity(item) === severityFilter)
                              .map((item, idx) => {
                              const maxSev = getMaxSeverity(item);
                              const isSelected = scanResult?.target === item.target && scanResult?.timestamp === item.timestamp;
                              
                              let badgeColor = "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30";
                              let badgeText = maxSev;

                              if (item.status === "pending") {
                                badgeColor = "bg-amber-950/25 text-amber-500 border border-amber-900/40 animate-pulse";
                                badgeText = "PENDING";
                              } else if (item.status === "running") {
                                badgeColor = "bg-cyan-950/25 text-cyan-400 border border-cyan-900/40 animate-pulse";
                                badgeText = "RUNNING";
                              } else {
                                if (maxSev === "CRITICAL") badgeColor = "bg-red-950/40 text-red-500 border border-red-900/40";
                                else if (maxSev === "HIGH") badgeColor = "bg-red-950/20 text-[#ff2020] border border-red-900/30";
                                else if (maxSev === "MEDIUM") badgeColor = "bg-amber-950/20 text-amber-400 border border-amber-900/30";
                                else if (maxSev === "LOW") badgeColor = "bg-cyan-950/20 text-cyan-400 border border-cyan-900/30";
                              }

                              return (
                                <div
                                  key={`${item.target}-${item.timestamp}-${idx}`}
                                  className={`group relative p-3 rounded-lg border text-left transition-all duration-200 ${
                                    isSelected 
                                      ? "border-[#ff2020]/50 bg-red-950/5 shadow-[0_0_12px_rgba(255,32,32,0.05)]" 
                                      : "border-slate-950 bg-[#05070d]/40 hover:border-slate-800 hover:bg-[#05070d]/80"
                                  } ${
                                    item.status === "pending" || item.status === "running"
                                      ? "border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_10px_rgba(6,182,212,0.1)] animate-pulse"
                                      : scanning 
                                        ? "opacity-50 pointer-events-none" 
                                        : "cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (!scanning && item.status !== "pending" && item.status !== "running") {
                                      setScanResult(item);
                                      setScanTarget(item.target);
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-1.5 mb-1">
                                    <span className="text-[11px] font-bold text-white truncate max-w-[120px] block group-hover:text-[#ff2020] transition-colors">
                                      {item.target}
                                    </span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeColor} shrink-0`}>
                                      {badgeText}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <span className={`h-1.5 w-1.5 rounded-full ${
                                        item.status === "pending"
                                          ? "bg-amber-400 animate-pulse"
                                          : item.status === "running"
                                            ? "bg-cyan-400 animate-pulse"
                                            : "bg-emerald-500"
                                      }`} />
                                      <span className="text-[8px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                                        {item.status || "completed"}
                                      </span>
                                    </span>
                                  </div>

                                  {/* Delete Button */}
                                  {item.status !== "pending" && item.status !== "running" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHistoryItem(item);
                                      }}
                                      className="absolute right-2 top-2 p-1 rounded bg-slate-950/80 border border-slate-900 text-slate-500 hover:text-red-500 hover:border-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                                      title="Purge audit from history"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main Scanner Section */}
                    <div className="lg:col-span-3 space-y-6">
                      <div className="p-6 rounded-xl border border-slate-900 bg-black/60 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-red-500/5">
                        <Shield className="h-16 w-16" />
                      </div>

                      <div className="max-w-xl relative z-10">
                        <h3 className="text-lg font-bold text-white mb-2 font-mono flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-red-400 animate-pulse" />
                          REXDEVCYBER Vulnerability & Remediation scanner
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                          Our real-time AI security engine targets network ports, parses response banners, isolates potential injection targets, and requests the Gemini intelligence stack to draft immediate remediation steps.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                            <input
                              type="text"
                              value={scanTarget}
                              onChange={(e) => setScanTarget(e.target.value)}
                              placeholder="Enter target domain or IP (e.g., scan-me.com)..."
                              className="w-full bg-[#05070d] text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-900 text-xs font-mono outline-none focus:border-[#ff2020] transition-colors"
                            />
                          </div>
                          <button
                            onClick={() => handleStartScan(scanTarget)}
                            disabled={scanning || !scanTarget}
                            className="bg-[#ff2020] text-white font-mono font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-lg hover:bg-red-500 transition-all shadow-md shadow-red-500/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {scanning ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                SCANNING_CORE...
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 fill-white" />
                                TRIGGER_SCAN
                              </>
                            )}
                          </button>
                        </div>

                        {/* Quick preset targets */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                          <span className="text-slate-500 uppercase font-bold">Quick Sandbox Presets:</span>
                          {quickTargets.map((qt) => (
                            <button
                              key={qt}
                              onClick={() => {
                                setScanTarget(qt);
                                handleStartScan(qt);
                              }}
                              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 hover:border-red-500/30 border border-slate-900 rounded text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                            >
                              {qt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scan Output Render */}
                    {scanning && (
                      <div className="p-6 rounded-xl border border-red-950/30 bg-black/80 backdrop-blur-md relative overflow-hidden space-y-6">
                        {/* Glowing accent backdrops */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2020]/5 rounded-bl-full blur-2xl pointer-events-none animate-pulse"></div>

                        {/* Top Header section: Stage text & percentage */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
                          <div>
                            <span className="text-[10px] text-[#ff2020] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-red-950/20 border border-red-900/30 font-bold mb-2 inline-block animate-pulse">
                              AUDIT IN PROGRESS
                            </span>
                            <h4 className="text-xl font-display font-black tracking-wide text-white">
                              ACTIVE RECON: <span className="text-[#ff2020]">{scanTarget}</span>
                            </h4>
                          </div>
                          
                          <div className="text-right flex items-center gap-4">
                            <div className="font-mono text-left sm:text-right">
                              <span className="block text-[10px] text-slate-500 uppercase">CURRENT STAGE</span>
                              <span className="text-[#ff2020] font-bold tracking-wider">{scanStage.toUpperCase()}</span>
                            </div>
                            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2 min-w-[70px] text-center">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase">PROGRESS</span>
                              <span className="text-xl font-mono font-black text-white">{scanProgress}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="space-y-2">
                          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-900/80 p-0.5 relative">
                            {/* Scanning dynamic progress fill */}
                            <motion.div 
                              initial={{ width: "0%" }}
                              animate={{ width: `${scanProgress}%` }}
                              transition={{ duration: 0.1 }}
                              className="bg-gradient-to-r from-red-800 to-[#ff2020] h-full rounded-full shadow-[0_0_12px_rgba(255,32,32,0.8)] relative"
                            >
                              {/* Dynamic stripe scanline effect */}
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem] animate-[pulse_1.5s_infinite]"></div>
                            </motion.div>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>0% INITIALIZATION</span>
                            <span>50% COMPILING MATCHES</span>
                            <span>100% REPORT DISPATCH</span>
                          </div>
                        </div>

                        {/* Three Stage Status Checklist Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Stage 1: Port Enumeration */}
                          <div className={`p-4 rounded-xl border transition-all duration-300 ${
                            scanProgress >= 35 
                              ? "bg-red-950/5 border-red-900/20" 
                              : scanProgress > 0 
                              ? "bg-black/60 border-[#ff2020]/40 shadow-[0_0_15px_rgba(255,32,32,0.05)]" 
                              : "bg-black/20 border-slate-900 opacity-60"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-slate-500 font-bold">STAGE 01</span>
                              {scanProgress >= 35 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                                  <Check className="h-3 w-3" /> PASSED
                                </span>
                              ) : scanProgress > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#ff2020] bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded animate-pulse">
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin" /> ENUMERATING
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-600">PENDING</span>
                              )}
                            </div>
                            <h5 className="text-xs font-mono font-black text-white">Port Enumeration</h5>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Probing active sockets, network interfaces, and identifying responding software headers.
                            </p>
                          </div>

                          {/* Stage 2: Vulnerability Matching */}
                          <div className={`p-4 rounded-xl border transition-all duration-300 ${
                            scanProgress >= 70 
                              ? "bg-red-950/5 border-red-900/20" 
                              : scanProgress >= 35 
                              ? "bg-black/60 border-[#ff2020]/40 shadow-[0_0_15px_rgba(255,32,32,0.05)]" 
                              : "bg-black/20 border-slate-900 opacity-60"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-slate-500 font-bold">STAGE 02</span>
                              {scanProgress >= 70 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                                  <Check className="h-3 w-3" /> ANALYSIS COMPLETED
                                </span>
                              ) : scanProgress >= 35 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#ff2020] bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded animate-pulse">
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin" /> MATCHING
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-600">AWAITING STAGE 1</span>
                              )}
                            </div>
                            <h5 className="text-xs font-mono font-black text-white">Vulnerability Matching</h5>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Parsing signatures against online databases to map targets to documented vulnerabilities.
                            </p>
                          </div>

                          {/* Stage 3: Remediation Generation */}
                          <div className={`p-4 rounded-xl border transition-all duration-300 ${
                            scanProgress >= 100 
                              ? "bg-red-950/5 border-red-900/20" 
                              : scanProgress >= 70 
                              ? "bg-black/60 border-[#ff2020]/40 shadow-[0_0_15px_rgba(255,32,32,0.05)]" 
                              : "bg-black/20 border-slate-900 opacity-60"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-slate-500 font-bold">STAGE 03</span>
                              {scanProgress >= 100 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                                  <Check className="h-3 w-3" /> COMPILED
                                </span>
                              ) : scanProgress >= 70 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#ff2020] bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded animate-pulse">
                                  <Sparkles className="h-2.5 w-2.5 animate-bounce" /> FORMULATING
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-600">AWAITING STAGE 2</span>
                              )}
                            </div>
                            <h5 className="text-xs font-mono font-black text-white">Remediation Generation</h5>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Drafting custom defensive scripts, code updates, and compliance recommendations.
                            </p>
                          </div>
                        </div>

                        {/* Cyber Console Live Log Output Stream */}
                        <div className="rounded-xl border border-slate-900 bg-black p-5 font-mono space-y-3 relative overflow-hidden shadow-inner">
                          {/* Inner grid indicator backdrop */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,32,32,0.02),transparent_70%)] pointer-events-none"></div>
                          
                          <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-900 pb-2.5 relative z-10">
                            <span className="font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2020]"></span>
                              LIVE TELEMETRY STREAM
                            </span>
                            <span>SYS_SEC_KERN: ESTABLISHED</span>
                          </div>

                          <div className="h-40 overflow-y-auto space-y-2 text-[11px] pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-text relative z-10">
                            {liveScanLogs.map((log, index) => {
                              const isSystem = log.startsWith("[SYSTEM]");
                              const isPort = log.startsWith("[PORT]");
                              const isVuln = log.startsWith("[VULN]");
                              const isRemed = log.startsWith("[REMED]");
                              
                              let textColor = "text-slate-400";
                              if (isSystem) textColor = "text-red-400 font-bold";
                              else if (isPort) textColor = "text-cyan-400";
                              else if (isVuln) textColor = "text-[#ff2020]";
                              else if (isRemed) textColor = "text-amber-400";

                              return (
                                <div key={index} className={`flex gap-3 leading-relaxed ${textColor}`}>
                                  <span className="text-slate-600 select-none">[{index + 1}]</span>
                                  <span>{log}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {!scanning && scanResult && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Port and Telemetry Panel */}
                        <div className="lg:col-span-1 rounded-xl border border-slate-900 bg-black/60 p-5 font-mono">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
                            ENDPOINT TELEMETRY
                          </h4>

                          <div className="space-y-4">
                            <div className="text-xs">
                              <span className="block text-slate-500 text-[10px]">TARGET HOST</span>
                              <span className="text-white font-bold">{scanResult.target}</span>
                            </div>
                            <div className="text-xs">
                              <span className="block text-slate-500 text-[10px]">SCAN STAMP</span>
                              <span className="text-slate-300">{new Date(scanResult.timestamp).toLocaleTimeString()}</span>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-slate-900">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase mb-2">OPEN ENDPOINTS</span>
                              {scanResult.ports.map((p) => (
                                <div key={p.port} className="flex items-center justify-between p-2 rounded bg-slate-950/50 text-[10px] border border-slate-900">
                                  <div>
                                    <span className="text-[#ff2020] font-bold">{p.port}/{p.service}</span>
                                    <p className="text-slate-500 text-[9px] truncate max-w-[150px]">{p.banner || "No banner response"}</p>
                                  </div>
                                  <span className="text-[9px] px-1 bg-red-950/40 border border-red-900/30 text-red-400 uppercase font-semibold">
                                    {p.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Audit Report and Action Plan */}
                        <div className="lg:col-span-2 rounded-xl border border-slate-900 bg-black/60 backdrop-blur-md p-5">
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2 flex items-center justify-between">
                            <span>VULNERABILITY ASSESSMENT REPORT</span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleExportTxt(scanResult)}
                                className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-red-500/30 rounded text-[9px] text-slate-400 hover:text-red-400 transition-all cursor-pointer font-bold"
                              >
                                <FileDown className="h-3 w-3" /> TXT
                              </button>
                              <button 
                                onClick={() => handleExportJson(scanResult)}
                                className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-cyan-500/30 rounded text-[9px] text-slate-400 hover:text-cyan-400 transition-all cursor-pointer font-bold"
                              >
                                <FileJson className="h-3 w-3" /> JSON
                              </button>
                              <span className="text-[10px] text-red-400 font-bold ml-2">AI COMPILED</span>
                            </div>
                          </h4>

                          <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed font-mono">
                            <div className="mb-6 space-y-3">
                              {scanResult.vulnerabilities.map((v) => (
                                <div key={v.cve} className="p-3.5 rounded-lg border border-red-950/30 bg-red-950/5">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-red-400 font-bold uppercase tracking-wider text-[11px] font-sans">
                                      [!] {v.cve} : {v.title}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-950/40 text-red-400 border border-red-900/30">
                                      {v.severity}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-xs mb-2 leading-relaxed">{v.description}</p>
                                  <div className="bg-[#05070d] p-2.5 rounded border border-slate-900 text-[#ff2020] font-mono text-[10px]">
                                    <strong className="text-slate-400 font-sans">REMEDIATION:</strong> {v.remediation}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-black/40 border border-slate-900 p-4 rounded-xl text-slate-300 overflow-x-auto">
                              <h5 className="font-bold text-white mb-2 flex items-center gap-1.5 font-sans">
                                <Sparkles className="h-3.5 w-3.5 text-red-400" />
                                Executive Mitigation & Action Report:
                              </h5>
                              <div className="whitespace-pre-wrap leading-relaxed text-[11px] text-slate-400 font-sans">
                                {scanResult.remediationReport}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

                {/* Secure Google Drive Vault Panel */}
                {activeTab === "drive" && (
                  <div className="space-y-6">
                    <DriveVault />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </section>

      </main>

      {/* Bottom Status Bar matching Elegant Dark styling */}
      <footer className="h-10 mt-auto border-t border-slate-950 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 text-[10px] text-slate-500 font-mono relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff2020] animate-pulse"></div>
            <span>GATEWAY: CONNECTED</span>
          </div>
          <span className="hidden sm:inline">LATENCY: 24ms</span>
          <span className="hidden sm:inline font-bold text-slate-600">ENCODING: AES-256-GCM</span>
        </div>
        <div className="flex items-center gap-4">
          <span>SECURE_SESSION_MAX</span>
          <span className="text-red-500 font-bold">v4.2.0-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
